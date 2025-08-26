package com.lsware.joint_investigation.investigation.entity;

import java.util.UUID;
import com.lsware.joint_investigation.investigation.dto.InvestigationRecordDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "investigation_records")
@Data
@NoArgsConstructor
public class InvestigationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "record_id")
    private UUID recordId;

    @Column(name = "record_name")
    private String recordName;

    private String content;

    public void fromDto(InvestigationRecordDto dto) {
        this.recordId = dto.getRecordId();
        this.recordName = dto.getRecordName();
        this.content = dto.getContent();
    }

}
