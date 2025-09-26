package com.lsware.joint_investigation.investigation.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.lsware.joint_investigation.cases.entity.QCase;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.REVIEW_STATUS;
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

    private BooleanExpression createPredicate(String recordName, PROGRESS_STATUS progressStatus, String caseId, CustomUser user) {
        QInvestigationRecord q = QInvestigationRecord.investigationRecord;
        QCase qcase = QCase.case$;

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

        // Add role-based filtering for INV_ADMIN users
        if (user != null && user.getAuthorities() != null &&
            user.getAuthorities().stream().anyMatch(auth -> "ROLE_INV_ADMIN".equals(auth.getAuthority()))) {
            rootPredicate = rootPredicate.and(qcase.creator.userId.eq(user.getId()));
            rootPredicate = rootPredicate.and(
                q.reviewStatus.eq(REVIEW_STATUS.PENDING)
                .or(q.reviewStatus.eq(REVIEW_STATUS.APPROVED))
            );
        }

        // Add role-based filtering for INVESTIGATOR and RESEARCHER users
        if (user != null && user.getAuthorities() != null &&
                user.getAuthorities().stream().anyMatch(auth -> "ROLE_INVESTIGATOR".equals(auth.getAuthority())
                        || "ROLE_RESEARCHER".equals(auth.getAuthority()))) {
            rootPredicate = rootPredicate.and(
                q.creator.userId.eq(user.getId()).
                or(
                    q.creator.userId.ne(user.getId()).
                    and(q.reviewStatus.eq(REVIEW_STATUS.APPROVED))
                )
            );
        }

        return rootPredicate;
    }

    public Optional<InvestigationRecord> findByRecordId(UUID recordId, CustomUser user) {
        QInvestigationRecord q = QInvestigationRecord.investigationRecord;
        QCase qcase = QCase.case$;

        BooleanExpression rootPredicate = q.recordId.eq(recordId);

        if (user != null && user.getAuthorities() != null &&
            user.getAuthorities().stream().anyMatch(auth -> "ROLE_INV_ADMIN".equals(auth.getAuthority()))) {
            rootPredicate = rootPredicate.and(qcase.creator.userId.eq(user.getId()));
            rootPredicate = rootPredicate.and(
                q.reviewStatus.eq(REVIEW_STATUS.PENDING)
                .or(q.reviewStatus.eq(REVIEW_STATUS.APPROVED))
            );
        }

        if (user != null && user.getAuthorities() != null &&
                user.getAuthorities().stream().anyMatch(auth -> "ROLE_INVESTIGATOR".equals(auth.getAuthority())
                        || "ROLE_RESEARCHER".equals(auth.getAuthority()))) {
            rootPredicate = rootPredicate.and(
                q.creator.userId.eq(user.getId()).
                or(
                    q.creator.userId.ne(user.getId()).
                    and(q.reviewStatus.eq(REVIEW_STATUS.APPROVED))
                )
            );
        }

        InvestigationRecord result = queryFactory
                .selectFrom(q)
                .leftJoin(q.caseInstance, QCase.case$)
                .leftJoin(q.creator).fetchJoin()
                .leftJoin(q.reviewer).fetchJoin()
                .leftJoin(q.attachedFiles).fetchJoin()
                .where(rootPredicate)
                .fetchOne();

        return Optional.ofNullable(result);
    }

    public Map<String, Object> findInvestigationRecord(String recordName, PROGRESS_STATUS progressStatus, String caseId,
            Pageable pageable, CustomUser user) {

        BooleanExpression combinedPredicate = createPredicate(recordName, progressStatus, caseId, user);

        QInvestigationRecord q = QInvestigationRecord.investigationRecord;

        List<InvestigationRecord> rows = queryFactory
                .selectFrom(q)
                .leftJoin(q.caseInstance, QCase.case$)
                .where(combinedPredicate)
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .orderBy(QuerydslHelper.getSortedColumn(q, pageable.getSort()))
                .fetch();

        Long total = queryFactory
                .select(q.recordId.count())
                .from(q)
                .leftJoin(q.caseInstance, QCase.case$)
                .where(combinedPredicate)
                .fetchOne();

        return Map.of(
                "rows", rows,
                "total", total);
    }

    /**
     * Find the most recent APPROVED investigation record for a case, excluding a specific record ID.
     * Useful to compare the newly approved record's progress with the previous approved one.
     */
    public Optional<InvestigationRecord> findPreviousApprovedByCase(UUID caseId, UUID excludeRecordId) {
    QInvestigationRecord q = QInvestigationRecord.investigationRecord;

    InvestigationRecord result = queryFactory
        .selectFrom(q)
        .where(
            q.caseInstance.caseId.eq(caseId)
                .and(q.reviewStatus.eq(REVIEW_STATUS.APPROVED))
                .and(q.recordId.ne(excludeRecordId))
        )
        .orderBy(
            // Prefer reviewedAt desc; fallback to updatedAt/createdAt for stable ordering
            q.reviewedAt.desc(),
            q.updatedAt.desc(),
            q.createdAt.desc()
        )
        .limit(1)
        .fetchOne();

    return Optional.ofNullable(result);
    }

}
