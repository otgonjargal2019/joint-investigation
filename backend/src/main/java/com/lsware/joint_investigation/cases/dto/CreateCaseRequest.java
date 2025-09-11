package com.lsware.joint_investigation.cases.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CreateCaseRequest {
    private String caseId;
    private String caseName;
    private String caseOutline;
    private String contentType;
    private String infringementType;
    private String relatedCountries;
    private Integer priority;
    private LocalDateTime investigationDate;
    private String etc;
}
