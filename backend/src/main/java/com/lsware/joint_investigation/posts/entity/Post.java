
package com.lsware.joint_investigation.posts.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

import com.lsware.joint_investigation.user.entity.Users;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    public enum BOARD_TYPE {
        NOTICE,
        RESEARCH
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "post_id", nullable = false)
    private UUID postId;

    @Column(name = "board_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private BOARD_TYPE boardType;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private Users creator;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostAttachment> attachments = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}
