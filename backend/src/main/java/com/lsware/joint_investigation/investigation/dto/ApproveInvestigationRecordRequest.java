package com.lsware.joint_investigation.investigation.dto;

import java.util.UUID;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApproveInvestigationRecordRequest {

    private UUID recordId;
}
