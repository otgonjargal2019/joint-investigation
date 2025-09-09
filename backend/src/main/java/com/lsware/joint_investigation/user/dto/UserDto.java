package com.lsware.joint_investigation.user.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lsware.joint_investigation.user.entity.Role;
import com.lsware.joint_investigation.user.entity.Users;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFilter;

@Data
@JsonFilter("UserFilter")
public class UserDto {
    private UUID userId;
    private String loginId;
    private String password;
    private String nameKr;
    private String nameEn;
    private String email;
    private String phone;
    private Users.USER_STATUS status;
    private Role role;
    private Long countryId;
    private Long headquarterId;
    private Long departmentId;

    private String countryName;
    private String headquarterName;
    private String departmentName;

    private LocalDateTime createdAt;

    @JsonIgnore
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

}
