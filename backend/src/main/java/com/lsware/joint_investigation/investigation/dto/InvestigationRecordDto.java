package com.lsware.joint_investigation.investigation.dto;

import java.util.UUID;

import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;

import lombok.*;

@Data
@NoArgsConstructor
public class InvestigationRecordDto {
    private UUID recordId;
    private UUID caseId;
    private String recordName;
    private String content;
    private String securityLevel;
    private String progressStatus;
    private String reviewStatus;
    private String rejectionReason;
    private UUID createdBy;
    private UUID reviewerId;
    private String reviewedAt;
    private String createdAt;
    private String updatedAt;

    public InvestigationRecord toEntity() {
        InvestigationRecord investigationRecord = new InvestigationRecord();
        investigationRecord.setRecordId(this.recordId);
        investigationRecord.setCaseId(this.caseId);
        investigationRecord.setRecordName(this.recordName);
        investigationRecord.setContent(this.content);
        investigationRecord.setSecurityLevel(this.securityLevel);
        investigationRecord.setProgressStatus(this.progressStatus);
        investigationRecord.setReviewStatus(this.reviewStatus);
        investigationRecord.setRejectionReason(this.rejectionReason);
        investigationRecord.setCreatedBy(this.createdBy);
        investigationRecord.setReviewerId(this.reviewerId);
        investigationRecord.setReviewedAt(this.reviewedAt);
        investigationRecord.setCreatedAt(this.createdAt);
        investigationRecord.setUpdatedAt(this.updatedAt);
        return investigationRecord;
    }

}
