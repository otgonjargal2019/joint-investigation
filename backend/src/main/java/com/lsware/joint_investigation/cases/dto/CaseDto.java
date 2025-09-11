package com.lsware.joint_investigation.cases.dto;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

import com.lsware.joint_investigation.cases.entity.Case;
import com.lsware.joint_investigation.cases.entity.Case.CASE_STATUS;
import com.lsware.joint_investigation.investigation.dto.InvestigationRecordDto;
import com.lsware.joint_investigation.user.dto.UserDto;
import com.lsware.joint_investigation.user.entity.Users;
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
    private Integer number;
    private CASE_STATUS status;
    private ZonedDateTime investigationDate;
    private UserDto creator;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String etc;

    private InvestigationRecordDto latestRecord;
    private List<InvestigationRecordDto> investigationRecords;

    public Case toEntity() {
        Case caseEntity = new Case();
        caseEntity.setCaseId(this.caseId);
        caseEntity.setCaseName(this.caseName);
        caseEntity.setCaseOutline(this.caseOutline);
        caseEntity.setContentType(this.contentType);
        caseEntity.setInfringementType(this.infringementType);
        caseEntity.setRelatedCountries(this.relatedCountries);
        caseEntity.setPriority(this.priority);
        caseEntity.setNumber(this.number);
        caseEntity.setStatus(this.status);
        caseEntity.setInvestigationDate(this.investigationDate);
        if (this.creator != null) {
            Users creatorEntity = new Users();
            creatorEntity.setUserId(this.creator.getUserId());
            caseEntity.setCreator(creatorEntity);
        }
        caseEntity.setCreatedAt(this.createdAt);
        caseEntity.setUpdatedAt(this.updatedAt);
        caseEntity.setEtc(this.etc);
        return caseEntity;
    }
}
