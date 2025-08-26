package com.lsware.joint_investigation.user.repository;

import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;

import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.entity.QUsers;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
//import com.querydsl.jpa.impl.JPAUpdateClause;

import jakarta.persistence.EntityManager;

import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;

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

    // public Optional<Users> findByName(String name) {
    //     return Optional.ofNullable(
    //             queryFactory
    //                     .select(userEntity)
    //                     .from(userEntity)
    //                     .where(userEntity.username.eq(name))
    //                     .fetchFirst());
    // }

    // public Boolean existsByName(String name) {
    //     return queryFactory
    //             .selectOne()
    //             .from(userEntity)
    //             .where(userEntity.nameKr.eq(name))
    //             .fetchFirst() != null;
    // }

    // public Boolean existsByEmail(String email) {
    //     return queryFactory
    //             .selectOne()
    //             .from(userEntity)
    //             .where(userEntity.email.eq(email))
    //             .fetchFirst() != null;
    // }

    public Optional<Users> findByEmail(String email) {
        return findByEmail(email, false);
    }

    public Optional<Users> findByEmail(String email, Boolean isDeleted) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(users.email.eq(email));

        // if (isDeleted != null) {
        //     builder.and(userEntity.isDeleted.eq(isDeleted));
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
        builder.and(users.loginId.eq(loginId));

        return Optional.ofNullable(
                queryFactory
                        .select(users)
                        .from(users)
                        .where(builder)
                        .fetchFirst());
    }

    

    // // @Transactional(readOnly = false)
    // // public Boolean updateVerifiedCode(String email, String verifyCode) {

    // //     long updatedRows = queryFactory.update(userEntity)
    // //             .where(userEntity.email.eq(email))
    // //             .set(userEntity.verifyCode, verifyCode)
    // //             .set(userEntity.verifyCodeCreatedDate, LocalDateTime.now())
    // //             .execute();
    // //     return updatedRows > 0;
    // // }

    // // public Optional<UserEntity> existsVerifiedCode(String email, String verifyCode) {
    // //     return Optional.ofNullable(
    // //                 queryFactory.select(userEntity)
    // //                     .from(userEntity)
    // //                     .where(userEntity.email.eq(email),
    // //                             userEntity.verifyCode.eq(verifyCode))
    // //                     .fetchFirst());
    // // }

    // @Transactional(readOnly = false)
    // public Boolean updateUserPassword(String email, String password) {
    //     long updatedRows = queryFactory.update(userEntity)
    //             .where(userEntity.email.eq(email))
    //             .set(userEntity.password, password)
    //             .execute();
    //     return updatedRows > 0;
    // }

    // // @Transactional(readOnly = false)
    // // public Boolean updateProfileByEmail(String email, String name, String avatar) {
    // //     JPAUpdateClause clause = queryFactory.update(userEntity)
    // //             .where(userEntity.email.eq(email))
    // //             .set(userEntity.name, name);
    // //     if (avatar != null) {
    // //         clause = clause.set(userEntity.avatar, avatar);
    // //     }
    // //     long updatedRows = clause.execute();
    // //     return updatedRows > 0;
    // // }
}
