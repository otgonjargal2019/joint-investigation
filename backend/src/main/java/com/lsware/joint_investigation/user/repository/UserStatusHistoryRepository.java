package com.lsware.joint_investigation.user.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.lsware.joint_investigation.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserStatusHistoryRepository extends JpaRepository<Users, UUID> {

    Page<Users> findByStatus(Users.USER_STATUS status, Pageable pageable);

}
