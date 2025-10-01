package com.lsware.joint_investigation.posts.service;

import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.entity.PostView;
import com.lsware.joint_investigation.posts.repository.PostRepository;
import com.lsware.joint_investigation.posts.repository.PostViewRepository;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostViewService {
    private final PostViewRepository postViewRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public void addView(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        Users user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PostView postView = new PostView();
        postView.setPost(post);
        postView.setUser(user);

        try {
            postViewRepository.save(postView);
        } catch (DataIntegrityViolationException e) {

        }
    }
}
