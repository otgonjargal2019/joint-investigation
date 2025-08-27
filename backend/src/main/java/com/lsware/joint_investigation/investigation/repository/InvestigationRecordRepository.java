package com.lsware.joint_investigation.investigation.repository;

import java.util.List;
import java.util.Map;

import com.lsware.joint_investigation.investigation.dto.InvestigationRecordDto;
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

    private EntityManager em;

    @Autowired
    private JPAQueryFactory queryFactory;

    public InvestigationRecordRepository(EntityManager entityManager) {
        super(InvestigationRecord.class, entityManager);
        em = entityManager;
    }

    private BooleanExpression createPredicate(String recordName, PROGRESS_STATUS progressStatus) {
        QInvestigationRecord q = QInvestigationRecord.investigationRecord;

        BooleanExpression recordNamePredicate = recordName != null
                ? q.recordName.containsIgnoreCase(recordName.trim())
                : null;

        BooleanExpression progressStatusPredicate = progressStatus != null
                ? q.progressStatus.eq(progressStatus)
                : null;

        if (recordNamePredicate != null && progressStatusPredicate != null) {
            return recordNamePredicate.and(progressStatusPredicate);
        }
        return recordNamePredicate != null ? recordNamePredicate : progressStatusPredicate;
    }

    public Map<String, Object> findInvestigationRecord(String recordName, PROGRESS_STATUS progressStatus, Pageable pageable) {

        BooleanExpression combinedPredicate = createPredicate(recordName, progressStatus);

        List<InvestigationRecordDto> rows = queryFactory
                .selectFrom(QInvestigationRecord.investigationRecord)
                .where(combinedPredicate)
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .orderBy(QuerydslHelper.getSortedColumn(QInvestigationRecord.investigationRecord, pageable.getSort()))
                .fetch().stream().map(entity -> {
                    InvestigationRecordDto dto = entity.toDto();
                    return dto;
                }).toList();

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
