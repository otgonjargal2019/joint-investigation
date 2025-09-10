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
        builder.and(users.status.eq(Users.USER_STATUS.APPROVED));

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
        builder.and(users.status.eq(Users.USER_STATUS.APPROVED));

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

    /**
     * Get headquarters for a specific country with optional name search
     */
    public List<Headquarter> findHeadquartersByCountryIdWithSearch(Long countryId, String headquarterName) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(headquarter.country.id.eq(countryId));

        if (headquarterName != null && !headquarterName.trim().isEmpty()) {
            builder.and(headquarter.name.containsIgnoreCase(headquarterName.trim()));
        }

        return queryFactory
                .selectFrom(headquarter)
                .where(builder)
                .orderBy(headquarter.name.asc())
                .fetch();
    }

    /**
     * Get departments for a specific country with optional name search
     */
    public List<Department> findDepartmentsByCountryIdWithSearch(Long countryId, String headquarterName,
            String departmentName) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(department.country.id.eq(countryId));

        if (headquarterName != null && !headquarterName.trim().isEmpty()) {
            builder.and(department.headquarter.name.containsIgnoreCase(headquarterName.trim()));
        }

        if (departmentName != null && !departmentName.trim().isEmpty()) {
            builder.and(department.name.containsIgnoreCase(departmentName.trim()));
        }

        return queryFactory
                .selectFrom(department)
                .where(builder)
                .orderBy(department.headquarter.id.asc(), department.name.asc())
                .fetch();
    }

    /**
     * Get investigators for a specific country with optional search filters
     */
    public List<Users> findInvestigatorsByCountryIdWithSearch(Long countryId, String headquarterName,
            String departmentName, String investigatorName) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(users.countryId.eq(countryId));
        builder.and(users.role.eq(Role.INVESTIGATOR));
        builder.and(users.status.eq(Users.USER_STATUS.APPROVED));

        if (investigatorName != null && !investigatorName.trim().isEmpty()) {
            BooleanBuilder nameBuilder = new BooleanBuilder();
            nameBuilder.or(users.nameKr.containsIgnoreCase(investigatorName.trim()));
            nameBuilder.or(users.nameEn.containsIgnoreCase(investigatorName.trim()));
            builder.and(nameBuilder);
        }

        // Join with department and headquarter for filtering
        if ((headquarterName != null && !headquarterName.trim().isEmpty()) ||
                (departmentName != null && !departmentName.trim().isEmpty())) {

            return queryFactory
                    .selectFrom(users)
                    .join(department).on(users.departmentId.eq(department.id))
                    .join(headquarter).on(department.headquarter.id.eq(headquarter.id))
                    .where(builder
                            .and(headquarterName != null && !headquarterName.trim().isEmpty()
                                    ? headquarter.name.containsIgnoreCase(headquarterName.trim())
                                    : null)
                            .and(departmentName != null && !departmentName.trim().isEmpty()
                                    ? department.name.containsIgnoreCase(departmentName.trim())
                                    : null))
                    .orderBy(users.nameKr.asc())
                    .fetch();
        } else {
            return queryFactory
                    .selectFrom(users)
                    .where(builder)
                    .orderBy(users.nameKr.asc())
                    .fetch();
        }
    }

    /**
     * Get INV_ADMIN users from countries other than the specified country with
     * search filters
     */
    public List<Users> findInvAdminsFromOtherCountriesWithSearch(Long excludeCountryId, String countryName,
            String invAdminName) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(users.countryId.ne(excludeCountryId));
        builder.and(users.role.eq(Role.INV_ADMIN));
        builder.and(users.status.eq(Users.USER_STATUS.APPROVED).or(users.status.eq(Users.USER_STATUS.WAITING_TO_CHANGE)));

        // Filter by INV_ADMIN name if provided
        if (invAdminName != null && !invAdminName.trim().isEmpty() && countryName != null && !countryName.trim().isEmpty()) {
            BooleanBuilder nameBuilder = new BooleanBuilder();
            nameBuilder.or(users.nameKr.containsIgnoreCase(invAdminName.trim()));
            nameBuilder.or(users.nameEn.containsIgnoreCase(invAdminName.trim()));

            BooleanBuilder countryNameBuilder = new BooleanBuilder();
            countryNameBuilder.and(country.name.containsIgnoreCase(countryName.trim()));

            builder.and(countryNameBuilder.or(nameBuilder));
        }
        return queryFactory
            .selectFrom(users)
            .join(country).on(users.countryId.eq(country.id))
            .where(builder)
            .orderBy(country.name.asc(), users.nameKr.asc())
            .fetch();

    }

    /**
     * Get investigators for a specific country with unified search across all fields using OR operator
     * Searches for the searchWord in country name, headquarter name, department name, or user name
     */
    public List<Users> findInvestigatorsByCountryIdWithUnifiedSearch(Long countryId, String searchWord) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(users.countryId.eq(countryId));
        builder.and(users.role.eq(Role.INVESTIGATOR).or(users.role.eq(Role.RESEARCHER)));
        builder.and(users.status.eq(Users.USER_STATUS.APPROVED).or(users.status.eq(Users.USER_STATUS.WAITING_TO_CHANGE)));

        if (searchWord != null && !searchWord.trim().isEmpty()) {
            String trimmedSearch = searchWord.trim();
            BooleanBuilder searchBuilder = new BooleanBuilder();
            
            searchBuilder.or(headquarter.name.containsIgnoreCase(searchWord.trim()));
            searchBuilder.or(department.name.containsIgnoreCase(searchWord.trim()));
            // Search in user names (Korean or English)
            searchBuilder.or(users.nameKr.containsIgnoreCase(trimmedSearch));
            searchBuilder.or(users.nameEn.containsIgnoreCase(trimmedSearch));
            
            builder.and(searchBuilder);
        }

        // Always join with department, headquarter, and country for complete data access
        return queryFactory
                .selectFrom(users)
                .join(department).on(users.departmentId.eq(department.id))
                .join(headquarter).on(department.headquarter.id.eq(headquarter.id))
                .join(country).on(users.countryId.eq(country.id))
                .where(builder)
                .orderBy(headquarter.name.asc(), department.name.asc(), users.nameKr.asc())
                .fetch();
    }

    /**
     * Get headquarters for a specific country with unified search
     */
    public List<Headquarter> findHeadquartersByCountryIdWithUnifiedSearch(Long countryId, String searchWord) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(headquarter.country.id.eq(countryId));

        if (searchWord != null && !searchWord.trim().isEmpty()) {
            String trimmedSearch = searchWord.trim();
            BooleanBuilder searchBuilder = new BooleanBuilder();
            
            // Search in country name or headquarter name
            searchBuilder.or(headquarter.name.containsIgnoreCase(trimmedSearch));
            
            // Also search in departments and users associated with this headquarter
            searchBuilder.or(department.name.containsIgnoreCase(trimmedSearch));
            searchBuilder.or(users.nameKr.containsIgnoreCase(trimmedSearch));
            searchBuilder.or(users.nameEn.containsIgnoreCase(trimmedSearch));
            
            builder.and(searchBuilder);
        }

        return queryFactory
                .selectFrom(headquarter)
                .leftJoin(department).on(department.headquarter.id.eq(headquarter.id))
                .leftJoin(users).on(users.departmentId.eq(department.id).and(users.role.eq(Role.INVESTIGATOR)).and(users.status.eq(Users.USER_STATUS.APPROVED).or(users.status.eq(Users.USER_STATUS.WAITING_TO_CHANGE))))
                .where(builder)
                .distinct()
                .orderBy(headquarter.name.asc())
                .fetch();
    }

    /**
     * Get departments for a specific country with unified search
     */
    public List<Department> findDepartmentsByCountryIdWithUnifiedSearch(Long countryId, String searchWord) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(department.headquarter.country.id.eq(countryId));

        if (searchWord != null && !searchWord.trim().isEmpty()) {
            String trimmedSearch = searchWord.trim();
            BooleanBuilder searchBuilder = new BooleanBuilder();
            
            // Search in headquarter name, department name, or user names
            searchBuilder.or(department.headquarter.name.containsIgnoreCase(trimmedSearch));
            searchBuilder.or(department.name.containsIgnoreCase(trimmedSearch));
            searchBuilder.or(users.nameKr.containsIgnoreCase(trimmedSearch));
            searchBuilder.or(users.nameEn.containsIgnoreCase(trimmedSearch));
            
            builder.and(searchBuilder);
        }

        return queryFactory
                .selectFrom(department)
                .leftJoin(users).on(users.departmentId.eq(department.id).and(users.role.eq(Role.INVESTIGATOR)).and(users.status.eq(Users.USER_STATUS.APPROVED).or(users.status.eq(Users.USER_STATUS.WAITING_TO_CHANGE))))
                .where(builder)
                .distinct()
                .orderBy(department.name.asc())
                .fetch();
    }

    /**
     * Get all countries except the specified one with optional name search
     */
    public List<Country> findOtherCountriesWithSearch(Long excludeCountryId, List<Long> countryIds, String countryName) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(country.id.ne(excludeCountryId));

        if (countryName != null && !countryName.trim().isEmpty()) {
            BooleanBuilder additionalBuilder = new BooleanBuilder();
            if (countryIds != null && !countryIds.isEmpty()) {
                additionalBuilder.and(country.id.in(countryIds));
                additionalBuilder.or(country.name.containsIgnoreCase(countryName.trim()));
            } else {
                additionalBuilder.and(country.name.containsIgnoreCase(countryName.trim()));
            }
            builder.and(additionalBuilder);
        }

        return queryFactory
                .selectFrom(country)
                .where(builder)
                .orderBy(country.name.asc())
                .fetch();
    }
}
