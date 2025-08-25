package com.lsware.joint_investigation.investigation.dto;

import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InvestigationRecordDto {
    private String record_id;

    private String recordName;

    private String content;

    public void fromEntity(InvestigationRecord entity) {
        this.record_id = entity.getRecord_id();
        this.recordName = entity.getRecordName();
        this.content = entity.getContent();
    }
}
