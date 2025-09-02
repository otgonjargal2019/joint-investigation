package com.lsware.joint_investigation.posts.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.posts.dto.PostDto;
import com.lsware.joint_investigation.posts.entity.Post;
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

    // GET ALL POSTS (with pagination and optional boardType)
    @GetMapping
    public MappingJacksonValue getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam Post.BOARD_TYPE boardType) {

        Pageable pageable = PageRequest.of(page, size);
        List<Post> posts;

        if (boardType != null) {
            posts = postRepository.findByBoardType(boardType, pageable);
        } else {
            posts = postRepository.findAll(pageable).getContent();
        }

        List<PostDto> dtos = posts.stream()
                .map(post -> {
                    long viewCount = postViewRepository.countByPost(post); // <-- count views
                    return PostDto.fromEntity(post, viewCount);
                })
                .collect(Collectors.toList());

        MappingJacksonValue mapping = new MappingJacksonValue(dtos);
        mapping.setFilters(getUserFilter());
        return mapping;
    }

    // GET SINGLE POST BY ID
    @GetMapping("/{id}")
    public MappingJacksonValue getPost(@PathVariable UUID id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        PostDto dto = PostDto.fromEntity(post);
        MappingJacksonValue mapping = new MappingJacksonValue(dto);
        mapping.setFilters(getUserFilter());
        return mapping;
    }

    @GetMapping("/{boardType}/{id}")
    public MappingJacksonValue getPostWithNeighbors(@PathVariable UUID id,
            @PathVariable Post.BOARD_TYPE boardType) {

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Post prev = postRepository
                .findFirstByBoardTypeAndCreatedAtBeforeOrderByCreatedAtDesc(boardType, post.getCreatedAt())
                .orElse(null);

        Post next = postRepository
                .findFirstByBoardTypeAndCreatedAtAfterOrderByCreatedAtAsc(boardType, post.getCreatedAt())
                .orElse(null);

        Map<String, Object> result = new HashMap<>();

        long currentViewCount = postViewRepository.countByPost(post);

        result.put("current", PostDto.fromEntity(post, currentViewCount));
        result.put("prev", prev != null ? Map.of(
                "postId", prev.getPostId(),
                "title", prev.getTitle()) : null);
        result.put("next", next != null ? Map.of(
                "postId", next.getPostId(),
                "title", next.getTitle()) : null);

        MappingJacksonValue mapping = new MappingJacksonValue(result);
        mapping.setFilters(getUserFilter());
        return mapping;
    }

    // CREATE POST
    @PostMapping
    public MappingJacksonValue createPost(@RequestBody PostDto postDto) {
        CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID currentUserId = currentUser.getId();
        Users creator = userRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postDto.toEntity(creator);
        Post savedPost = postRepository.save(post);
        PostDto responseDto = PostDto.fromEntity(savedPost);

        MappingJacksonValue mapping = new MappingJacksonValue(responseDto);
        mapping.setFilters(getUserFilter());
        return mapping;
    }

    // UPDATE POST (title & content only)
    @PutMapping("/{id}")
    public MappingJacksonValue updatePost(@PathVariable UUID id, @RequestBody PostDto postDto) {
        CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID currentUserId = currentUser.getId();

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Only creator can update
        if (!post.getCreator().getUserId().equals(currentUserId)) {
            throw new RuntimeException("Forbidden: only creator can update");
        }

        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        Post updated = postRepository.save(post);

        MappingJacksonValue mapping = new MappingJacksonValue(PostDto.fromEntity(updated));
        mapping.setFilters(getUserFilter());
        return mapping;
    }

    // DELETE POST
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID id) {
        CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID currentUserId = currentUser.getId();

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Only creator can delete
        if (!post.getCreator().getUserId().equals(currentUserId)) {
            return ResponseEntity.status(403).build();
        }

        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> viewPost(@PathVariable UUID id) {
        CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        UUID currentUserId = currentUser.getId();

        postViewService.addView(id, currentUserId);

        return ResponseEntity.ok().build();
    }

    // Utility to provide Jackson filter for creator
    private FilterProvider getUserFilter() {
        SimpleBeanPropertyFilter userFilter = SimpleBeanPropertyFilter
                .filterOutAllExcept("userId", "role", "loginId", "nameKr", "nameEn", "email", "phone",
                        "country", "department", "status");

        return new SimpleFilterProvider().addFilter("UserFilter", userFilter);
    }

}
