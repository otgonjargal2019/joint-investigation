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
import com.lsware.joint_investigation.util.QuerydslHelper;
import com.lsware.joint_investigation.cases.entity.Case.CASE_STATUS;
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

    private BooleanExpression createPredicate(String name, CASE_STATUS status) {
        QCase q = QCase.case$;

        BooleanExpression namePredicate = name != null
            ? q.caseName.containsIgnoreCase(name.trim())
            : null;

        BooleanExpression statusPredicate = status != null
            ? q.status.eq(status)
            : null;

        if (namePredicate != null && statusPredicate != null) {
            return namePredicate.and(statusPredicate);
        }

        return namePredicate != null ? namePredicate : statusPredicate;
    }

    public Map<String, Object> getCaseList(String name, CASE_STATUS status, Pageable pageable) {
        BooleanExpression combinedPredicate = createPredicate(name, status);

        List<Case> rows = queryFactory
            .selectFrom(QCase.case$)
            .where(combinedPredicate)
            .limit(pageable.getPageSize())
            .offset(pageable.getOffset())
            .orderBy(QuerydslHelper.getSortedColumn(QCase.case$, pageable.getSort()))
            .fetch();

        Long total = queryFactory
            .select(QCase.case$.caseId.count())
            .from(QCase.case$)
            .where(combinedPredicate)
            .fetchOne();

        return Map.of(
            "rows", rows,
            "total", total);
    }
}
