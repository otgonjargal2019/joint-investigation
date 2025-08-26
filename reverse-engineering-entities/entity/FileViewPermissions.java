package com.lsware.joint_investigation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "file_view_permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileViewPermissions {

    @Column(name = "file_id", nullable = false)
    private UUID fileId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "granted_at", nullable = false)
    private String grantedAt;

}
