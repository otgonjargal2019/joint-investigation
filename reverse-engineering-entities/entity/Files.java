package com.lsware.joint_investigation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Files {

    @Column(name = "file_id", nullable = false)
    private UUID fileId;

    @Column(name = "record_id", nullable = false)
    private UUID recordId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "file_size")
    private String fileSize;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "file_hash")
    private String fileHash;

    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(name = "uploaded_by", nullable = false)
    private UUID uploadedBy;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    @Column(name = "digital_evidence")
    private String digitalEvidence;

    @Column(name = "investigation_report")
    private String investigationReport;

    @Column(name = "etc")
    private String etc;

}
