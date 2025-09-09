package com.lsware.joint_investigation.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.lsware.joint_investigation.cases.entity.CaseAssignee;
import com.lsware.joint_investigation.user.dto.UserDto;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "login_id", nullable = false)
    private String loginId;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "name_kr", nullable = false)
    private String nameKr;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "role", nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private USER_STATUS status;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "country_id", nullable = false)
    private Long countryId;

    @Column(name = "headquarter_id", nullable = false)
    private Long headquarterId;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    // Many-to-many relationship with Cases through CaseAssignee
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<CaseAssignee> caseAssignments = new ArrayList<>();

    public enum USER_STATUS {
        PENDING,
        APPROVED,
        REJECTED,
        WAITING_TO_CHANGE
    }

    public UserDto toDto() {
        UserDto dto = new UserDto();
        dto.setUserId(this.userId);
        dto.setLoginId(this.loginId);
        dto.setNameKr(this.nameKr);
        dto.setNameEn(this.nameEn);
        dto.setEmail(this.email);
        dto.setPhone(this.phone);
        dto.setCountryId(this.countryId);
        dto.setHeadquarterId(this.headquarterId);
        dto.setDepartmentId(this.departmentId);
        dto.setRole(this.role);
        dto.setStatus(this.status);
        dto.setCreatedAt(this.createdAt);
        if (this.createdAt != null) {
            dto.setCreatedAtFormatted(this.createdAt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        }

        return dto;
    }

}
