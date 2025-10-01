package com.lsware.joint_investigation.posts.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.entity.PostAttachment;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PostAttachmentDto {
    private UUID attachmentId;
    private String fileName;
    private String fileUrl;
    private LocalDateTime createdAt;

    private MultipartFile file;

    public PostAttachment toEntity(Post post) {
        PostAttachment attachment = new PostAttachment();
        attachment.setAttachmentId(this.attachmentId);
        attachment.setFileName(this.fileName);
        attachment.setFileUrl(this.fileUrl);
        attachment.setPost(post);

        return attachment;
    }

    public static PostAttachmentDto fromEntity(PostAttachment attachment) {
        PostAttachmentDto dto = new PostAttachmentDto();
        dto.setAttachmentId(attachment.getAttachmentId());
        dto.setFileName(attachment.getFileName());
        dto.setFileUrl(attachment.getFileUrl());
        dto.setCreatedAt(attachment.getCreatedAt());
        return dto;
    }
}
