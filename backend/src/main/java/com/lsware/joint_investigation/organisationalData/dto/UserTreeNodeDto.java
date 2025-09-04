package com.lsware.joint_investigation.organisationalData.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserTreeNodeDto {
    private UUID userId;
    private String loginId;
    private String nameKr;
    private String nameEn;
    private String email;
    private String phone;
    private String role;
    private String status;
}
