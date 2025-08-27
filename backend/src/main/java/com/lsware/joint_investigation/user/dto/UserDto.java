package com.lsware.joint_investigation.user.dto;

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
    private String country;
    private String department;
    private Users.USER_STATUS status;
    private Role role;

    @JsonIgnore
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public void fromEntity(Users entity) {
        this.userId = entity.getUserId();
        this.loginId = entity.getLoginId();
        this.nameEn = entity.getNameEn();
        this.nameKr = entity.getNameKr();
        this.email = entity.getEmail();
        this.phone = entity.getPhone();
        this.country = entity.getCountry();
        this.department = entity.getDepartment();
        this.status = entity.getStatus();
        this.role = entity.getRole();
    }

}
