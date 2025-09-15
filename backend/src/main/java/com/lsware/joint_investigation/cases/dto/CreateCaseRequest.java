package com.lsware.joint_investigation.cases.dto;

import java.time.ZonedDateTime;

import com.lsware.joint_investigation.cases.entity.Case.CASE_INFRINGEMENT_TYPE;

import lombok.Data;

@Data
public class CreateCaseRequest {
    private String caseId;
    private String caseName;
    private String caseOutline;
    private String contentType;
    private CASE_INFRINGEMENT_TYPE infringementType;
    private String relatedCountries;
    private Integer priority;
    private ZonedDateTime investigationDate;
    private String etc;
}
