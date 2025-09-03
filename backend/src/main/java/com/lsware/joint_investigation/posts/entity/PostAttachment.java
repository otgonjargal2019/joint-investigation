package com.lsware.joint_investigation.posts.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attachment_id", nullable = false)
    private UUID attachmentId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
