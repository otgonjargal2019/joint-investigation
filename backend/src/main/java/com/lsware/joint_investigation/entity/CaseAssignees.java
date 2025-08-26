package com.lsware.joint_investigation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.math.BigDecimal;

@Entity
@Table(name = "case_assignees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CaseAssignees {

    @Column(name = "case_id", nullable = false)
    private String caseId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "assigned_at", nullable = false)
    private String assignedAt;

}
