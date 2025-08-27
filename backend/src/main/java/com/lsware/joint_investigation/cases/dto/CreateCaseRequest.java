package com.lsware.joint_investigation.cases.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class CreateCaseRequest {
    private String caseName;
    private String caseOutline;
    private String contentType;
    private String infringementType;
    private String relatedCountries;
    private Integer priority;
    private LocalDate investigationDate;
    private String etc;
}
