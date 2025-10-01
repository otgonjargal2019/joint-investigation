package com.lsware.joint_investigation.cases.repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;
import com.lsware.joint_investigation.cases.entity.Case;
import com.lsware.joint_investigation.cases.entity.QCase;
import com.lsware.joint_investigation.cases.entity.QCaseAssignee;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.REVIEW_STATUS;
import com.lsware.joint_investigation.investigation.entity.QInvestigationRecord;
import com.lsware.joint_investigation.util.QuerydslHelper;
import com.lsware.joint_investigation.cases.entity.Case.CASE_STATUS;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;

import jakarta.persistence.EntityManager;

@Repository
public class CaseRepository extends SimpleJpaRepository<Case, UUID> {

	@Autowired
	private JPAQueryFactory queryFactory;

	public CaseRepository(EntityManager entityManager) {
		super(Case.class, entityManager);
	}

	private BooleanExpression createPredicate(CustomUser user, String name, CASE_STATUS status) {
		QCase q = QCase.case$;

		BooleanExpression userIdPredicate = q.creator.userId.eq(user.getId());

		BooleanExpression namePredicate = name != null
				? q.caseName.containsIgnoreCase(name.trim())
				: null;

		BooleanExpression statusPredicate = status != null
				? q.status.eq(status)
				: null;

		if (namePredicate != null) {
			userIdPredicate.and(namePredicate);
		}

		if (statusPredicate != null) {
			return userIdPredicate.and(statusPredicate);
		}

		return userIdPredicate;
	}

	public Map<String, Object> getCaseList(CustomUser user, String name, CASE_STATUS status, Pageable pageable) {
		QCase qCase = QCase.case$;
		QInvestigationRecord qRecord = QInvestigationRecord.investigationRecord;

		BooleanExpression combinedPredicate = createPredicate(user, name, status);

		var latestRecordSubquery = queryFactory
				.select(qRecord.updatedAt.max())
				.from(qRecord)
				.where(qRecord.caseInstance.caseId.eq(qCase.caseId)
						.and(qRecord.reviewStatus.eq(REVIEW_STATUS.APPROVED)));

		List<Tuple> results = queryFactory
				.select(qCase, qRecord)
				.from(qCase)
				.leftJoin(qRecord).on(
						qRecord.caseInstance.caseId.eq(qCase.caseId)
								.and(qRecord.updatedAt.eq(latestRecordSubquery)))
				.where(combinedPredicate)
				.limit(pageable.getPageSize())
				.offset(pageable.getOffset())
				.orderBy(QuerydslHelper.getSortedColumn(qCase, pageable.getSort()))
				.fetch();

		List<Case> cases = results.stream()
				.map(tuple -> {
					Case caseEntity = tuple.get(qCase);
					InvestigationRecord record = tuple.get(qRecord);
					caseEntity.setLatestRecord(record); // attach latest record
					return caseEntity;
				})
				.toList();

		Long total = queryFactory
				.select(qCase.caseId.count())
				.from(qCase)
				.where(combinedPredicate)
				.fetchOne();

		return Map.of(
				"rows", cases,
				"total", total);
	}

	public Tuple findById(UUID caseId, CustomUser user) {
		QCase qcase = QCase.case$;
		QInvestigationRecord qRecord = QInvestigationRecord.investigationRecord;
		QCaseAssignee qAssignee = QCaseAssignee.caseAssignee;

		Tuple found = null;

		BooleanExpression rootPredicate = qcase.caseId.eq(caseId);

		var latestRecordSubquery = queryFactory
				.select(qRecord.updatedAt.max())
				.from(qRecord)
				.where(qRecord.caseInstance.caseId.eq(qcase.caseId)
						.and(qRecord.reviewStatus.eq(REVIEW_STATUS.APPROVED)));

		if (user != null && user.getAuthorities() != null &&
				user.getAuthorities().stream().anyMatch(auth -> "ROLE_INV_ADMIN".equals(auth.getAuthority()))) {
			rootPredicate = rootPredicate.and(qcase.creator.userId.eq(user.getId()));

			found = queryFactory
					.select(qcase, qRecord)
					.from(qcase)
					.leftJoin(qRecord).on(
							qRecord.caseInstance.caseId.eq(qcase.caseId)
									.and(qRecord.updatedAt.eq(latestRecordSubquery)))
					.where(rootPredicate)
					.distinct()
					.fetchOne();
		}

		if (user != null && user.getAuthorities() != null &&
				user.getAuthorities().stream().anyMatch(auth -> "ROLE_INVESTIGATOR".equals(auth.getAuthority())
						|| "ROLE_RESEARCHER".equals(auth.getAuthority()))) {
			rootPredicate = rootPredicate.and(qAssignee.userId.eq(user.getId()));

			found = queryFactory
					.select(qcase, qRecord)
					.from(qcase)
					.leftJoin(qRecord).on(
							qRecord.caseInstance.caseId.eq(qcase.caseId)
									.and(qRecord.updatedAt.eq(latestRecordSubquery)))
					.leftJoin(qcase.assignees, qAssignee)
					.where(rootPredicate)
					.distinct()
					.fetchOne();
		}

		return found;
	}

	public Page<Case> findAssignedCases(UUID userId, String name, CASE_STATUS status, Pageable pageable) {
		QCase qCase = QCase.case$;
		QCaseAssignee qAssignee = QCaseAssignee.caseAssignee;
		QInvestigationRecord qRecord = QInvestigationRecord.investigationRecord;

		// Build the where clause
		BooleanExpression assigneePredicate = qAssignee.userId.eq(userId);

		BooleanExpression namePredicate = name != null && !name.trim().isEmpty()
				? qCase.caseName.containsIgnoreCase(name.trim())
				: null;

		BooleanExpression statusPredicate = status != null
				? qCase.status.eq(status)
				: null;

		BooleanExpression combinedPredicate = assigneePredicate;
		if (namePredicate != null) {
			combinedPredicate = combinedPredicate.and(namePredicate);
		}
		if (statusPredicate != null) {
			combinedPredicate = combinedPredicate.and(statusPredicate);
		}

		var latestRecordSubquery = queryFactory
				.select(qRecord.createdAt.max())
				.from(qRecord)
				.where(qRecord.caseInstance.caseId.eq(qCase.caseId)
						.and(qRecord.reviewStatus.eq(REVIEW_STATUS.APPROVED)));

		List<Tuple> results = queryFactory
				.select(qCase, qRecord)
				.from(qCase)
				.innerJoin(qAssignee).on(qAssignee.caseId.eq(qCase.caseId))
				.leftJoin(qRecord).on(
						qRecord.caseInstance.caseId.eq(qCase.caseId)
								.and(qRecord.createdAt.eq(latestRecordSubquery)))
				.where(combinedPredicate)
				.limit(pageable.getPageSize())
				.offset(pageable.getOffset())
				.orderBy(QuerydslHelper.getSortedColumn(qCase, pageable.getSort()))
				.fetch();

		List<Case> cases = results.stream()
				.map(tuple -> {
					Case caseEntity = tuple.get(qCase);
					InvestigationRecord record = tuple.get(qRecord);
					if (record != null) {
						caseEntity.setLatestRecord(record);
					}
					return caseEntity;
				})
				.toList();

		// Count total
		Long total = queryFactory
				.select(qCase.caseId.countDistinct())
				.from(qCase)
				.innerJoin(qAssignee).on(qAssignee.caseId.eq(qCase.caseId))
				.where(combinedPredicate)
				.fetchOne();

		return new PageImpl<>(cases, pageable, total != null ? total : 0);
	}

	/**
	 * Find the most recent 3 updated cases for a specific assignee
	 *
	 * @param userId The ID of the assigned user
	 * @return List of the 3 most recently updated cases assigned to the user
	 */
	public List<Case> findRecentAssignedCases(UUID userId) {
		QCase qCase = QCase.case$;
		QCaseAssignee qAssignee = QCaseAssignee.caseAssignee;
		QInvestigationRecord qRecord = QInvestigationRecord.investigationRecord;

		var latestRecordSubquery = queryFactory
				.select(qRecord.createdAt.max())
				.from(qRecord)
				.where(qRecord.caseInstance.caseId.eq(qCase.caseId)
						.and(qRecord.reviewStatus.eq(REVIEW_STATUS.APPROVED)));

		List<Tuple> results = queryFactory
				.select(qCase, qRecord)
				.from(qCase)
				.innerJoin(qAssignee).on(qAssignee.caseId.eq(qCase.caseId))
				.leftJoin(qRecord).on(
						qRecord.caseInstance.caseId.eq(qCase.caseId)
								.and(qRecord.createdAt.eq(latestRecordSubquery)))
				.where(qAssignee.userId.eq(userId).and(qCase.status.ne(CASE_STATUS.CLOSED)))
				.orderBy(

						Expressions.dateTimeTemplate(
								java.time.LocalDateTime.class,
								"GREATEST({0}, {1})",
								qRecord.updatedAt.coalesce(qCase.updatedAt),
								qCase.updatedAt).desc())
				.limit(3)
				.fetch();

		return results.stream()
				.map(tuple -> {
					Case caseEntity = tuple.get(qCase);
					InvestigationRecord record = tuple.get(qRecord);
					if (record != null) {
						caseEntity.setLatestRecord(record);
					}
					return caseEntity;
				})
				.toList();
	}
}
