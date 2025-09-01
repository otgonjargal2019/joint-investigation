package com.lsware.joint_investigation.posts.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.lsware.joint_investigation.posts.dto.PostDto;
import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.entity.Post.BOARD_TYPE;
import com.lsware.joint_investigation.posts.repository.PostRepository;
import com.lsware.joint_investigation.user.entity.Users;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostRepository postRepository;

    // CREATE POST
    @PostMapping
    public ResponseEntity<PostDto> createPost(
            @RequestBody PostDto postDto,
            @AuthenticationPrincipal Users authenticatedUser) {

        if (authenticatedUser == null) {
            return ResponseEntity.status(403).build();
        }

        Post post = postDto.toEntity(authenticatedUser);
        Post saved = postRepository.save(post);
        return ResponseEntity.ok(saved.toDto());
    }

    // GET POSTS (with pagination)
    @GetMapping
    public ResponseEntity<List<PostDto>> getPosts(
            @AuthenticationPrincipal Users authenticatedUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) BOARD_TYPE boardType) {

        if (authenticatedUser == null) {
            return ResponseEntity.status(403).build();
        }

        Pageable pageable = PageRequest.of(page, size);
        List<Post> posts;

        if (boardType != null) {
            posts = postRepository.findByBoardType(boardType, pageable);
        } else {
            posts = postRepository.findAll(pageable).getContent();
        }

        List<PostDto> postDtos = posts.stream()
                .map(Post::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(postDtos);
    }

    // GET SINGLE POST
    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPost(
            @AuthenticationPrincipal Users authenticatedUser,
            @PathVariable UUID id) {

        if (authenticatedUser == null) {
            return ResponseEntity.status(403).build();
        }

        Optional<Post> postOpt = postRepository.findById(id);
        return postOpt.map(post -> ResponseEntity.ok(post.toDto()))
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE POST (title & content only)
    @PutMapping("/{id}")
    public ResponseEntity<PostDto> updatePost(
            @AuthenticationPrincipal Users authenticatedUser,
            @PathVariable UUID id,
            @RequestBody PostDto postDto) {

        if (authenticatedUser == null) {
            return ResponseEntity.status(403).build();
        }

        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Post post = postOpt.get();

        // Only the creator can update
        if (!post.getCreator().getUserId().equals(authenticatedUser.getUserId())) {
            return ResponseEntity.status(403).build();
        }

        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        // boardType cannot be updated

        Post updated = postRepository.save(post);
        return ResponseEntity.ok(updated.toDto());
    }

    // DELETE POST
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal Users authenticatedUser,
            @PathVariable UUID id) {

        if (authenticatedUser == null) {
            return ResponseEntity.status(403).build();
        }

        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Post post = postOpt.get();

        // Only the creator can delete
        if (!post.getCreator().getUserId().equals(authenticatedUser.getUserId())) {
            return ResponseEntity.status(403).build();
        }

        postRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
