package com.lsware.joint_investigation.investigation.dto;

import java.util.UUID;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InvestigationRecordDto {
    private UUID recordId;
    private String recordName;
    private String content;

    public void fromEntity(InvestigationRecord entity) {
        this.recordId = entity.getRecordId();
        this.recordName = entity.getRecordName();
        this.content = entity.getContent();
    }
}
