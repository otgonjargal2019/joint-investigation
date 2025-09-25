package com.lsware.joint_investigation.investigation.service;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.UUID;
import java.security.MessageDigest;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;

import com.lsware.joint_investigation.investigation.repository.AttachFileRepository;
import com.lsware.joint_investigation.investigation.repository.InvestigationRecordRepository;
import com.lsware.joint_investigation.investigation.entity.AttachFile;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import com.lsware.joint_investigation.investigation.dto.InvestigationRecordDto;
import com.lsware.joint_investigation.investigation.dto.CreateInvestigationRecordMultipartRequest;
import com.lsware.joint_investigation.investigation.dto.UpdateInvestigationRecordRequest;
import com.lsware.joint_investigation.investigation.dto.RejectInvestigationRecordRequest;
import com.lsware.joint_investigation.investigation.dto.ApproveInvestigationRecordRequest;
import com.lsware.joint_investigation.investigation.dto.RequestReviewInvestigationRecordRequest;
import com.lsware.joint_investigation.cases.entity.Case;
import com.lsware.joint_investigation.cases.repository.CaseRepository;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.file.service.FileService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@Service
public class InvestigationService {
	@Autowired
	private InvestigationRecordRepository investigationRecordRepository;

	@Autowired
	private CaseRepository caseRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private AttachFileRepository attachFileRepository;

	@Autowired
	private FileService fileService;

	public Map<String, Object> getInvestigationRecords(String recordName, PROGRESS_STATUS progressStatus, String caseId,
			Pageable pageable, CustomUser user) {
		Map<String, Object> result = investigationRecordRepository.findInvestigationRecord(recordName, progressStatus,
				caseId, pageable, user);

		@SuppressWarnings("unchecked")
		List<InvestigationRecord> records = (List<InvestigationRecord>) result.get("rows");
		List<InvestigationRecordDto> dtos = records.stream()
				.map(InvestigationRecord::toDto)
				.toList();

		return Map.of(
				"rows", dtos,
				"total", result.get("total"));
	}

	/**
	 * Create investigation record with multipart file uploads
	 */
	@Transactional
	public InvestigationRecordDto createInvestigationRecordWithFiles(
			CreateInvestigationRecordMultipartRequest request,
			MultipartFile[] files,
			String[] fileTypes,
			Boolean[] digitalEvidenceFlags,
			Boolean[] investigationReportFlags) {

		// Validate request
		if (request.getCaseId() == null) {
			throw new IllegalArgumentException("Case ID is required");
		}
		if (request.getRecordName() == null || request.getRecordName().trim().isEmpty()) {
			throw new IllegalArgumentException("Record name is required");
		}
		if (request.getSecurityLevel() == null) {
			throw new IllegalArgumentException("Security level is required");
		}

		// Get current user
		CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UUID currentUserId = currentUser.getId();

		// Validate and get the case
		Case caseEntity = caseRepository.findById(request.getCaseId())
				.orElseThrow(() -> new IllegalArgumentException("Case not found with ID: " + request.getCaseId()));

		// Get the creator user
		Users creator = userRepository.findByUserId(currentUserId)
				.orElseThrow(() -> new RuntimeException("Creator user not found"));

		// Get reviewer if specified
		Users reviewer = caseEntity.getCreator();
		if (request.getReviewerId() != null) {
			reviewer = userRepository.findByUserId(request.getReviewerId())
					.orElseThrow(() -> new IllegalArgumentException(
							"Reviewer not found with ID: " + request.getReviewerId()));
		}

		// Create the investigation record entity
		InvestigationRecord record = new InvestigationRecord();
		record.setCaseInstance(caseEntity);
		record.setRecordName(request.getRecordName());
		record.setContent(request.getContent());
		record.setSecurityLevel(request.getSecurityLevel());
		record.setNumber(request.getNumber());
		record.setProgressStatus(
				request.getProgressStatus() != null ? request.getProgressStatus() : PROGRESS_STATUS.PRE_INVESTIGATION);
		record.setReviewStatus(request.getReviewStatus() != null ? request.getReviewStatus()
				: InvestigationRecord.REVIEW_STATUS.WRITING);
		record.setRejectionReason(request.getRejectionReason());
		record.setCreator(creator);
		record.setReviewer(reviewer);

		// Set timestamps
		LocalDateTime now = LocalDateTime.now();
		record.setCreatedAt(now);
		record.setUpdatedAt(now);

		// Save the record first
		InvestigationRecord savedRecord = investigationRecordRepository.save(record);

		// Process and upload files if provided
		if (files != null && files.length > 0) {
			List<AttachFile> attachedFiles = new ArrayList<>();

			for (int i = 0; i < files.length; i++) {
				MultipartFile file = files[i];

				if (file.isEmpty()) {
					continue; // Skip empty files
				}

				// Validate file type
				String fileType = (fileTypes != null && i < fileTypes.length) ? fileTypes[i] : "EVIDENCE";
				if (!fileType.equals("EVIDENCE") && !fileType.equals("REPORT")) {
					throw new IllegalArgumentException(
							"Invalid file type: " + fileType + ". Must be EVIDENCE or REPORT");
				}

				try {
					// Upload file to S3 using FileService
					String storagePath = fileService.storeInvestigationFile(file, fileType);

					// Generate file hash
					String fileHash = generateFileHash(file);

					// Create attach file entity
					AttachFile attachFile = new AttachFile();
					attachFile.setInvestigationRecord(savedRecord);
					attachFile.setFileName(file.getOriginalFilename());
					attachFile.setFileType(AttachFile.FileType.valueOf(fileType));
					attachFile.setFileSize(file.getSize());
					attachFile.setMimeType(file.getContentType());
					attachFile.setFileHash(fileHash);
					attachFile.setStoragePath(storagePath);
					attachFile.setUploadedBy(creator);
					attachFile.setCreatedAt(now);

					// Set flags if provided
					if (digitalEvidenceFlags != null && i < digitalEvidenceFlags.length) {
						attachFile.setDigitalEvidence(digitalEvidenceFlags[i]);
					}
					if (investigationReportFlags != null && i < investigationReportFlags.length) {
						attachFile.setInvestigationReport(investigationReportFlags[i]);
					}

					AttachFile savedFile = attachFileRepository.save(attachFile);
					attachedFiles.add(savedFile);

				} catch (Exception e) {
					throw new RuntimeException("Failed to upload file: " + file.getOriginalFilename(), e);
				}
			}

			// Set the attached files to the saved record
			savedRecord.setAttachedFiles(attachedFiles);
		}

		// Update case updated_at timestamp
		caseEntity.setUpdatedAt(now);
		caseRepository.save(caseEntity);

		// Return DTO
		return savedRecord.toDto();
	}

	/**
	 * Get investigation record by ID
	 *
	 * @param recordId The investigation record ID
	 * @return The investigation record DTO with integrated case instance
	 */
	@PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN') or hasRole('INVESTIGATOR') or hasRole('RESEARCHER')")
	public InvestigationRecordDto getInvestigationRecordById(UUID recordId, CustomUser user) {
		InvestigationRecord record = investigationRecordRepository.findByRecordId(recordId, user)
				.orElseThrow(() -> new IllegalArgumentException("Investigation record not found with ID: " + recordId));

		InvestigationRecordDto dto = record.toDto();

		// Manually integrate the case instance to avoid recursion issues
		if (record.getCaseInstance() != null) {
			dto.setCaseInstance(record.getCaseInstance().toDto());
		}

		return dto;
	}

	/**
	 * Update an existing investigation record
	 *
	 * @param recordId The investigation record ID
	 * @param request  The update request
	 * @return The updated investigation record DTO
	 */
	@PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN') or hasRole('INVESTIGATOR') or hasRole('RESEARCHER')")
	@Transactional
	public InvestigationRecordDto updateInvestigationRecord(UUID recordId, UpdateInvestigationRecordRequest request, CustomUser user) {
		// Get the existing record
		InvestigationRecord existingRecord = investigationRecordRepository.findByRecordId(recordId, user)
				.orElseThrow(() -> new IllegalArgumentException("Investigation record not found with ID: " + recordId));

		// Validate request
		if (request.getRecordName() != null && !request.getRecordName().trim().isEmpty()) {
			existingRecord.setRecordName(request.getRecordName());
		}
		if (request.getContent() != null) {
			existingRecord.setContent(request.getContent());
		}
		if (request.getSecurityLevel() != null && request.getSecurityLevel() != null) {
			existingRecord.setSecurityLevel(request.getSecurityLevel());
		}
		if (request.getNumber() != null) {
			existingRecord.setNumber(request.getNumber());
		}
		if (request.getProgressStatus() != null) {
			existingRecord.setProgressStatus(request.getProgressStatus());
		}
		if (request.getReviewStatus() != null) {
			existingRecord.setReviewStatus(request.getReviewStatus());
		}
		if (request.getRejectionReason() != null) {
			existingRecord.setRejectionReason(request.getRejectionReason());
		}

		// Update reviewer if specified
		if (request.getReviewerId() != null) {
			Users reviewer = userRepository.findByUserId(request.getReviewerId())
					.orElseThrow(() -> new IllegalArgumentException(
							"Reviewer not found with ID: " + request.getReviewerId()));
			existingRecord.setReviewer(reviewer);
		}

		// Update timestamp
		existingRecord.setUpdatedAt(LocalDateTime.now());

		// Save the record
		InvestigationRecord savedRecord = investigationRecordRepository.save(existingRecord);

		// Update case updated_at timestamp
		if (existingRecord.getCaseInstance() != null) {
			Case caseEntity = existingRecord.getCaseInstance();
			caseEntity.setUpdatedAt(LocalDateTime.now());
			caseRepository.save(caseEntity);
		}

		// Return DTO
		return savedRecord.toDto();
	}

	/**
	 * Update investigation record with new file attachments
	 * New files are added to existing attachments without overwriting
	 */
	@PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN') or hasRole('INVESTIGATOR') or hasRole('RESEARCHER')")
	@Transactional
	public InvestigationRecordDto updateInvestigationRecordWithFiles(
			UUID recordId,
			UpdateInvestigationRecordRequest request,
			MultipartFile[] files,
			String[] fileTypes,
			Boolean[] digitalEvidenceFlags,
			Boolean[] investigationReportFlags,
			CustomUser user) {

		// Get the existing record
		InvestigationRecord existingRecord = investigationRecordRepository.findByRecordId(recordId, user)
				.orElseThrow(() -> new IllegalArgumentException("Investigation record not found with ID: " + recordId));

		// Update basic fields using existing logic
		if (request.getRecordName() != null && !request.getRecordName().trim().isEmpty()) {
			existingRecord.setRecordName(request.getRecordName());
		}
		if (request.getContent() != null) {
			existingRecord.setContent(request.getContent());
		}
		if (request.getSecurityLevel() != null) {
			existingRecord.setSecurityLevel(request.getSecurityLevel());
		}
		if (request.getNumber() != null) {
			existingRecord.setNumber(request.getNumber());
		}
		if (request.getProgressStatus() != null) {
			existingRecord.setProgressStatus(request.getProgressStatus());
		}
		if (request.getReviewStatus() != null) {
			existingRecord.setReviewStatus(request.getReviewStatus());
		}
		if (request.getRejectionReason() != null) {
			existingRecord.setRejectionReason(request.getRejectionReason());
		}

		// Update reviewer if specified
		if (request.getReviewerId() != null) {
			Users reviewer = userRepository.findByUserId(request.getReviewerId())
					.orElseThrow(() -> new IllegalArgumentException(
							"Reviewer not found with ID: " + request.getReviewerId()));
			existingRecord.setReviewer(reviewer);
		}

		// Get current user for file uploads
		CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UUID currentUserId = currentUser.getId();
		Users uploader = userRepository.findByUserId(currentUserId)
				.orElseThrow(() -> new RuntimeException("Uploader user not found"));

		// Process and upload new files if provided
		if (files != null && files.length > 0) {
			LocalDateTime now = LocalDateTime.now();
			List<AttachFile> newAttachedFiles = new ArrayList<>();

			for (int i = 0; i < files.length; i++) {
				MultipartFile file = files[i];

				if (file.isEmpty()) {
					continue; // Skip empty files
				}

				// Validate file type
				String fileType = (fileTypes != null && i < fileTypes.length) ? fileTypes[i] : "EVIDENCE";
				if (!fileType.equals("EVIDENCE") && !fileType.equals("REPORT")) {
					throw new IllegalArgumentException(
							"Invalid file type: " + fileType + ". Must be EVIDENCE or REPORT");
				}

				try {
					// Upload file to S3 using FileService
					String storagePath = fileService.storeInvestigationFile(file, fileType);

					// Generate file hash
					String fileHash = generateFileHash(file);

					// Create attach file entity
					AttachFile attachFile = new AttachFile();
					attachFile.setInvestigationRecord(existingRecord);
					attachFile.setFileName(file.getOriginalFilename());
					attachFile.setFileType(AttachFile.FileType.valueOf(fileType));
					attachFile.setFileSize(file.getSize());
					attachFile.setMimeType(file.getContentType());
					attachFile.setFileHash(fileHash);
					attachFile.setStoragePath(storagePath);
					attachFile.setUploadedBy(uploader);
					attachFile.setCreatedAt(now);

					// Set flags if provided
					if (digitalEvidenceFlags != null && i < digitalEvidenceFlags.length) {
						attachFile.setDigitalEvidence(digitalEvidenceFlags[i]);
					}
					if (investigationReportFlags != null && i < investigationReportFlags.length) {
						attachFile.setInvestigationReport(investigationReportFlags[i]);
					}

					AttachFile savedFile = attachFileRepository.save(attachFile);
					newAttachedFiles.add(savedFile);

				} catch (Exception e) {
					throw new RuntimeException("Failed to upload file: " + file.getOriginalFilename(), e);
				}
			}

			// Add new files to existing attached files list
			List<AttachFile> existingFiles = existingRecord.getAttachedFiles();
			if (existingFiles == null) {
				existingFiles = new ArrayList<>();
			}
			existingFiles.addAll(newAttachedFiles);
			existingRecord.setAttachedFiles(existingFiles);
		}

		// Update timestamp
		existingRecord.setUpdatedAt(LocalDateTime.now());

		// Save the record
		InvestigationRecord savedRecord = investigationRecordRepository.save(existingRecord);

		// Update case updated_at timestamp
		if (existingRecord.getCaseInstance() != null) {
			Case caseEntity = existingRecord.getCaseInstance();
			caseEntity.setUpdatedAt(LocalDateTime.now());
			caseRepository.save(caseEntity);
		}

		// Return DTO
		return savedRecord.toDto();
	}

	/**
	 * Reject an investigation record
	 */
	@Transactional
	@PreAuthorize("hasRole('INV_ADMIN')")
	public InvestigationRecordDto rejectInvestigationRecord(RejectInvestigationRecordRequest request,
			CustomUser user) {
		// Get the existing record
		InvestigationRecord existingRecord = investigationRecordRepository.findByRecordId(request.getRecordId(), user)
				.orElseThrow(() -> new IllegalArgumentException(
						"Investigation record not found with ID: " + request.getRecordId()));

		// Set review status to REJECTED and update rejection reason
		existingRecord.setReviewStatus(InvestigationRecord.REVIEW_STATUS.REJECTED);
		existingRecord.setRejectionReason(request.getRejectionReason());

		// Set reviewer and review timestamp
		Users currentUser = userRepository.findByUserId(user.getId())
				.orElseThrow(() -> new IllegalArgumentException("Current user not found"));
		existingRecord.setReviewer(currentUser);
		existingRecord.setReviewedAt(LocalDateTime.now());

		// Update timestamp
		existingRecord.setUpdatedAt(LocalDateTime.now());

		// Save the record
		InvestigationRecord savedRecord = investigationRecordRepository.save(existingRecord);

		// Update case updated_at timestamp
		if (existingRecord.getCaseInstance() != null) {
			Case caseEntity = existingRecord.getCaseInstance();
			caseEntity.setUpdatedAt(LocalDateTime.now());
			caseRepository.save(caseEntity);
		}

		// Return DTO
		return savedRecord.toDto();
	}

	/**
	 * Approve an investigation record
	 */
	@Transactional
	@PreAuthorize("hasRole('INV_ADMIN')")
	public InvestigationRecordDto approveInvestigationRecord(ApproveInvestigationRecordRequest request,
			CustomUser user) {
		// Get the existing record
		InvestigationRecord existingRecord = investigationRecordRepository.findByRecordId(request.getRecordId(), user)
				.orElseThrow(() -> new IllegalArgumentException(
						"Investigation record not found with ID: " + request.getRecordId()));

		// Set review status to APPROVED and clear rejection reason
		existingRecord.setReviewStatus(InvestigationRecord.REVIEW_STATUS.APPROVED);
		existingRecord.setRejectionReason(null);

		// Set reviewer and review timestamp
		Users currentUser = userRepository.findByUserId(user.getId())
				.orElseThrow(() -> new IllegalArgumentException("Current user not found"));
		existingRecord.setReviewer(currentUser);
		existingRecord.setReviewedAt(LocalDateTime.now());

		// Update timestamp
		existingRecord.setUpdatedAt(LocalDateTime.now());

		// Save the record
		InvestigationRecord savedRecord = investigationRecordRepository.save(existingRecord);

		// Update case updated_at timestamp
		if (existingRecord.getCaseInstance() != null) {
			Case caseEntity = existingRecord.getCaseInstance();
			caseEntity.setUpdatedAt(LocalDateTime.now());
			caseRepository.save(caseEntity);
		}

		// Return DTO
		return savedRecord.toDto();
	}

	/**
	 * Request review for an investigation record
	 */
	@Transactional
	@PreAuthorize("hasRole('INVESTIGATOR') or hasRole('RESEARCHER')")
	public InvestigationRecordDto requestReviewInvestigationRecord(RequestReviewInvestigationRecordRequest request,
			CustomUser user) {
		// Get the existing record
		InvestigationRecord existingRecord = investigationRecordRepository.findByRecordId(request.getRecordId(), user)
				.orElseThrow(() -> new IllegalArgumentException(
						"Investigation record not found with ID: " + request.getRecordId()));

		// Verify that the current user is the creator of the record
		if (!existingRecord.getCreator().getUserId().equals(user.getId())) {
			throw new IllegalArgumentException("Only the creator can request review for this investigation record");
		}

		// Verify that the review status allows requesting review
		if (existingRecord.getReviewStatus() != InvestigationRecord.REVIEW_STATUS.WRITING
				&& existingRecord.getReviewStatus() != InvestigationRecord.REVIEW_STATUS.REJECTED) {
			throw new IllegalArgumentException(
					"Review can only be requested when status is WRITING or REJECTED. Current status: "
							+ existingRecord.getReviewStatus());
		}

		// Set review status to PENDING
		existingRecord.setReviewStatus(InvestigationRecord.REVIEW_STATUS.PENDING);
		existingRecord.setRequestedAt(ZonedDateTime.now());

		// Clear previous review data
		existingRecord.setReviewer(null);
		existingRecord.setReviewedAt(null);
		existingRecord.setRejectionReason(null);

		// Update timestamp
		existingRecord.setUpdatedAt(LocalDateTime.now());

		// Save the record
		InvestigationRecord savedRecord = investigationRecordRepository.save(existingRecord);

		// Update case updated_at timestamp
		if (existingRecord.getCaseInstance() != null) {
			Case caseEntity = existingRecord.getCaseInstance();
			caseEntity.setUpdatedAt(LocalDateTime.now());
			caseRepository.save(caseEntity);
		}

		// Return DTO
		return savedRecord.toDto();
	}

	/**
	 * Generate SHA-256 hash for uploaded file
	 */
	private String generateFileHash(MultipartFile file) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = digest.digest(file.getBytes());

			// Convert byte array to hex string
			StringBuilder hexString = new StringBuilder();
			for (byte b : hash) {
				String hex = Integer.toHexString(0xff & b);
				if (hex.length() == 1) {
					hexString.append('0');
				}
				hexString.append(hex);
			}
			return hexString.toString();
		} catch (Exception e) {
			// If hash generation fails, return a simple identifier
			return "hash_error_" + System.currentTimeMillis();
		}
	}
}
