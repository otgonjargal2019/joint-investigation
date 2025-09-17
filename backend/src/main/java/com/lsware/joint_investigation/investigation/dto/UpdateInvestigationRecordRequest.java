package com.lsware.joint_investigation.investigation.dto;

import java.util.UUID;

import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.REVIEW_STATUS;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateInvestigationRecordRequest {
    
    private String recordName;
    
    private String content;
    
    private String securityLevel;
    
    private Integer number;
    
    private PROGRESS_STATUS progressStatus;
    
    private REVIEW_STATUS reviewStatus;
    
    private String rejectionReason;
    
    private UUID reviewerId;
}