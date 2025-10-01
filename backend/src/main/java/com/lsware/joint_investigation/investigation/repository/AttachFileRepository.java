package com.lsware.joint_investigation.investigation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.lsware.joint_investigation.investigation.entity.AttachFile;

@Repository
public interface AttachFileRepository extends JpaRepository<AttachFile, UUID> {

    List<AttachFile> findByInvestigationRecordRecordId(UUID recordId);

    List<AttachFile> findByUploadedByUserId(UUID userId);

    List<AttachFile> findByFileType(AttachFile.FileType fileType);

    List<AttachFile> findByInvestigationRecordRecordIdAndFileType(UUID recordId, AttachFile.FileType fileType);

    @Query("SELECT af FROM AttachFile af WHERE af.digitalEvidence = true")
    List<AttachFile> findDigitalEvidenceFiles();

    @Query("SELECT af FROM AttachFile af WHERE af.investigationReport = true")
    List<AttachFile> findInvestigationReportFiles();

    long countByInvestigationRecordRecordId(UUID recordId);
}