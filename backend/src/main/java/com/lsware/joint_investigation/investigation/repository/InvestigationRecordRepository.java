package com.lsware.joint_investigation.investigation.repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import com.lsware.joint_investigation.util.QuerydslHelper;
import com.lsware.joint_investigation.investigation.entity.QInvestigationRecord;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

import jakarta.persistence.EntityManager;

@Repository
public class InvestigationRecordRepository extends SimpleJpaRepository<InvestigationRecord, String> {

    @Autowired
    private JPAQueryFactory queryFactory;

    public InvestigationRecordRepository(EntityManager entityManager) {
        super(InvestigationRecord.class, entityManager);
    }

    private BooleanExpression createPredicate(String recordName, PROGRESS_STATUS progressStatus, String caseId) {
        QInvestigationRecord q = QInvestigationRecord.investigationRecord;

        BooleanExpression rootPredicate = q.recordId.isNotNull();

        if (recordName != null) {
            rootPredicate = rootPredicate.and(q.recordName.containsIgnoreCase(recordName.trim()));
        }

        if (progressStatus != null) {
            rootPredicate = rootPredicate.and(q.progressStatus.eq(progressStatus));
        }

        if (caseId != null) {
            rootPredicate = rootPredicate.and(q.caseInstance.caseId.eq(UUID.fromString(caseId)));
        }

        return rootPredicate;
    }

    public Map<String, Object> findInvestigationRecord(String recordName, PROGRESS_STATUS progressStatus, String caseId, Pageable pageable) {

        BooleanExpression combinedPredicate = createPredicate(recordName, progressStatus, caseId);

        List<InvestigationRecord> rows = queryFactory
                .selectFrom(QInvestigationRecord.investigationRecord)
                .where(combinedPredicate)
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .orderBy(QuerydslHelper.getSortedColumn(QInvestigationRecord.investigationRecord, pageable.getSort()))
                .fetch();

        Long total = queryFactory
                .select(QInvestigationRecord.investigationRecord.recordId.count())
                .from(QInvestigationRecord.investigationRecord)
                .where(combinedPredicate)
                .fetchOne();

        return Map.of(
                "rows", rows,
                "total", total);
    }

}
