package com.lsware.joint_investigation.posts.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.entity.Post.BOARD_TYPE;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    List<Post> findByBoardType(BOARD_TYPE boardType, Pageable pageable);

}