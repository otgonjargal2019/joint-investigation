package com.lsware.joint_investigation.cases.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.UUID;

import com.lsware.joint_investigation.cases.dto.CaseDto;

@Entity
@Table(name = "cases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Case {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "case_id")
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
    private Integer priority;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private CASE_STATUS status;

    public enum CASE_STATUS {
        OPEN,
        ON_HOLD,
        CLOSED
    }

    @Column(name = "investigation_date")
    private LocalDate investigationDate;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "etc")
    private String etc;

    public CaseDto toDto() {
        CaseDto dto = new CaseDto();
        dto.setCaseId(this.caseId);
        dto.setCaseName(this.caseName);
        dto.setCaseOutline(this.caseOutline);
        dto.setContentType(this.contentType);
        dto.setInfringementType(this.infringementType);
        dto.setRelatedCountries(this.relatedCountries);
        dto.setPriority(this.priority);
        dto.setStatus(this.status);
        dto.setInvestigationDate(this.investigationDate);
        dto.setCreatedBy(this.createdBy);
        dto.setCreatedAt(this.createdAt);
        dto.setUpdatedAt(this.updatedAt);
        dto.setEtc(this.etc);
        return dto;
    }

}
