package com.lsware.joint_investigation.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.lsware.joint_investigation.user.entity.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
        
}