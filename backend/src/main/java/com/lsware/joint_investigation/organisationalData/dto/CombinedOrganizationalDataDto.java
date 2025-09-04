package com.lsware.joint_investigation.organisationalData.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CombinedOrganizationalDataDto {
    private CountryOrganizationTreeDto currentCountryOrganization;
    private List<ForeignInvAdminTreeDto> foreignInvAdmins;
}
