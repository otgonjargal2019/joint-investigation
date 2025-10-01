package com.lsware.joint_investigation.cases.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.lsware.joint_investigation.cases.dto.CaseDto;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.user.entity.Users;

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

    public enum CASE_INFRINGEMENT_TYPE {
        PLATFORMS_SITES,
        LINK_SITES,
        WEBHARD_P2P,
        TORRENTS,
        SNS,
        COMMUNITIES,
        OTHER
    }

    @Column(name = "infringement_type")
    @Enumerated(EnumType.STRING)
    private CASE_INFRINGEMENT_TYPE infringementType;

    @Column(name = "related_countries")
    private String relatedCountries;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "number", insertable = false, updatable = false)
    private Integer number;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private CASE_STATUS status;

    public enum CASE_STATUS {
        OPEN,
        ON_HOLD,
        CLOSED
    }

    @Column(name = "investigation_date")
    private ZonedDateTime investigationDate;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = true)
    private Users creator;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "etc")
    private String etc;

    @Transient
    private InvestigationRecord latestRecord;

    @OneToMany(mappedBy = "caseInstance", fetch = FetchType.LAZY)
    private List<InvestigationRecord> investigationRecords = new ArrayList<>();

    @OneToMany(mappedBy = "caseInstance", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CaseAssignee> assignees = new ArrayList<>();

    public CaseDto toDto() {
        CaseDto dto = new CaseDto();
        dto.setCaseId(this.caseId);
        dto.setCaseName(this.caseName);
        dto.setCaseOutline(this.caseOutline);
        dto.setContentType(this.contentType);
        dto.setInfringementType(this.infringementType);
        dto.setRelatedCountries(this.relatedCountries);
        dto.setPriority(this.priority);
        dto.setNumber(this.number);
        dto.setStatus(this.status);
        dto.setInvestigationDate(this.investigationDate);
        if (this.creator != null) {
            dto.setCreator(this.creator.toDto());
        }
        dto.setCreatedAt(this.createdAt);
        dto.setUpdatedAt(this.updatedAt);
        dto.setEtc(this.etc);

        // Convert latest record if present
        if (this.latestRecord != null) {
            dto.setLatestRecord(this.latestRecord.toDto());
        }
        return dto;
    }

}
