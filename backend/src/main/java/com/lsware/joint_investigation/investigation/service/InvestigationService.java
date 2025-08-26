package com.lsware.joint_investigation.investigation.service;

import org.springframework.stereotype.Service;
import com.lsware.joint_investigation.investigation.repository.InvestigationRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class InvestigationService {
	private final InvestigationRecordRepository investigationRecordRepository;

	@Autowired
	public InvestigationService(InvestigationRecordRepository investigationRecordRepository) {
		this.investigationRecordRepository = investigationRecordRepository;
	}

	public Map<String, Object> getInvestigationRecords(String recordName, Pageable pageable) {
		return investigationRecordRepository.findInvestigationRecord(recordName, pageable);
	}
}
