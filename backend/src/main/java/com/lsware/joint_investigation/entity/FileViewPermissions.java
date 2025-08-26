package com.lsware.joint_investigation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.math.BigDecimal;

@Entity
@Table(name = "file_view_permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileViewPermissions {

    @Column(name = "file_id", nullable = false)
    private String fileId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "granted_at", nullable = false)
    private String grantedAt;

}
