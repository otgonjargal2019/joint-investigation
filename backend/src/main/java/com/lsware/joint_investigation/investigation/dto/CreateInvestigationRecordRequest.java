package com.lsware.joint_investigation.investigation.dto;

import java.util.UUID;

import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.REVIEW_STATUS;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateInvestigationRecordRequest {
    
    private UUID caseId;
    
    private String recordName;
    
    private String content;
    
    private Integer securityLevel;
    
    private Integer number;
    
    private PROGRESS_STATUS progressStatus = PROGRESS_STATUS.PRE_INVESTIGATION;
    
    private REVIEW_STATUS reviewStatus = REVIEW_STATUS.WRITING;
    
    private String rejectionReason;
    
    private UUID reviewerId;
}