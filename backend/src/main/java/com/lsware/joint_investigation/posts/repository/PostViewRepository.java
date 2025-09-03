package com.lsware.joint_investigation.posts.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.entity.PostView;
import com.lsware.joint_investigation.user.entity.Users;

@Repository
public interface PostViewRepository extends JpaRepository<PostView, UUID> {
    Optional<PostView> findByPostAndUser(Post post, Users user);

    long countByPost(Post post);

    @Transactional
    void deleteByPost(Post post);
}