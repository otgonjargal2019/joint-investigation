package com.lsware.joint_investigation.user.dto;

import java.util.UUID;

import com.lsware.joint_investigation.user.entity.Role;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateUserRoleRequest {
    private UUID userId;
    private Role role;
}
