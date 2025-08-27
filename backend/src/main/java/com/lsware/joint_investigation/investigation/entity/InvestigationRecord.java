package com.lsware.joint_investigation.investigation.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.lsware.joint_investigation.cases.entity.Case;
import com.lsware.joint_investigation.investigation.dto.InvestigationRecordDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "investigation_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "record_id")
    private UUID recordId;

    // @Column(name = "case_id", nullable = false)
    // private UUID caseId;

    @ManyToOne
    @JoinColumn(name="case_id", nullable=false)
    private Case caseInstance;

    @Column(name = "record_name", nullable = false)
    private String recordName;

    @Column(name = "content")
    private String content;

    @Column(name = "security_level", nullable = false)
    private String securityLevel;

    @Column(name = "progress_status")
    @Enumerated(EnumType.STRING)
    private PROGRESS_STATUS progressStatus;

    public enum PROGRESS_STATUS {
        PRE_INVESTIGATION,
        INVESTIGATION,
        REVIEW,
        PROSECUTION,
        CLOSED
    }

    @Column(name = "REVIEW_STATUS", nullable = false)
    @Enumerated(EnumType.STRING)
    private REVIEW_STATUS reviewStatus;

    public enum REVIEW_STATUS {
        PENDING,
        APPROVED,
        REJECTED
    }

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "reviewer_id")
    private UUID reviewerId;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public InvestigationRecordDto toDto() {
        InvestigationRecordDto dto = new InvestigationRecordDto();
        dto.setRecordId(this.recordId);
        dto.setCaseInstance(this.caseInstance != null ? this.caseInstance.toDto() : null);
        dto.setRecordName(this.recordName);
        dto.setContent(this.content);
        dto.setSecurityLevel(this.securityLevel);
        dto.setProgressStatus(this.progressStatus);
        dto.setReviewStatus(this.reviewStatus);
        dto.setRejectionReason(this.rejectionReason);
        dto.setCreatedBy(this.createdBy);
        dto.setReviewerId(this.reviewerId);
        dto.setReviewedAt(this.reviewedAt);
        dto.setCreatedAt(this.createdAt);
        dto.setUpdatedAt(this.updatedAt);
        return dto;
    }
}
