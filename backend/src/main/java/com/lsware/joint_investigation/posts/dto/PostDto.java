package com.lsware.joint_investigation.posts.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.entity.Post.BOARD_TYPE;
import com.lsware.joint_investigation.posts.entity.PostAttachment;
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
    private int attachmentCount;
    private List<PostAttachmentDto> attachments;

    public Post toEntity(Users creator) {
        Post postEntity = new Post();
        postEntity.setPostId(this.postId);
        postEntity.setBoardType(this.boardType);
        postEntity.setTitle(this.title);
        postEntity.setContent(this.content);
        postEntity.setCreator(creator);

        if (attachments != null) {
            postEntity.setAttachments(
                    attachments.stream()
                            .map(att -> att.toEntity(postEntity))
                            .collect(Collectors.toList()));
        }

        return postEntity;
    }

    public static PostDto fromEntity(Post post) {
        return fromEntity(post, 0L, 0);
    }

    public static PostDto fromEntity(Post post, long viewCount, int attachmentCount) {
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

        if (post.getAttachments() != null) {
            dto.setAttachments(post.getAttachments().stream()
                    .limit(attachmentCount)
                    .map(PostAttachmentDto::fromEntity)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}
