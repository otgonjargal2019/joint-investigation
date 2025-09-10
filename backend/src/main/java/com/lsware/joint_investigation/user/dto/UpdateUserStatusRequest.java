package com.lsware.joint_investigation.user.dto;

import java.util.UUID;

import com.lsware.joint_investigation.user.entity.Users.USER_STATUS;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateUserStatusRequest {
    private UUID userId;
    private USER_STATUS userStatus;
    private USER_STATUS historyStatus;
    private String reason;

}
