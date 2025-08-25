package com.lsware.joint_investigation.investigation.repository;

import java.util.List;
import java.util.Map;

import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.investigation.entity.QInvestigationRecord;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

import jakarta.persistence.EntityManager;

@Repository
public class InvestigationRecordRepository extends SimpleJpaRepository<InvestigationRecord, String> {

    final private EntityManager em;
    private JPAQueryFactory queryFactory;

    public InvestigationRecordRepository(EntityManager entityManager, JPAQueryFactory queryFactory) {
        super(InvestigationRecord.class, entityManager);
        this.em = entityManager;
        this.queryFactory = queryFactory;
    }

    private BooleanExpression createPredicate(String recordName) {
        QInvestigationRecord qInvestigationRecord = QInvestigationRecord.investigationRecord;
        BooleanExpression recordNamePredicate = recordName != null
                ? qInvestigationRecord.recordName.containsIgnoreCase(recordName.trim())
                : null;

        return recordNamePredicate;
    }

    public Map<String, Object> findInvestigationRecord(String recordName, Pageable pageable) {

        BooleanExpression combinedPredicate = createPredicate(recordName);

        List<InvestigationRecord> rows = queryFactory
                .selectFrom(QInvestigationRecord.investigationRecord)
                .where(combinedPredicate)
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .orderBy(QInvestigationRecord.investigationRecord.recordName.asc())
                .fetch();

        Long total = queryFactory
                .select(QInvestigationRecord.investigationRecord.record_id.count())
                .from(QInvestigationRecord.investigationRecord)
                .where(combinedPredicate)
                .fetchOne();

        return Map.of(
                "rows", rows,
                "total", total);
    }

}
