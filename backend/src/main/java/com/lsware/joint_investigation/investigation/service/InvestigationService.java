package com.lsware.joint_investigation.investigation.service;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.UUID;
import java.security.MessageDigest;
import java.text.MessageFormat;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;

import com.lsware.joint_investigation.investigation.repository.AttachFileRepository;
import com.lsware.joint_investigation.investigation.repository.InvestigationRecordRepository;
import com.lsware.joint_investigation.notification.service.NotificationService;
import com.lsware.joint_investigation.investigation.entity.AttachFile;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import com.lsware.joint_investigation.investigation.dto.InvestigationRecordDto;
import com.lsware.joint_investigation.investigation.dto.CreateInvestigationRecordMultipartRequest;
import com.lsware.joint_investigation.investigation.dto.UpdateInvestigationRecordRequest;
import com.lsware.joint_investigation.investigation.dto.RejectInvestigationRecordRequest;
import com.lsware.joint_investigation.investigation.dto.ApproveInvestigationRecordRequest;
import com.lsware.joint_investigation.investigation.dto.RequestReviewInvestigationRecordRequest;
import com.lsware.joint_investigation.cases.dto.CaseDto;
import com.lsware.joint_investigation.cases.entity.Case;
import com.lsware.joint_investigation.cases.entity.Case.CASE_STATUS;
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

	@Autowired
	private NotificationService notificationService;

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

	@Transactional
	public InvestigationRecordDto createInvestigationRecordWithFiles(
			CreateInvestigationRecordMultipartRequest request,
			MultipartFile[] files,
			String[] fileTypes,
			Boolean[] digitalEvidenceFlags,
			Boolean[] investigationReportFlags) {

		if (request.getCaseId() == null) {
			throw new IllegalArgumentException("Case ID is required");
		}
		if (request.getRecordName() == null || request.getRecordName().trim().isEmpty()) {
			throw new IllegalArgumentException("Record name is required");
		}
		if (request.getSecurityLevel() == null) {
			throw new IllegalArgumentException("Security level is required");
		}

		CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UUID currentUserId = currentUser.getId();

		Case caseEntity = caseRepository.findById(request.getCaseId())
				.orElseThrow(() -> new IllegalArgumentException("Case not found with ID: " + request.getCaseId()));

		if (caseEntity.getStatus() == CASE_STATUS.CLOSED) {
			throw new IllegalArgumentException("Case is already closed!");
		}

		Users creator = userRepository.findByUserId(currentUserId)
				.orElseThrow(() -> new RuntimeException("Creator user not found"));

		Users reviewer = caseEntity.getCreator();
		if (request.getReviewerId() != null) {
			reviewer = userRepository.findByUserId(request.getReviewerId())
					.orElseThrow(() -> new IllegalArgumentException(
							"Reviewer not found with ID: " + request.getReviewerId()));
		}

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

		LocalDateTime now = LocalDateTime.now();
		record.setCreatedAt(now);
		record.setUpdatedAt(now);

		InvestigationRecord savedRecord = investigationRecordRepository.save(record);

		if (files != null && files.length > 0) {
			List<AttachFile> attachedFiles = new ArrayList<>();

			for (int i = 0; i < files.length; i++) {
				MultipartFile file = files[i];

				if (file.isEmpty()) {
					continue;
				}

				String fileType = (fileTypes != null && i < fileTypes.length) ? fileTypes[i] : "EVIDENCE";
				if (!fileType.equals("EVIDENCE") && !fileType.equals("REPORT")) {
					throw new IllegalArgumentException(
							"Invalid file type: " + fileType + ". Must be EVIDENCE or REPORT");
				}

				try {

					String storagePath = fileService.storeInvestigationFile(file, fileType);

					String fileHash = generateFileHash(file);

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

			savedRecord.setAttachedFiles(attachedFiles);
		}

		caseEntity.setUpdatedAt(now);
		caseRepository.save(caseEntity);

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
	public InvestigationRecordDto updateInvestigationRecord(UUID recordId, UpdateInvestigationRecordRequest request,
			CustomUser user) {

		InvestigationRecord existingRecord = investigationRecordRepository.findByRecordId(recordId, user)
				.orElseThrow(() -> new IllegalArgumentException("Investigation record not found with ID: " + recordId));

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

		if (request.getReviewerId() != null) {
			Users reviewer = userRepository.findByUserId(request.getReviewerId())
					.orElseThrow(() -> new IllegalArgumentException(
							"Reviewer not found with ID: " + request.getReviewerId()));
			existingRecord.setReviewer(reviewer);
		}

		existingRecord.setUpdatedAt(LocalDateTime.now());

		InvestigationRecord savedRecord = investigationRecordRepository.save(existingRecord);

		if (existingRecord.getCaseInstance() != null) {
			Case caseEntity = existingRecord.getCaseInstance();
			caseEntity.setUpdatedAt(LocalDateTime.now());
			caseRepository.save(caseEntity);
		}

		return savedRecord.toDto();
	}

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

		InvestigationRecord existingRecord = investigationRecordRepository.findByRecordId(recordId, user)
				.orElseThrow(() -> new IllegalArgumentException("Investigation record not found with ID: " + recordId));

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

		if (request.getReviewerId() != null) {
			Users reviewer = userRepository.findByUserId(request.getReviewerId())
					.orElseThrow(() -> new IllegalArgumentException(
							"Reviewer not found with ID: " + request.getReviewerId()));
			existingRecord.setReviewer(reviewer);
		}

		CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UUID currentUserId = currentUser.getId();
		Users uploader = userRepository.findByUserId(currentUserId)
				.orElseThrow(() -> new RuntimeException("Uploader user not found"));

		if (files != null && files.length > 0) {
			LocalDateTime now = LocalDateTime.now();
			List<AttachFile> newAttachedFiles = new ArrayList<>();

			for (int i = 0; i < files.length; i++) {
				MultipartFile file = files[i];

				if (file.isEmpty()) {
					continue;
				}

				String fileType = (fileTypes != null && i < fileTypes.length) ? fileTypes[i] : "EVIDENCE";
				if (!fileType.equals("EVIDENCE") && !fileType.equals("REPORT")) {
					throw new IllegalArgumentException(
							"Invalid file type: " + fileType + ". Must be EVIDENCE or REPORT");
				}

				try {

					String storagePath = fileService.storeInvestigationFile(file, fileType);

					String fileHash = generateFileHash(file);

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

			List<AttachFile> existingFiles = existingRecord.getAttachedFiles();
			if (existingFiles == null) {
				existingFiles = new ArrayList<>();
			}
			existingFiles.addAll(newAttachedFiles);
			existingRecord.setAttachedFiles(existingFiles);
		}

		existingRecord.setUpdatedAt(LocalDateTime.now());

		InvestigationRecord savedRecord = investigationRecordRepository.save(existingRecord);

		if (existingRecord.getCaseInstance() != null) {
			Case caseEntity = existingRecord.getCaseInstance();
			caseEntity.setUpdatedAt(LocalDateTime.now());
			caseRepository.save(caseEntity);
		}

		return savedRecord.toDto();
	}

	@Transactional
	@PreAuthorize("hasRole('INV_ADMIN')")
	public InvestigationRecordDto rejectInvestigationRecord(RejectInvestigationRecordRequest request,
			CustomUser user) {

		InvestigationRecord existingRecord = investigationRecordRepository.findByRecordId(request.getRecordId(), user)
				.orElseThrow(() -> new IllegalArgumentException(
						"Investigation record not found with ID: " + request.getRecordId()));

		existingRecord.setReviewStatus(InvestigationRecord.REVIEW_STATUS.REJECTED);
		existingRecord.setRejectionReason(request.getRejectionReason());

		Users currentUser = userRepository.findByUserId(user.getId())
				.orElseThrow(() -> new IllegalArgumentException("Current user not found"));
		existingRecord.setReviewer(currentUser);
		existingRecord.setReviewedAt(LocalDateTime.now());

		existingRecord.setUpdatedAt(LocalDateTime.now());

		InvestigationRecord savedRecord = investigationRecordRepository.save(existingRecord);
		InvestigationRecordDto investigationRecordDto = savedRecord.toDto();
		CaseDto caseDto = null;

		if (existingRecord.getCaseInstance() != null) {
			Case caseEntity = existingRecord.getCaseInstance();
			caseEntity.setUpdatedAt(LocalDateTime.now());
			caseRepository.save(caseEntity);
			caseDto = caseEntity.toDto();
		}

		if (caseDto != null) {
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
			String formattedDateTime = investigationRecordDto.getReviewedAt().format(formatter);
			Map<String, String> contentMap = new LinkedHashMap<>();
			contentMap.put("NOTIFICATION-KEY.CASE-NUMBER", MessageFormat.format("#{0}", caseDto.getNumber()));
			// contentMap.put("사건번호", MessageFormat.format("#{0}. {1}", caseDto.getNumber(),
			// caseDto.getCaseId().toString()));
			contentMap.put("NOTIFICATION-KEY.CASE-TITLE", caseDto.getCaseName());
			contentMap.put("NOTIFICATION-KEY.CHANGE-DATE", formattedDateTime);

			// http://localhost:3000/investigator/cases/1ad260ba-5a8e-47fa-913b-7eeea20ac701/investigationRecord/d26278be-128b-41be-acd7-a607e4436d93
			notificationService.notifyUser(
					investigationRecordDto.getCreator().getUserId(),
					"NOTIFICATION-KEY.TITLE.REJECTED-INVESTIGATION-RECORD",
					contentMap,
					MessageFormat.format("/investigator/cases/{0}/investigationRecord/{1}",
							investigationRecordDto.getCaseId().toString(),
							investigationRecordDto.getRecordId().toString()));
		}

		// Return DTO
		return investigationRecordDto;
	}

	@Transactional
	@PreAuthorize("hasRole('INV_ADMIN')")
	public InvestigationRecordDto approveInvestigationRecord(ApproveInvestigationRecordRequest request,
			CustomUser user) {

		InvestigationRecord existingRecord = investigationRecordRepository.findByRecordId(request.getRecordId(), user)
				.orElseThrow(() -> new IllegalArgumentException(
						"Investigation record not found with ID: " + request.getRecordId()));

		existingRecord.setReviewStatus(InvestigationRecord.REVIEW_STATUS.APPROVED);
		existingRecord.setRejectionReason(null);

		Users currentUser = userRepository.findByUserId(user.getId())
				.orElseThrow(() -> new IllegalArgumentException("Current user not found"));
		existingRecord.setReviewer(currentUser);
		existingRecord.setReviewedAt(LocalDateTime.now());

		existingRecord.setUpdatedAt(LocalDateTime.now());

		InvestigationRecord savedRecord = investigationRecordRepository.save(existingRecord);
		InvestigationRecordDto investigationRecordDto = savedRecord.toDto();
		CaseDto caseDto = null;

		if (existingRecord.getCaseInstance() != null) {
			Case caseEntity = existingRecord.getCaseInstance();
			caseEntity.setUpdatedAt(LocalDateTime.now());
			switch (savedRecord.getProgressStatus()) {
				case PROGRESS_STATUS.CLOSED:
					caseEntity.setStatus(CASE_STATUS.CLOSED);
					break;
				case PROGRESS_STATUS.ON_HOLD:
					caseEntity.setStatus(CASE_STATUS.ON_HOLD);
					break;
				default:
					caseEntity.setStatus(CASE_STATUS.OPEN);
					break;
			}
			caseRepository.save(caseEntity);
			caseDto = caseEntity.toDto();
		}

		if (caseDto != null) {
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
			String formattedDateTime = investigationRecordDto.getReviewedAt().format(formatter);
			Map<String, String> contentMap = new LinkedHashMap<>();
			contentMap.put("NOTIFICATION-KEY.CASE-NUMBER", MessageFormat.format("#{0}", caseDto.getNumber()));
			// contentMap.put("사건번호", MessageFormat.format("#{0}. {1}", caseDto.getNumber(),
			// caseDto.getCaseId().toString()));
			contentMap.put("NOTIFICATION-KEY.CASE-TITLE", caseDto.getCaseName());
			contentMap.put("NOTIFICATION-KEY.CHANGE-DATE", formattedDateTime);

			// Send approval notification to the creator
			// http://localhost:3000/investigator/cases/1ad260ba-5a8e-47fa-913b-7eeea20ac701/investigationRecord/d26278be-128b-41be-acd7-a607e4436d93
			notificationService.notifyUser(
					investigationRecordDto.getCreator().getUserId(),
					"NOTIFICATION-KEY.TITLE.APPROVED-INVESTIGATION-RECORD",
					contentMap,
					MessageFormat.format("/investigator/cases/{0}/investigationRecord/{1}",
							investigationRecordDto.getCaseId().toString(),
							investigationRecordDto.getRecordId().toString()));

			Case caseEntity = existingRecord.getCaseInstance();
			if (caseEntity.getAssignees() != null) {
				UUID creatorUserId = investigationRecordDto.getCreator().getUserId();
				caseEntity.getAssignees().stream()
						.filter(assignee -> !assignee.getUserId().equals(creatorUserId))
						.forEach(assignee -> {
							notificationService.notifyUser(
									assignee.getUserId(),
									"NOTIFICATION-KEY.TITLE.NEW-INVESTIGATION-RECORD",
									contentMap,
									MessageFormat.format("/investigator/cases/{0}/investigationRecord/{1}",
											investigationRecordDto.getCaseId().toString(),
											investigationRecordDto.getRecordId().toString()));
						});
			}

			boolean progressChanged = false;
			PROGRESS_STATUS previousApprovedProgress = null;
			{
				UUID caseId = existingRecord.getCaseInstance().getCaseId();
				UUID currentRecordId = existingRecord.getRecordId();
				var previousApprovedOpt = investigationRecordRepository.findPreviousApprovedByCase(caseId,
						currentRecordId);
				if (previousApprovedOpt.isPresent()) {
					previousApprovedProgress = previousApprovedOpt.get().getProgressStatus();
					PROGRESS_STATUS currentProgress = existingRecord.getProgressStatus();
					progressChanged = previousApprovedProgress != null && currentProgress != null
							&& !previousApprovedProgress.equals(currentProgress);
				} else {
					progressChanged = true;
				}
			}

			if (progressChanged) {
				Map<String, String> progressContent = new LinkedHashMap<>(contentMap);

				progressContent.put(
						"NOTIFICATION-KEY.PREVIOUS-PROGRESS",
						previousApprovedProgress != null ? MessageFormat.format(
								"incident.PROGRESS_STATUS.{0}",
								previousApprovedProgress.name()) : "");
				progressContent.put("NOTIFICATION-KEY.CURRENT-PROGRESS", MessageFormat.format(
						"incident.PROGRESS_STATUS.{0}",
						existingRecord.getProgressStatus().name()));

				String relatedUrlManager = MessageFormat.format(
						"/manager/cases/{0}",
						investigationRecordDto.getCaseId().toString());

				String relatedUrlInvestigator = MessageFormat.format(
						"/investigator/cases/{0}",
						investigationRecordDto.getCaseId().toString());

				notificationService.notifyUser(
						caseDto.getCreator().getUserId(),
						"NOTIFICATION-KEY.TITLE.PROGRESS-STATUS-CHANGED",
						progressContent,
						relatedUrlManager);

				UUID caseCreatorId = caseDto.getCreator().getUserId();
				if (caseEntity.getAssignees() != null) {
					caseEntity.getAssignees().stream()
							.map(a -> a.getUserId())
							.filter(uid -> !uid.equals(caseCreatorId))
							.distinct()
							.forEach(uid -> {
								notificationService.notifyUser(
										uid,
										"NOTIFICATION-KEY.TITLE.PROGRESS-STATUS-CHANGED",
										progressContent,
										relatedUrlInvestigator);
							});
				}

				if (existingRecord.getProgressStatus() == PROGRESS_STATUS.CLOSED) {
					Map<String, String> caseClosed = new LinkedHashMap<>(contentMap);

					notificationService.notifyUser(
							caseDto.getCreator().getUserId(),
							"NOTIFICATION-KEY.TITLE.CASE-CLOSED",
							caseClosed,
							relatedUrlManager);

					if (caseEntity.getAssignees() != null) {
						caseEntity.getAssignees().stream()
								.map(a -> a.getUserId())
								.filter(uid -> !uid.equals(caseCreatorId))
								.distinct()
								.forEach(uid -> {
									notificationService.notifyUser(
											uid,
											"NOTIFICATION-KEY.TITLE.CASE-CLOSED",
											caseClosed,
											relatedUrlInvestigator);
								});
					}
				}
			}
		}

		return investigationRecordDto;
	}

	@Transactional
	@PreAuthorize("hasRole('INVESTIGATOR') or hasRole('RESEARCHER')")
	public InvestigationRecordDto requestReviewInvestigationRecord(RequestReviewInvestigationRecordRequest request,
			CustomUser user) {

		InvestigationRecord existingRecord = investigationRecordRepository.findByRecordId(request.getRecordId(), user)
				.orElseThrow(() -> new IllegalArgumentException(
						"Investigation record not found with ID: " + request.getRecordId()));

		if (!existingRecord.getCreator().getUserId().equals(user.getId())) {
			throw new IllegalArgumentException("Only the creator can request review for this investigation record");
		}

		if (existingRecord.getReviewStatus() != InvestigationRecord.REVIEW_STATUS.WRITING
				&& existingRecord.getReviewStatus() != InvestigationRecord.REVIEW_STATUS.REJECTED) {
			throw new IllegalArgumentException(
					"Review can only be requested when status is WRITING or REJECTED. Current status: "
							+ existingRecord.getReviewStatus());
		}

		existingRecord.setReviewStatus(InvestigationRecord.REVIEW_STATUS.PENDING);
		existingRecord.setRequestedAt(ZonedDateTime.now());

		existingRecord.setReviewer(null);
		existingRecord.setReviewedAt(null);
		existingRecord.setRejectionReason(null);

		existingRecord.setUpdatedAt(LocalDateTime.now());

		InvestigationRecord savedRecord = investigationRecordRepository.save(existingRecord);
		InvestigationRecordDto investigationRecordDto = savedRecord.toDto();
		CaseDto caseDto = null;

		if (existingRecord.getCaseInstance() != null) {
			Case caseEntity = existingRecord.getCaseInstance();
			caseEntity.setUpdatedAt(LocalDateTime.now());
			caseRepository.save(caseEntity);
			savedRecord.setCaseInstance(caseEntity);
			caseDto = caseEntity.toDto();
		}

		if (caseDto != null) {
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
			String formattedDateTime = investigationRecordDto.getRequestedAt().format(formatter);
			Map<String, String> contentMap = new LinkedHashMap<>();
			contentMap.put("NOTIFICATION-KEY.CASE-NUMBER", MessageFormat.format("#{0}", caseDto.getNumber()));
			// contentMap.put("사건번호", MessageFormat.format("#{0}. {1}", caseDto.getNumber(),
			// caseDto.getCaseId().toString()));
			contentMap.put("NOTIFICATION-KEY.CASE-TITLE", caseDto.getCaseName());
			contentMap.put("NOTIFICATION-KEY.CHANGE-DATE", formattedDateTime);

			// http://localhost:3000/manager/cases/1ad260ba-5a8e-47fa-913b-7eeea20ac701/inquiry/d26278be-128b-41be-acd7-a607e4436d93
			notificationService.notifyUser(
					caseDto.getCreator().getUserId(),
					"NOTIFICATION-KEY.TITLE.REQUEST-TO-REVIEW",
					contentMap,
					MessageFormat.format("/manager/cases/{0}/inquiry/{1}",
							investigationRecordDto.getCaseId().toString(),
							investigationRecordDto.getRecordId().toString()));
		}

		return investigationRecordDto;
	}

	private String generateFileHash(MultipartFile file) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = digest.digest(file.getBytes());

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

			return "hash_error_" + System.currentTimeMillis();
		}
	}
}
