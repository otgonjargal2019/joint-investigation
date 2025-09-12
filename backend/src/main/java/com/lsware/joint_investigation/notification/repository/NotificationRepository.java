package com.lsware.joint_investigation.notification.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.notification.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserOrderByCreatedAtDesc(Users user);

    void deleteAllByUser(Users user);
}