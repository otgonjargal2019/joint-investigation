package com.lsware.joint_investigation.cases.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lsware.joint_investigation.cases.entity.CaseAssignee;
import com.lsware.joint_investigation.cases.entity.CaseAssigneeId;

import java.util.List;
import java.util.UUID;

@Repository
public interface CaseAssigneeRepository extends JpaRepository<CaseAssignee, CaseAssigneeId> {

	List<CaseAssignee> findByCaseId(UUID caseId);

	List<CaseAssignee> findByUserId(UUID userId);

	boolean existsByCaseIdAndUserId(UUID caseId, UUID userId);

	void deleteByCaseIdAndUserIdIn(UUID caseId, List<UUID> userIds);

	void deleteByCaseId(UUID caseId);

	@Query("SELECT ca FROM CaseAssignee ca " +
			"JOIN FETCH ca.caseInstance ci " +
			"JOIN FETCH ca.user u " +
			"JOIN FETCH u.country c " +
			"JOIN FETCH u.headquarter h " +
			"JOIN FETCH u.department d " +
			"WHERE ca.caseId = :caseId AND ci.creator.userId = :userId " +
			"ORDER BY ca.assignedAt DESC")
	List<CaseAssignee> findByCaseIdWithUserDetails(@Param("caseId") UUID caseId, @Param("userId") UUID userId);

	@Query("SELECT ca FROM CaseAssignee ca " +
			"JOIN FETCH ca.caseInstance c " +
			"JOIN FETCH ca.user u " +
			"JOIN FETCH u.country co " +
			"JOIN FETCH u.headquarter h " +
			"JOIN FETCH u.department d " +
			"WHERE ca.userId = :userId " +
			"ORDER BY ca.assignedAt DESC")
	List<CaseAssignee> findByUserIdWithCaseDetails(@Param("userId") UUID userId);

	@Query("SELECT COUNT(ca) FROM CaseAssignee ca WHERE ca.caseId = :caseId")
	long countByCaseId(@Param("caseId") UUID caseId);

	@Query("SELECT COUNT(ca) FROM CaseAssignee ca WHERE ca.userId = :userId")
	long countByUserId(@Param("userId") UUID userId);
}
