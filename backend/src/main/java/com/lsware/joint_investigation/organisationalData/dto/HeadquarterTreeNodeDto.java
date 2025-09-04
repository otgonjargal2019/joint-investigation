package com.lsware.joint_investigation.organisationalData.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeadquarterTreeNodeDto {
    private Long headquarterId;
    private UUID headquarterUuid;
    private String headquarterName;
    private List<DepartmentTreeNodeDto> departments;
}
