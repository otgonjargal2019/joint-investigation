package com.lsware.joint_investigation.investigation.repository;

import java.util.List;
import java.util.Map;

import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
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

    // public InvestigationRecordRepository(Class<InvestigationRecord> domainClass, EntityManager entityManager) {
    //     super(domainClass, entityManager);
    // }

    private EntityManager em;

    @Autowired
    private JPAQueryFactory queryFactory;

    public InvestigationRecordRepository(EntityManager entityManager) {
        super(InvestigationRecord.class, entityManager);
        em = entityManager;
        queryFactory = new JPAQueryFactory(em);
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
                .select(QInvestigationRecord.investigationRecord.recordId.count())
                .from(QInvestigationRecord.investigationRecord)
                .where(combinedPredicate)
                .fetchOne();

        return Map.of(
                "rows", rows,
                "total", total);
    }

}
