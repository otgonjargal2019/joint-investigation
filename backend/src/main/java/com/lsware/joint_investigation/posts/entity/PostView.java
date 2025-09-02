package com.lsware.joint_investigation.posts.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.lsware.joint_investigation.user.entity.Users;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_views", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "post_id", "user_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostView {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "post_view_id", nullable = false)
    private UUID postViewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt;

    @PrePersist
    public void prePersist() {
        this.viewedAt = LocalDateTime.now();
    }
}
