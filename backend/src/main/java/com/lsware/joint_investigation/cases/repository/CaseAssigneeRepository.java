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

    /**
     * Find all case assignees for a specific case
     */
    List<CaseAssignee> findByCaseId(UUID caseId);

    /**
     * Find all case assignees for a specific user
     */
    List<CaseAssignee> findByUserId(UUID userId);

    /**
     * Check if a user is assigned to a case
     */
    boolean existsByCaseIdAndUserId(UUID caseId, UUID userId);

    /**
     * Delete assignments for a specific case and users
     */
    void deleteByCaseIdAndUserIdIn(UUID caseId, List<UUID> userIds);

    /**
     * Delete all assignments for a specific case
     */
    void deleteByCaseId(UUID caseId);

    /**
     * Find case assignees with user details
     */
    @Query("SELECT ca FROM CaseAssignee ca " +
           "JOIN FETCH ca.user u " +
           "WHERE ca.caseId = :caseId " +
           "ORDER BY ca.assignedAt DESC")
    List<CaseAssignee> findByCaseIdWithUserDetails(@Param("caseId") UUID caseId);

    /**
     * Find case assignees with case details for a user
     */
    @Query("SELECT ca FROM CaseAssignee ca " +
           "JOIN FETCH ca.caseInstance c " +
           "WHERE ca.userId = :userId " +
           "ORDER BY ca.assignedAt DESC")
    List<CaseAssignee> findByUserIdWithCaseDetails(@Param("userId") UUID userId);

    /**
     * Count assignments for a case
     */
    @Query("SELECT COUNT(ca) FROM CaseAssignee ca WHERE ca.caseId = :caseId")
    long countByCaseId(@Param("caseId") UUID caseId);

    /**
     * Count cases assigned to a user
     */
    @Query("SELECT COUNT(ca) FROM CaseAssignee ca WHERE ca.userId = :userId")
    long countByUserId(@Param("userId") UUID userId);
}
