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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.lsware.joint_investigation.posts.dto.PostDto;
import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.repository.PostRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository postRepository;

    @PostMapping
    public ResponseEntity<PostDto> createPost(@RequestBody PostDto postDto) {
        Post post = postDto.toEntity();
        Post saved = postRepository.save(post);
        return ResponseEntity.ok(saved.toDto());
    }

    @GetMapping
    public ResponseEntity<List<PostDto>> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<PostDto> posts = postRepository.findAll(pageable).stream()
                .map(Post::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPost(@PathVariable UUID id) {
        Optional<Post> postOpt = postRepository.findById(id);
        return postOpt.map(post -> ResponseEntity.ok(post.toDto()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostDto> updatePost(@PathVariable UUID id,
            @RequestBody PostDto postDto) {
        Optional<Post> postOpt = postRepository.findById(id);
        if (!postOpt.isPresent())
            return ResponseEntity.notFound().build();

        Post post = postOpt.get();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setBoardType(postDto.getBoardType());
        // Optionally update creator or timestamps if needed

        Post updated = postRepository.save(post);
        return ResponseEntity.ok(updated.toDto());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID id) {
        if (!postRepository.existsById(id))
            return ResponseEntity.notFound().build();
        postRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
