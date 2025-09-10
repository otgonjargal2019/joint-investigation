package com.lsware.joint_investigation.user.repository;

import java.util.Optional;
import java.util.UUID;

import com.lsware.joint_investigation.user.entity.UserStatusHistory;
import com.lsware.joint_investigation.user.entity.Users.USER_STATUS;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserStatusHistoryRepository extends JpaRepository<UserStatusHistory, UUID> {

    Optional<UserStatusHistory> findFirstByUser_UserIdAndFromStatusAndToStatusOrderByCreatedAtDesc(
            UUID userId,
            USER_STATUS fromStatus,
            USER_STATUS toStatus);
}
