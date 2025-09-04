package com.lsware.joint_investigation.organisationalData.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentTreeNodeDto {
    private Long departmentId;
    private UUID departmentUuid;
    private String departmentName;
    private List<UserTreeNodeDto> investigators;
}
