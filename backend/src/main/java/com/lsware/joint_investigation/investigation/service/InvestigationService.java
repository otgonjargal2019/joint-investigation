package com.lsware.joint_investigation.investigation.service;

import org.springframework.stereotype.Service;
import com.lsware.joint_investigation.investigation.repository.InvestigationRecordRepository;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import com.lsware.joint_investigation.investigation.dto.InvestigationRecordDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Map;

@Service
public class InvestigationService {
	@Autowired
	private InvestigationRecordRepository investigationRecordRepository;

	public Map<String, Object> getInvestigationRecords(String recordName, PROGRESS_STATUS progressStatus, Pageable pageable) {
		Map<String, Object> result = investigationRecordRepository.findInvestigationRecord(recordName, progressStatus, pageable);

		@SuppressWarnings("unchecked")
		List<InvestigationRecord> records = (List<InvestigationRecord>) result.get("rows");
		List<InvestigationRecordDto> dtos = records.stream()
			.map(InvestigationRecord::toDto)
			.toList();

		return Map.of(
			"rows", dtos,
			"total", result.get("total")
		);
	}
}
