package com.lsware.joint_investigation.investigation.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.lsware.joint_investigation.cases.dto.CaseDto;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.REVIEW_STATUS;

import lombok.*;

@Data
@NoArgsConstructor
public class InvestigationRecordDto {
    private UUID recordId;
    private CaseDto caseInstance;
    private String recordName;
    private String content;
    private String securityLevel;
    private PROGRESS_STATUS progressStatus;
    private REVIEW_STATUS reviewStatus;
    private String rejectionReason;
    private UUID createdBy;
    private UUID reviewerId;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InvestigationRecord toEntity() {
        InvestigationRecord entity = new InvestigationRecord();
        entity.setRecordId(this.recordId);
        entity.setCaseInstance(this.caseInstance != null ? this.caseInstance.toEntity() : null);
        entity.setRecordName(this.recordName);
        entity.setContent(this.content);
        entity.setSecurityLevel(this.securityLevel);
        entity.setProgressStatus(this.progressStatus);
        entity.setReviewStatus(this.reviewStatus);
        entity.setRejectionReason(this.rejectionReason);
        entity.setCreatedBy(this.createdBy);
        entity.setReviewerId(this.reviewerId);
        entity.setReviewedAt(this.reviewedAt);
        entity.setCreatedAt(this.createdAt);
        entity.setUpdatedAt(this.updatedAt);
        return entity;
    }


}
