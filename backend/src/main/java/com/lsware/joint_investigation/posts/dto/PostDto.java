package com.lsware.joint_investigation.posts.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

    private String createdAtStr;
    private String updatedAtStr;

    private long viewCount;

    public Post toEntity(Users creator) {
        Post postEntity = new Post();
        postEntity.setPostId(this.postId);
        postEntity.setBoardType(this.boardType);
        postEntity.setTitle(this.title);
        postEntity.setContent(this.content);
        postEntity.setCreator(creator);
        return postEntity;
    }

    public static PostDto fromEntity(Post post) {
        return fromEntity(post, 0L);
    }

    public static PostDto fromEntity(Post post, long viewCount) {
        PostDto dto = new PostDto();
        dto.setPostId(post.getPostId());
        dto.setBoardType(post.getBoardType());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());

        Users creator = post.getCreator();
        if (creator != null) {
            UserDto creatorDto = new UserDto();
            // creatorDto.setUserId(creator.getUserId());
            // creatorDto.setEmail(creator.getEmail());
            creatorDto.setNameEn(creator.getNameEn());
            creatorDto.setNameKr(creator.getNameKr());
            creatorDto.setLoginId(creator.getLoginId());
            dto.setCreator(creatorDto);
        }

        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());

        if (post.getCreatedAt() != null) {
            dto.setCreatedAtStr(post.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")));
        }

        if (post.getUpdatedAt() != null) {
            dto.setUpdatedAtStr(post.getUpdatedAt().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")));
        }

        dto.setViewCount(viewCount);
        return dto;
    }
}
