package com.lsware.joint_investigation.file.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.lsware.joint_investigation.file.entity.AttachFile;
import com.lsware.joint_investigation.user.dto.UserDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttachFileDto {

    private UUID fileId;
    private UUID recordId;
    private String fileName;
    private AttachFile.FileType fileType;
    private Long fileSize;
    private String mimeType;
    private String fileHash;
    private String storagePath;
    private UserDto uploadedBy;
    private LocalDateTime createdAt;
    private Boolean digitalEvidence;
    private Boolean investigationReport;
    private List<UUID> authorizedUserIdList;
    private List<UUID> authorizedUserReEncryptKeyIdList;

    public static AttachFileDto fromEntity(AttachFile attachFile) {
        if (attachFile == null) {
            return null;
        }

        AttachFileDto dto = new AttachFileDto();
        dto.setFileId(attachFile.getFileId());

        if (attachFile.getInvestigationRecord() != null) {
            dto.setRecordId(attachFile.getInvestigationRecord().getRecordId());
        }

        dto.setFileName(attachFile.getFileName());
        dto.setFileType(attachFile.getFileType());
        dto.setFileSize(attachFile.getFileSize());
        dto.setMimeType(attachFile.getMimeType());
        dto.setFileHash(attachFile.getFileHash());
        dto.setStoragePath(attachFile.getStoragePath());

        if (attachFile.getUploadedBy() != null) {
            dto.setUploadedBy(attachFile.getUploadedBy().toDto());
        }

        dto.setCreatedAt(attachFile.getCreatedAt());
        dto.setDigitalEvidence(attachFile.getDigitalEvidence());
        dto.setInvestigationReport(attachFile.getInvestigationReport());
        dto.setAuthorizedUserIdList(attachFile.getAuthorizedUserIdList());
        dto.setAuthorizedUserReEncryptKeyIdList(attachFile.getAuthorizedUserReEncryptKeyIdList());

        return dto;
    }
}