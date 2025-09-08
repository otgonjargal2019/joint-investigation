package com.lsware.joint_investigation.user.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.lsware.joint_investigation.user.entity.Users.USER_STATUS;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "user_status_histories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "history_id", nullable = false)
    private UUID historyId;

    @Column(name = "from_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private USER_STATUS fromStatus;

    @Column(name = "to_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private USER_STATUS toStatus;

    @Column(name = "reason", length = 250)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private Users creator;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
