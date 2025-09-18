package com.lsware.joint_investigation.file.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lsware.joint_investigation.file.dto.AttachFileDto;
import com.lsware.joint_investigation.file.dto.CreateAttachFileRequest;
import com.lsware.joint_investigation.file.dto.UpdateAttachFileRequest;
import com.lsware.joint_investigation.file.entity.AttachFile;
import com.lsware.joint_investigation.file.service.AttachFileService;

import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api/attach-files")
public class AttachFileController {

    @Autowired
    private AttachFileService attachFileService;

    /**
     * Create a new attached file
     */
    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority('INV_ADMIN', 'PLATFORM_ADMIN', 'INVESTIGATOR')")
    public ResponseEntity<AttachFileDto> createAttachFile(
            @RequestBody CreateAttachFileRequest request,
            Authentication authentication) {
        
        try {
            // Get user ID from authentication
            UUID uploadedByUserId = UUID.fromString(authentication.getName());
            
            AttachFileDto created = attachFileService.createAttachFile(request, uploadedByUserId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get attach file by ID
     */
    @GetMapping("/{fileId}")
    @PreAuthorize("hasAnyAuthority('INV_ADMIN', 'PLATFORM_ADMIN', 'INVESTIGATOR')")
    public ResponseEntity<AttachFileDto> getAttachFileById(@PathVariable UUID fileId) {
        try {
            AttachFileDto attachFile = attachFileService.getAttachFileById(fileId);
            return ResponseEntity.ok(attachFile);
            
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update an existing attach file
     */
    @PutMapping("/{fileId}")
    @PreAuthorize("hasAnyAuthority('INV_ADMIN', 'PLATFORM_ADMIN', 'INVESTIGATOR')")
    public ResponseEntity<AttachFileDto> updateAttachFile(
            @PathVariable UUID fileId,
            @RequestBody UpdateAttachFileRequest request) {
        
        try {
            AttachFileDto updated = attachFileService.updateAttachFile(fileId, request);
            return ResponseEntity.ok(updated);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete an attach file
     */
    @DeleteMapping("/{fileId}")
    @PreAuthorize("hasAnyAuthority('INV_ADMIN', 'PLATFORM_ADMIN')")
    public ResponseEntity<Void> deleteAttachFile(@PathVariable UUID fileId) {
        try {
            attachFileService.deleteAttachFile(fileId);
            return ResponseEntity.noContent().build();
            
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all attach files for an investigation record
     */
    @GetMapping("/by-record/{recordId}")
    @PreAuthorize("hasAnyAuthority('INV_ADMIN', 'PLATFORM_ADMIN', 'INVESTIGATOR')")
    public ResponseEntity<List<AttachFileDto>> getAttachFilesByRecordId(@PathVariable UUID recordId) {
        try {
            List<AttachFileDto> attachFiles = attachFileService.getAttachFilesByRecordId(recordId);
            return ResponseEntity.ok(attachFiles);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get attach files by file type
     */
    @GetMapping("/by-type")
    @PreAuthorize("hasAnyAuthority('INV_ADMIN', 'PLATFORM_ADMIN', 'INVESTIGATOR')")
    public ResponseEntity<List<AttachFileDto>> getAttachFilesByFileType(
            @RequestParam AttachFile.FileType fileType) {
        
        try {
            List<AttachFileDto> attachFiles = attachFileService.getAttachFilesByFileType(fileType);
            return ResponseEntity.ok(attachFiles);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get digital evidence files
     */
    @GetMapping("/digital-evidence")
    @PreAuthorize("hasAnyAuthority('INV_ADMIN', 'PLATFORM_ADMIN', 'INVESTIGATOR')")
    public ResponseEntity<List<AttachFileDto>> getDigitalEvidenceFiles() {
        try {
            List<AttachFileDto> attachFiles = attachFileService.getDigitalEvidenceFiles();
            return ResponseEntity.ok(attachFiles);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get investigation report files
     */
    @GetMapping("/investigation-reports")
    @PreAuthorize("hasAnyAuthority('INV_ADMIN', 'PLATFORM_ADMIN', 'INVESTIGATOR')")
    public ResponseEntity<List<AttachFileDto>> getInvestigationReportFiles() {
        try {
            List<AttachFileDto> attachFiles = attachFileService.getInvestigationReportFiles();
            return ResponseEntity.ok(attachFiles);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Count files by investigation record
     */
    @GetMapping("/count/by-record/{recordId}")
    @PreAuthorize("hasAnyAuthority('INV_ADMIN', 'PLATFORM_ADMIN', 'INVESTIGATOR')")
    public ResponseEntity<Long> countFilesByRecordId(@PathVariable UUID recordId) {
        try {
            long count = attachFileService.countFilesByRecordId(recordId);
            return ResponseEntity.ok(count);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}