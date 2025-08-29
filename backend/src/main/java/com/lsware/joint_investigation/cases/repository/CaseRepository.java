package com.lsware.joint_investigation.cases.repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;
import com.lsware.joint_investigation.cases.entity.Case;
import com.lsware.joint_investigation.cases.entity.QCase;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.investigation.entity.QInvestigationRecord;
import com.lsware.joint_investigation.util.QuerydslHelper;
import com.lsware.joint_investigation.cases.entity.Case.CASE_STATUS;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

import jakarta.persistence.EntityManager;

@Repository
public class CaseRepository extends SimpleJpaRepository<Case, UUID> {

    @Autowired
    private JPAQueryFactory queryFactory;

    public CaseRepository(EntityManager entityManager) {
        super(Case.class, entityManager);
    }

    private BooleanExpression createPredicate(UUID userId, String name, CASE_STATUS status) {
        QCase q = QCase.case$;

        BooleanExpression userIdPredicate = q.creator.userId.eq(userId);

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

    public Map<String, Object> getCaseList(UUID userId, String name, CASE_STATUS status, Pageable pageable) {
        QCase qCase = QCase.case$;
        QInvestigationRecord qRecord = QInvestigationRecord.investigationRecord;

        BooleanExpression combinedPredicate = createPredicate(userId, name, status);

        var latestRecordSubquery = queryFactory
            .select(qRecord.createdAt.max())
            .from(qRecord)
            .where(qRecord.caseId.eq(qCase.caseId));

        List<Tuple> results = queryFactory
            .select(qCase, qRecord)
            .from(qCase)
            .leftJoin(qRecord).on(
                qRecord.caseId.eq(qCase.caseId)
                .and(qRecord.createdAt.eq(latestRecordSubquery))
            )
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
            "total", total
        );
    }
}
