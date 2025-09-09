package com.lsware.joint_investigation.cases.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

import com.lsware.joint_investigation.user.entity.Users;

@Entity
@Table(name = "case_assignees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(CaseAssigneeId.class)
public class CaseAssignee {

    @Id
    @Column(name = "case_id")
    private UUID caseId;

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", insertable = false, updatable = false)
    private Case caseInstance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private Users user;

    @PrePersist
    public void prePersist() {
        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
    }
}
