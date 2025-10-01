package com.lsware.joint_investigation.user.repository;

import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.dto.UserDto;
import com.lsware.joint_investigation.user.entity.QUsers;
import com.lsware.joint_investigation.user.entity.Role;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.querydsl.jpa.impl.JPAUpdateClause;

import jakarta.persistence.EntityManager;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class UserRepository extends SimpleJpaRepository<Users, Integer> {

    private EntityManager em;
    private JPAQueryFactory queryFactory;
    protected final QUsers users = QUsers.users;

    public UserRepository(EntityManager entityManager) {
        super(Users.class, entityManager);
        em = entityManager;
        queryFactory = new JPAQueryFactory(em);
    }

    public Optional<Users> findByEmail(String email) {
        return findByEmail(email, false);
    }

    public Optional<Users> findByEmail(String email, Boolean isDeleted) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(users.email.eq(email));

        // if (isDeleted != null) {
        // builder.and(userEntity.isDeleted.eq(isDeleted));
        // }

        return Optional.ofNullable(
                queryFactory
                        .select(users)
                        .from(users)
                        .where(builder)
                        .fetchFirst());
    }

    public Optional<Users> findByLoginId(String loginId) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(users.loginId.lower().eq(loginId.toLowerCase()));
        builder.and(
                users.status.eq(Users.USER_STATUS.APPROVED)
                        .or(users.status.eq(Users.USER_STATUS.WAITING_TO_CHANGE))
                        .or(users.status.eq(Users.USER_STATUS.PENDING))
                        .or(users.status.eq(Users.USER_STATUS.REJECTED)));

        return Optional.ofNullable(
                queryFactory
                        .select(users)
                        .from(users)
                        .where(builder)
                        .fetchFirst());
    }

    public Optional<Users> checkLoginIdExist(String loginId) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(users.loginId.lower().eq(loginId.toLowerCase()));

        return Optional.ofNullable(
                queryFactory
                        .select(users)
                        .from(users)
                        .where(builder)
                        .fetchFirst());
    }

    public Optional<Users> findByUserId(UUID userId) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(users.userId.eq(userId));

        return Optional.ofNullable(
                queryFactory
                        .select(users)
                        .from(users)
                        .where(builder)
                        .fetchFirst());
    }

    @Transactional(readOnly = false)
    public Boolean updateProfileByUserId(UUID userId, UserDto userDto, String avatar) {
        JPAUpdateClause clause = queryFactory.update(users)
                .where(users.userId.eq(userId))
                // .set(users.countryId, Long.valueOf(userDto.getCountryId()))
                .set(users.headquarterId, Long.valueOf(userDto.getHeadquarterId()))
                .set(users.departmentId, Long.valueOf(userDto.getDepartmentId()))
                .set(users.phone, userDto.getPhone())
                .set(users.email, userDto.getEmail());
        if (avatar != null) {
            clause = clause.set(users.profileImageUrl, avatar);
        }
        long updatedRows = clause.execute();
        return updatedRows > 0;
    }

    @Transactional(readOnly = false)
    public Boolean updateUserStatusById(UUID userId, String status) {
        JPAUpdateClause clause = queryFactory.update(users)
                .where(users.userId.eq(userId))
                .set(users.status, Users.USER_STATUS.valueOf(status));

        long updatedRows = clause.execute();
        return updatedRows > 0;
    }

    @Transactional(readOnly = false)
    public Boolean deleteProfileImgByUserId(UUID userId) {
        JPAUpdateClause clause = queryFactory.update(users)
                .where(users.userId.eq(userId))
                .set(users.profileImageUrl, "");

        long updatedRows = clause.execute();
        return updatedRows > 0;
    }

    // public List<Users> findByStatus(Users.USER_STATUS status, int page, int size)
    // {
    // return queryFactory
    // .selectFrom(users)
    // .where(users.status.eq(status))
    // .offset((long) page * size)
    // .limit(size)
    // .fetch();
    // }

    // public List<Users> findAll(int page, int size) {
    // return queryFactory
    // .selectFrom(users)
    // .offset((long) page * size)
    // .limit(size)
    // .fetch();
    // }

    public List<Users> findByStatusExcludingPlatformAdmin(Users.USER_STATUS status, int page, int size) {
        return queryFactory
                .selectFrom(users)
                .where(users.status.eq(status)
                        .and(users.role.ne(Role.PLATFORM_ADMIN)))
                .offset((long) page * size)
                .limit(size)
                .fetch();
    }

    public List<Users> findAllExcludingPlatformAdmin(int page, int size) {
        return queryFactory
                .selectFrom(users)
                .where(users.role.ne(Role.PLATFORM_ADMIN))
                .offset((long) page * size)
                .limit(size)
                .fetch();
    }

    public List<Users> findByUserIds(List<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return List.of();
        }

        BooleanBuilder builder = new BooleanBuilder();
        builder.and(users.userId.in(userIds));

        return queryFactory
                .selectFrom(users)
                .where(builder)
                .fetch();
    }

    public List<Users> findByRole(Role role) {
        if (role == null) {
            return List.of();
        }

        return queryFactory
                .selectFrom(users)
                .where(users.role.eq(role))
                .fetch();
    }
}
