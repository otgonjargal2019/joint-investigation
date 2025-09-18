package com.lsware.joint_investigation.investigation.entity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.lsware.joint_investigation.user.entity.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "attach_file")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttachFile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "file_id")
    private UUID fileId;

    @ManyToOne
    @JoinColumn(name = "record_id", nullable = false)
    private InvestigationRecord investigationRecord;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private FileType fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_hash", length = 255)
    private String fileHash;

    @Column(name = "storage_path", nullable = false, length = 512)
    private String storagePath;

    @ManyToOne
    @JoinColumn(name = "uploaded_by", nullable = false)
    private Users uploadedBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "digital_evidence")
    private Boolean digitalEvidence;

    @Column(name = "investigation_report")
    private Boolean investigationReport;

    @Column(name = "authorized_user_id_list", columnDefinition = "uuid[]")
    private List<UUID> authorizedUserIdList;

    @Column(name = "authorized_user_re_encrypt_key_id_list", columnDefinition = "uuid[]")
    private List<UUID> authorizedUserReEncryptKeyIdList;

    public enum FileType {
        EVIDENCE,
        REPORT
    }

    public com.lsware.joint_investigation.investigation.dto.AttachFileDto toDto() {
        return com.lsware.joint_investigation.investigation.dto.AttachFileDto.fromEntity(this);
    }
}