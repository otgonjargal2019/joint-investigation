package com.lsware.joint_investigation.user.repository;

import java.util.UUID;

import com.lsware.joint_investigation.user.entity.UserStatusHistory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserStatusHistoryRepository extends JpaRepository<UserStatusHistory, UUID> {

}
