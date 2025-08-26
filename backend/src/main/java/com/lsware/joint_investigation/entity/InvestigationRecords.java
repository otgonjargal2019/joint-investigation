package com.lsware.joint_investigation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.math.BigDecimal;

@Entity
@Table(name = "investigation_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationRecords {

    @Column(name = "record_id", nullable = false)
    private String recordId;

    @Column(name = "case_id", nullable = false)
    private String caseId;

    @Column(name = "record_name", nullable = false)
    private String recordName;

    @Column(name = "content")
    private String content;

    @Column(name = "security_level", nullable = false)
    private String securityLevel;

    @Column(name = "progress_status")
    private String progressStatus;

    @Column(name = "review_status", nullable = false)
    private String reviewStatus;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "reviewer_id")
    private String reviewerId;

    @Column(name = "reviewed_at")
    private String reviewedAt;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    @Column(name = "updated_at", nullable = false)
    private String updatedAt;

}
