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

    /**
     * Create a new attached file
     */
    public AttachFileDto createAttachFile(CreateAttachFileRequest request, UUID uploadedByUserId) {
        // Validate required fields
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

        // Validate investigation record exists
        InvestigationRecord investigationRecord = investigationRecordRepository.findById(request.getRecordId().toString())
                .orElseThrow(() -> new EntityNotFoundException("Investigation record not found with id: " + request.getRecordId()));

        // Validate uploader exists
        Users uploader = userRepository.findByUserId(uploadedByUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + uploadedByUserId));

        // Create new attach file
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

    /**
     * Get attach file by ID
     */
    @Transactional(readOnly = true)
    public AttachFileDto getAttachFileById(UUID fileId) {
        AttachFile attachFile = attachFileRepository.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("Attach file not found with id: " + fileId));
        return attachFile.toDto();
    }

    /**
     * Update an existing attach file
     */
    public AttachFileDto updateAttachFile(UUID fileId, UpdateAttachFileRequest request) {
        AttachFile attachFile = attachFileRepository.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("Attach file not found with id: " + fileId));

        // Update fields if provided
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

    /**
     * Delete an attach file
     */
    public void deleteAttachFile(UUID fileId) {
        if (!attachFileRepository.existsById(fileId)) {
            throw new EntityNotFoundException("Attach file not found with id: " + fileId);
        }
        attachFileRepository.deleteById(fileId);
    }

    /**
     * Get all attach files for an investigation record
     */
    @Transactional(readOnly = true)
    public List<AttachFileDto> getAttachFilesByRecordId(UUID recordId) {
        List<AttachFile> attachFiles = attachFileRepository.findByInvestigationRecordRecordId(recordId);
        return attachFiles.stream()
                .map(AttachFile::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get attach files by file type
     */
    @Transactional(readOnly = true)
    public List<AttachFileDto> getAttachFilesByFileType(AttachFile.FileType fileType) {
        List<AttachFile> attachFiles = attachFileRepository.findByFileType(fileType);
        return attachFiles.stream()
                .map(AttachFile::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get digital evidence files
     */
    @Transactional(readOnly = true)
    public List<AttachFileDto> getDigitalEvidenceFiles() {
        List<AttachFile> attachFiles = attachFileRepository.findDigitalEvidenceFiles();
        return attachFiles.stream()
                .map(AttachFile::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get investigation report files
     */
    @Transactional(readOnly = true)
    public List<AttachFileDto> getInvestigationReportFiles() {
        List<AttachFile> attachFiles = attachFileRepository.findInvestigationReportFiles();
        return attachFiles.stream()
                .map(AttachFile::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Count files by investigation record
     */
    @Transactional(readOnly = true)
    public long countFilesByRecordId(UUID recordId) {
        return attachFileRepository.countByInvestigationRecordRecordId(recordId);
    }
}