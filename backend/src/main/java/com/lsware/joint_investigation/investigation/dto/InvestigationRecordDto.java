package com.lsware.joint_investigation.investigation.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.REVIEW_STATUS;
import com.lsware.joint_investigation.user.dto.UserDto;
import com.lsware.joint_investigation.user.entity.Users;

import lombok.*;

@Data
@NoArgsConstructor
public class InvestigationRecordDto {
    private UUID recordId;
    private UUID caseId;
    private String recordName;
    private String content;
    private String securityLevel;
    private PROGRESS_STATUS progressStatus;
    private REVIEW_STATUS reviewStatus;
    private String rejectionReason;
    private UserDto creator;
    private UserDto reviewer;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InvestigationRecord toEntity() {
        InvestigationRecord entity = new InvestigationRecord();
        entity.setRecordId(this.recordId);
        entity.setCaseId(this.caseId);
        entity.setRecordName(this.recordName);
        entity.setContent(this.content);
        entity.setSecurityLevel(this.securityLevel);
        entity.setProgressStatus(this.progressStatus);
        entity.setReviewStatus(this.reviewStatus);
        entity.setRejectionReason(this.rejectionReason);
        if (this.creator != null) {
            Users creatorEntity = new Users();
            creatorEntity.setUserId(this.creator.getUserId());
            entity.setCreator(creatorEntity);
        }
        if (this.reviewer != null) {
            Users reviewerEntity = new Users();
            reviewerEntity.setUserId(this.reviewer.getUserId());
            entity.setReviewer(reviewerEntity);
        }
        entity.setReviewedAt(this.reviewedAt);
        entity.setCreatedAt(this.createdAt);
        entity.setUpdatedAt(this.updatedAt);
        return entity;
    }


}
