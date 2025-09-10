package com.lsware.joint_investigation.user.dto;

import java.util.UUID;

import com.lsware.joint_investigation.user.entity.Role;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserStatusHistoryDto {
    private UUID userId;
    private String loginId;
    private String nameEn;
    private String nameKr;
    private String countryName;
    private Role role;

    private String departmentName;
    private String headquarterName;
    private String email;
    private String phone;
    private String profileImageUrl;

}
