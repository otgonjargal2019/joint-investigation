package com.lsware.joint_investigation.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.entity.Users.USER_STATUS;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserStatusHistoryDto {
    private UUID historyId;
    private USER_STATUS fromStatus;
    private USER_STATUS toStatus;
    private String reason;
    private Users user;
    private Users creator;
    private LocalDateTime createdAt;

}
