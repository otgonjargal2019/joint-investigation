package com.lsware.joint_investigation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "cases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cases {

    @Column(name = "case_id", nullable = false)
    private UUID caseId;

    @Column(name = "case_name", nullable = false)
    private String caseName;

    @Column(name = "case_outline")
    private String caseOutline;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "infringement_type")
    private String infringementType;

    @Column(name = "related_countries")
    private String relatedCountries;

    @Column(name = "priority")
    private String priority;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "investigation_date")
    private LocalDate investigationDate;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    @Column(name = "updated_at", nullable = false)
    private String updatedAt;

    @Column(name = "etc")
    private String etc;

}
