package com.lsware.joint_investigation.investigation.service;

import org.springframework.stereotype.Service;
import com.lsware.joint_investigation.investigation.repository.InvestigationRecordRepository;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import java.util.Map;

@Service
public class InvestigationService {
	@Autowired
	private InvestigationRecordRepository investigationRecordRepository;

	public Map<String, Object> getInvestigationRecords(String recordName, PROGRESS_STATUS progressStatus, Pageable pageable) {
		return investigationRecordRepository.findInvestigationRecord(recordName, progressStatus, pageable);
	}
}
