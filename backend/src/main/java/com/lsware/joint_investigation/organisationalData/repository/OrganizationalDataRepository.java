package com.lsware.joint_investigation.organisationalData.repository;

import com.lsware.joint_investigation.user.entity.*;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class OrganizationalDataRepository extends SimpleJpaRepository<Users, Integer> {

    private EntityManager em;
    private JPAQueryFactory queryFactory;
    protected final QUsers users = QUsers.users;
    protected final QCountry country = QCountry.country;
    protected final QHeadquarter headquarter = QHeadquarter.headquarter;
    protected final QDepartment department = QDepartment.department;

    public OrganizationalDataRepository(EntityManager entityManager) {
        super(Users.class, entityManager);
        em = entityManager;
        queryFactory = new JPAQueryFactory(em);
    }

    /**
     * Get all investigators from a specific country
     */
    public List<Users> findInvestigatorsByCountryId(Long countryId) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(users.countryId.eq(countryId));
        builder.and(users.role.eq(Role.INVESTIGATOR));
        builder.and(users.status.eq(Users.USER_STATUS.ACTIVE));

        return queryFactory
                .selectFrom(users)
                .where(builder)
                .orderBy(users.nameKr.asc())
                .fetch();
    }

    /**
     * Get all INV_ADMIN users from countries other than the specified country
     */
    public List<Users> findInvAdminsFromOtherCountries(Long excludeCountryId) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(users.countryId.ne(excludeCountryId));
        builder.and(users.role.eq(Role.INV_ADMIN));
        builder.and(users.status.eq(Users.USER_STATUS.ACTIVE));

        return queryFactory
                .selectFrom(users)
                .where(builder)
                .orderBy(users.countryId.asc(), users.nameKr.asc())
                .fetch();
    }

    /**
     * Get all headquarters for a specific country
     */
    public List<Headquarter> findHeadquartersByCountryId(Long countryId) {
        return queryFactory
                .selectFrom(headquarter)
                .where(headquarter.country.id.eq(countryId))
                .orderBy(headquarter.name.asc())
                .fetch();
    }

    /**
     * Get all departments for a specific country
     */
    public List<Department> findDepartmentsByCountryId(Long countryId) {
        return queryFactory
                .selectFrom(department)
                .where(department.country.id.eq(countryId))
                .orderBy(department.headquarter.id.asc(), department.name.asc())
                .fetch();
    }

    /**
     * Get country by ID
     */
    public Country findCountryById(Long countryId) {
        return queryFactory
                .selectFrom(country)
                .where(country.id.eq(countryId))
                .fetchOne();
    }

    /**
     * Get all countries except the specified one
     */
    public List<Country> findOtherCountries(Long excludeCountryId) {
        return queryFactory
                .selectFrom(country)
                .where(country.id.ne(excludeCountryId))
                .orderBy(country.name.asc())
                .fetch();
    }
}
