package com.lsware.joint_investigation.posts.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.entity.Post.BOARD_TYPE;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
        Page<Post> findByBoardType(BOARD_TYPE boardType, Pageable pageable);

        // Next post: the one created **after** the given post
        Optional<Post> findFirstByBoardTypeAndCreatedAtAfterOrderByCreatedAtAsc(
                        BOARD_TYPE boardType, LocalDateTime createdAt);

        // Previous post: the one created **before** the given post
        Optional<Post> findFirstByBoardTypeAndCreatedAtBeforeOrderByCreatedAtDesc(
                        BOARD_TYPE boardType, LocalDateTime createdAt);

        List<Post> findTop4ByBoardTypeOrderByCreatedAtDesc(BOARD_TYPE boardType);

}