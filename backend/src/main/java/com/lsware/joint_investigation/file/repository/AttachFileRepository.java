package com.lsware.joint_investigation.file.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.lsware.joint_investigation.file.entity.AttachFile;

@Repository
public interface AttachFileRepository extends JpaRepository<AttachFile, UUID> {

    /**
     * Find all attached files for a specific investigation record
     */
    List<AttachFile> findByInvestigationRecordRecordId(UUID recordId);

    /**
     * Find all attached files uploaded by a specific user
     */
    List<AttachFile> findByUploadedByUserId(UUID userId);

    /**
     * Find attached files by file type
     */
    List<AttachFile> findByFileType(AttachFile.FileType fileType);

    /**
     * Find attached files for a specific investigation record and file type
     */
    List<AttachFile> findByInvestigationRecordRecordIdAndFileType(UUID recordId, AttachFile.FileType fileType);

    /**
     * Find digital evidence files
     */
    @Query("SELECT af FROM AttachFile af WHERE af.digitalEvidence = true")
    List<AttachFile> findDigitalEvidenceFiles();

    /**
     * Find investigation report files
     */
    @Query("SELECT af FROM AttachFile af WHERE af.investigationReport = true")
    List<AttachFile> findInvestigationReportFiles();

    /**
     * Count files by investigation record
     */
    long countByInvestigationRecordRecordId(UUID recordId);
}