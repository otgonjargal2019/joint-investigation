package com.lsware.joint_investigation.organisationalData.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForeignInvAdminTreeDto {
    private Long countryId;
    private UUID countryUuid;
    private String countryName;
    private String countryCode;
    private List<UserTreeNodeDto> invAdmins;
}
