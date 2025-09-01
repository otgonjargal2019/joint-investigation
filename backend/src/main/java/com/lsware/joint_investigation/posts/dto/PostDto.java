package com.lsware.joint_investigation.posts.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.entity.Post.BOARD_TYPE;
import com.lsware.joint_investigation.user.dto.UserDto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PostDto {
    private UUID postId;
    private BOARD_TYPE boardType;
    private String title;
    private String content;
    private UserDto creator;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Post toEntity(Users creator) {
        Post postEntity = new Post();
        postEntity.setPostId(this.postId);
        postEntity.setBoardType(this.boardType);
        postEntity.setTitle(this.title);
        postEntity.setContent(this.content);
        postEntity.setCreator(creator);
        return postEntity;
    }

}
