package com.lsware.joint_investigation.cases.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

import com.lsware.joint_investigation.user.dto.UserDto;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseAssigneeDto {
    private UUID caseId;
    private UUID userId;
    private LocalDateTime assignedAt;
    private UserDto user;
    private String caseName;
}
