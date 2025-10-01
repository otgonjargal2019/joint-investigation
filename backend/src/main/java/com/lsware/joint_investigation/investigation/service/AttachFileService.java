package com.lsware.joint_investigation.investigation.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lsware.joint_investigation.investigation.dto.AttachFileDto;
import com.lsware.joint_investigation.investigation.dto.CreateAttachFileRequest;
import com.lsware.joint_investigation.investigation.dto.UpdateAttachFileRequest;
import com.lsware.joint_investigation.investigation.entity.AttachFile;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.investigation.repository.AttachFileRepository;
import com.lsware.joint_investigation.investigation.repository.InvestigationRecordRepository;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class AttachFileService {

    @Autowired
    private AttachFileRepository attachFileRepository;

    @Autowired
    private InvestigationRecordRepository investigationRecordRepository;

    @Autowired
    private UserRepository userRepository;

    public AttachFileDto createAttachFile(CreateAttachFileRequest request, UUID uploadedByUserId) {

        if (request.getRecordId() == null) {
            throw new IllegalArgumentException("Record ID is required");
        }
        if (request.getFileName() == null || request.getFileName().trim().isEmpty()) {
            throw new IllegalArgumentException("File name is required");
        }
        if (request.getFileType() == null) {
            throw new IllegalArgumentException("File type is required");
        }
        if (request.getStoragePath() == null || request.getStoragePath().trim().isEmpty()) {
            throw new IllegalArgumentException("Storage path is required");
        }

        InvestigationRecord investigationRecord = investigationRecordRepository
                .findById(request.getRecordId().toString())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Investigation record not found with id: " + request.getRecordId()));

        Users uploader = userRepository.findByUserId(uploadedByUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + uploadedByUserId));

        AttachFile attachFile = new AttachFile();
        attachFile.setInvestigationRecord(investigationRecord);
        attachFile.setFileName(request.getFileName());
        attachFile.setFileType(request.getFileType());
        attachFile.setFileSize(request.getFileSize());
        attachFile.setMimeType(request.getMimeType());
        attachFile.setFileHash(request.getFileHash());
        attachFile.setStoragePath(request.getStoragePath());
        attachFile.setUploadedBy(uploader);
        attachFile.setCreatedAt(LocalDateTime.now());
        attachFile.setDigitalEvidence(request.getDigitalEvidence());
        attachFile.setInvestigationReport(request.getInvestigationReport());
        attachFile.setAuthorizedUserIdList(request.getAuthorizedUserIdList());
        attachFile.setAuthorizedUserReEncryptKeyIdList(request.getAuthorizedUserReEncryptKeyIdList());

        AttachFile saved = attachFileRepository.save(attachFile);
        return saved.toDto();
    }

    @Transactional(readOnly = true)
    public AttachFileDto getAttachFileById(UUID fileId) {
        AttachFile attachFile = attachFileRepository.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("Attach file not found with id: " + fileId));
        return attachFile.toDto();
    }

    public AttachFileDto updateAttachFile(UUID fileId, UpdateAttachFileRequest request) {
        AttachFile attachFile = attachFileRepository.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("Attach file not found with id: " + fileId));

        if (request.getFileName() != null && !request.getFileName().trim().isEmpty()) {
            attachFile.setFileName(request.getFileName());
        }
        if (request.getFileType() != null) {
            attachFile.setFileType(request.getFileType());
        }
        if (request.getFileSize() != null) {
            attachFile.setFileSize(request.getFileSize());
        }
        if (request.getMimeType() != null) {
            attachFile.setMimeType(request.getMimeType());
        }
        if (request.getFileHash() != null) {
            attachFile.setFileHash(request.getFileHash());
        }
        if (request.getStoragePath() != null && !request.getStoragePath().trim().isEmpty()) {
            attachFile.setStoragePath(request.getStoragePath());
        }
        if (request.getDigitalEvidence() != null) {
            attachFile.setDigitalEvidence(request.getDigitalEvidence());
        }
        if (request.getInvestigationReport() != null) {
            attachFile.setInvestigationReport(request.getInvestigationReport());
        }
        if (request.getAuthorizedUserIdList() != null) {
            attachFile.setAuthorizedUserIdList(request.getAuthorizedUserIdList());
        }
        if (request.getAuthorizedUserReEncryptKeyIdList() != null) {
            attachFile.setAuthorizedUserReEncryptKeyIdList(request.getAuthorizedUserReEncryptKeyIdList());
        }

        AttachFile saved = attachFileRepository.save(attachFile);
        return saved.toDto();
    }

    public void deleteAttachFile(UUID fileId) {
        if (!attachFileRepository.existsById(fileId)) {
            throw new EntityNotFoundException("Attach file not found with id: " + fileId);
        }
        attachFileRepository.deleteById(fileId);
    }

    @Transactional(readOnly = true)
    public List<AttachFileDto> getAttachFilesByRecordId(UUID recordId) {
        List<AttachFile> attachFiles = attachFileRepository.findByInvestigationRecordRecordId(recordId);
        return attachFiles.stream()
                .map(AttachFile::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttachFileDto> getAttachFilesByFileType(AttachFile.FileType fileType) {
        List<AttachFile> attachFiles = attachFileRepository.findByFileType(fileType);
        return attachFiles.stream()
                .map(AttachFile::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttachFileDto> getDigitalEvidenceFiles() {
        List<AttachFile> attachFiles = attachFileRepository.findDigitalEvidenceFiles();
        return attachFiles.stream()
                .map(AttachFile::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttachFileDto> getInvestigationReportFiles() {
        List<AttachFile> attachFiles = attachFileRepository.findInvestigationReportFiles();
        return attachFiles.stream()
                .map(AttachFile::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countFilesByRecordId(UUID recordId) {
        return attachFileRepository.countByInvestigationRecordRecordId(recordId);
    }
}