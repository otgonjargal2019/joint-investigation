package com.lsware.joint_investigation.posts.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lsware.joint_investigation.posts.entity.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

}