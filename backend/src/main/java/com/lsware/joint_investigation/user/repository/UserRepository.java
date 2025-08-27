package com.lsware.joint_investigation.user.repository;

import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.entity.QUsers;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import java.util.Optional;

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
}
