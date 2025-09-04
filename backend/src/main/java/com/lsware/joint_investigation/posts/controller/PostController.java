package com.lsware.joint_investigation.posts.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;

import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.lsware.joint_investigation.common.dto.ApiResponse;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.file.service.FileService;
import com.lsware.joint_investigation.posts.dto.PostDto;
import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.entity.PostAttachment;
import com.lsware.joint_investigation.posts.repository.PostRepository;
import com.lsware.joint_investigation.posts.repository.PostViewRepository;
import com.lsware.joint_investigation.posts.service.PostViewService;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

        private final PostRepository postRepository;
        private final UserRepository userRepository;
        private final PostViewRepository postViewRepository;
        private final PostViewService postViewService;
        private final FileService fileService;

        @GetMapping
        public ResponseEntity<MappingJacksonValue> getPosts(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(required = false) Post.BOARD_TYPE boardType) {

                Pageable pageable = PageRequest.of(page, size);
                Page<Post> postPage;

                if (boardType != null) {
                        postPage = postRepository.findByBoardType(boardType, pageable);
                } else {
                        postPage = postRepository.findAll(pageable);
                }

                List<PostDto> dtos = postPage.getContent().stream()
                                .map(post -> {
                                        long viewCount = postViewRepository.countByPost(post);
                                        int attachmentCount = post.getAttachments() != null
                                                        ? post.getAttachments().size()
                                                        : 0;
                                        return PostDto.fromEntity(post, viewCount, attachmentCount);
                                })
                                .toList();

                // Pagination metadata
                Map<String, Object> meta = new HashMap<>();
                meta.put("currentPage", postPage.getNumber());
                meta.put("pageSize", postPage.getSize());
                meta.put("totalItems", postPage.getTotalElements());
                meta.put("totalPages", postPage.getTotalPages());
                meta.put("hasNext", postPage.hasNext());
                meta.put("hasPrevious", postPage.hasPrevious());

                ApiResponse<List<PostDto>> response = new ApiResponse<>(
                                true,
                                "Posts retrieved successfully",
                                dtos,
                                meta);

                MappingJacksonValue mapping = new MappingJacksonValue(response);
                mapping.setFilters(getUserFilter());

                return ResponseEntity.ok(mapping);
        }

        // ---------------- GET SINGLE POST ----------------
        @GetMapping("/{id}")
        public ResponseEntity<MappingJacksonValue> getPost(@PathVariable UUID id) {
                Post post = postRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Post not found"));

                ApiResponse<PostDto> response = new ApiResponse<>(true, "Post retrieved successfully",
                                PostDto.fromEntity(post),
                                null);
                MappingJacksonValue mapping = new MappingJacksonValue(response);
                mapping.setFilters(getUserFilter());
                return ResponseEntity.ok(mapping);
        }

        // ---------------- GET POST WITH NEIGHBORS ----------------
        @GetMapping("/{boardType}/{id}")
        public ResponseEntity<MappingJacksonValue> getPostWithNeighbors(@PathVariable UUID id,
                        @PathVariable Post.BOARD_TYPE boardType) {

                Post post = postRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Post not found"));

                Post prev = postRepository
                                .findFirstByBoardTypeAndCreatedAtBeforeOrderByCreatedAtDesc(boardType,
                                                post.getCreatedAt())
                                .orElse(null);

                Post next = postRepository
                                .findFirstByBoardTypeAndCreatedAtAfterOrderByCreatedAtAsc(boardType,
                                                post.getCreatedAt())
                                .orElse(null);

                Map<String, Object> result = new HashMap<>();
                long currentViewCount = postViewRepository.countByPost(post);
                int attachmentCount = post.getAttachments() != null ? post.getAttachments().size() : 0;

                result.put("current", PostDto.fromEntity(post, currentViewCount, attachmentCount));
                result.put("prev", prev != null ? Map.of("postId", prev.getPostId(), "title", prev.getTitle()) : null);
                result.put("next", next != null ? Map.of("postId", next.getPostId(), "title", next.getTitle()) : null);

                ApiResponse<Map<String, Object>> response = new ApiResponse<>(true,
                                "Post with neighbors retrieved successfully", result, null);
                MappingJacksonValue mapping = new MappingJacksonValue(response);
                mapping.setFilters(getUserFilter());
                return ResponseEntity.ok(mapping);
        }

        // ---------------- CREATE POST ----------------
        @PostMapping(consumes = { "multipart/form-data" })
        public ResponseEntity<MappingJacksonValue> createPost(@RequestPart("post") PostDto postDto,
                        @RequestPart(value = "attachments", required = false) MultipartFile[] attachments) {
                CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();
                UUID currentUserId = currentUser.getId();
                Users creator = userRepository.findByUserId(currentUserId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Post postEntity = postDto.toEntity(creator);

                if (attachments != null && attachments.length > 0) {
                        for (MultipartFile file : attachments) {
                                String fileUrl = fileService.storeFile(file, postDto.getBoardType().name());
                                PostAttachment attachment = new PostAttachment();
                                attachment.setFileName(file.getOriginalFilename());
                                attachment.setFileUrl(fileUrl);
                                attachment.setPost(postEntity);
                                postEntity.getAttachments().add(attachment);
                        }
                }

                Post savedPost = postRepository.save(postEntity);

                ApiResponse<PostDto> response = new ApiResponse<>(true, "Post created successfully",
                                PostDto.fromEntity(savedPost), null);
                MappingJacksonValue mapping = new MappingJacksonValue(response);
                mapping.setFilters(getUserFilter());
                return ResponseEntity.ok(mapping);

        }

        // ---------------- UPDATE POST ----------------
        @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
        public ResponseEntity<MappingJacksonValue> updatePost(@PathVariable UUID id,
                        @RequestPart("post") PostDto postDto,
                        @RequestPart(value = "attachments", required = false) MultipartFile[] attachments) {

                CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();
                UUID currentUserId = currentUser.getId();

                Post post = postRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Post not found"));

                if (!post.getCreator().getUserId().equals(currentUserId)) {
                        throw new RuntimeException("Forbidden: only creator can update");
                }

                post.setTitle(postDto.getTitle());
                post.setContent(postDto.getContent());

                if (attachments != null && attachments.length > 0) {
                        for (MultipartFile file : attachments) {
                                String fileUrl = fileService.storeFile(file, postDto.getBoardType().name());

                                PostAttachment attachment = new PostAttachment();
                                attachment.setFileName(file.getOriginalFilename());
                                attachment.setFileUrl(fileUrl);
                                attachment.setPost(post);
                                post.getAttachments().add(attachment);
                        }
                }

                if (postDto.getRemovedAttachmentIds() != null) {
                        List<UUID> idsToRemove = postDto.getRemovedAttachmentIds();
                        List<PostAttachment> toDelete = post.getAttachments().stream()
                                        .filter(att -> idsToRemove.contains(att.getAttachmentId()))
                                        .toList();

                        for (PostAttachment att : toDelete) {
                                fileService.deleteFile(att.getFileUrl());
                        }

                        post.getAttachments().removeIf(att -> idsToRemove.contains(att.getAttachmentId()));

                }

                Post updated = postRepository.save(post);

                ApiResponse<PostDto> response = new ApiResponse<>(true, "Post updated successfully",
                                PostDto.fromEntity(updated), null);
                MappingJacksonValue mapping = new MappingJacksonValue(response);
                mapping.setFilters(getUserFilter());
                return ResponseEntity.ok(mapping);
        }

        // ---------------- DELETE POST ----------------
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable UUID id) {
                CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext()
                                .getAuthentication().getPrincipal();
                UUID currentUserId = currentUser.getId();

                Post post = postRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Post not found"));

                boolean isCreator = post.getCreator().getUserId().equals(currentUserId);
                boolean isAdmin = currentUser.getAuthorities().stream()
                                .anyMatch(auth -> auth.getAuthority().equals("ROLE_PLATFORM_ADMIN"));

                if (!isCreator && !isAdmin) {
                        ApiResponse<Void> errorResponse = new ApiResponse<>(false,
                                        "Forbidden: only creator or admin can delete", null, null);
                        return ResponseEntity.status(403).body(errorResponse);
                }

                // Delete files from MinIO first
                if (post.getAttachments() != null && !post.getAttachments().isEmpty()) {
                        for (PostAttachment attachment : post.getAttachments()) {
                                fileService.deleteFile(attachment.getFileUrl());
                        }
                }

                // Delete related post views first to avoid foreign key constraint error
                postViewRepository.deleteByPost(post);

                // Now delete the post
                postRepository.delete(post);

                ApiResponse<Void> response = new ApiResponse<>(true,
                                "Post deleted successfully", null, null);
                return ResponseEntity.ok(response);
        }

        // ---------------- VIEW POST ----------------
        @PostMapping("/{id}/view")
        public ResponseEntity<ApiResponse<Void>> viewPost(@PathVariable UUID id) {
                CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();
                UUID currentUserId = currentUser.getId();

                postViewService.addView(id, currentUserId);
                ApiResponse<Void> response = new ApiResponse<>(true, "View counted successfully", null, null);
                return ResponseEntity.ok(response);
        }

        // ---------------- USER FILTER ----------------
        private FilterProvider getUserFilter() {
                SimpleBeanPropertyFilter userFilter = SimpleBeanPropertyFilter
                                .filterOutAllExcept("userId", "role", "loginId", "nameKr", "nameEn", "email", "phone",
                                                "country", "department", "status");

                return new SimpleFilterProvider().addFilter("UserFilter", userFilter);
        }
}
