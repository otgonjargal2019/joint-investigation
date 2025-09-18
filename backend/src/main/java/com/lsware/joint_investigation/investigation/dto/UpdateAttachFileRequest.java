package com.lsware.joint_investigation.investigation.dto;

import java.util.List;
import java.util.UUID;

import com.lsware.joint_investigation.investigation.entity.AttachFile;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAttachFileRequest {

    private String fileName;
    private AttachFile.FileType fileType;
    private Long fileSize;
    private String mimeType;
    private String fileHash;
    private String storagePath;
    private Boolean digitalEvidence;
    private Boolean investigationReport;
    private List<UUID> authorizedUserIdList;
    private List<UUID> authorizedUserReEncryptKeyIdList;
}