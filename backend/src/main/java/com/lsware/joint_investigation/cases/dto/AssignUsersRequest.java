package com.lsware.joint_investigation.cases.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignUsersRequest {
    
    private UUID caseId;
    private List<UUID> userIds;
}
