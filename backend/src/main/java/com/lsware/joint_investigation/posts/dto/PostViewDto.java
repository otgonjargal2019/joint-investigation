package com.lsware.joint_investigation.posts.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.entity.PostView;
import com.lsware.joint_investigation.user.dto.UserDto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PostViewDto {
    private UUID postViewId;
    private UUID postId;
    private UserDto user;
    private LocalDateTime viewedAt;
    private String viewedAtStr;

    public static PostViewDto fromEntity(PostView postView) {
        PostViewDto dto = new PostViewDto();
        dto.setPostViewId(postView.getPostViewId());

        Post post = postView.getPost();
        if (post != null) {
            dto.setPostId(post.getPostId());
        }

        if (postView.getUser() != null) {
            UserDto userDto = new UserDto();
            userDto.setLoginId(postView.getUser().getLoginId());
            userDto.setNameKr(postView.getUser().getNameKr());
            userDto.setNameEn(postView.getUser().getNameEn());
            dto.setUser(userDto);
        }

        dto.setViewedAt(postView.getViewedAt());
        if (postView.getViewedAt() != null) {
            dto.setViewedAtStr(postView.getViewedAt().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")));
        }

        return dto;
    }
}
