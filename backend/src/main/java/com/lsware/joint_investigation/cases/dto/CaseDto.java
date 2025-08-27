package com.lsware.joint_investigation.cases.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.lsware.joint_investigation.cases.entity.Case;
import com.lsware.joint_investigation.cases.entity.Case.CASE_STATUS;
import lombok.*;

@Data
@NoArgsConstructor
public class CaseDto {
    private UUID caseId;
    private String caseName;
    private String caseOutline;
    private String contentType;
    private String infringementType;
    private String relatedCountries;
    private Integer priority;
    private CASE_STATUS status;
    private LocalDate investigationDate;
    private UUID createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String etc;

    public Case toEntity() {
        Case caseEntity = new Case();
        caseEntity.setCaseId(this.caseId);
        caseEntity.setCaseName(this.caseName);
        caseEntity.setCaseOutline(this.caseOutline);
        caseEntity.setContentType(this.contentType);
        caseEntity.setInfringementType(this.infringementType);
        caseEntity.setRelatedCountries(this.relatedCountries);
        caseEntity.setPriority(this.priority);
        caseEntity.setStatus(this.status);
        caseEntity.setInvestigationDate(this.investigationDate);
        caseEntity.setCreatedBy(this.createdBy);
        caseEntity.setCreatedAt(this.createdAt);
        caseEntity.setUpdatedAt(this.updatedAt);
        caseEntity.setEtc(this.etc);
        return caseEntity;
    }
}
