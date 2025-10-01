package com.lsware.joint_investigation.dashboard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.dashboard.service.DashboardService;
import com.lsware.joint_investigation.posts.repository.PostRepository;
import com.lsware.joint_investigation.user.controller.UserController;

import java.util.HashMap;

@RestController
@RequestMapping("/api/dashboard")
public class MainController {

    @Autowired
    DashboardService dashboardService;

    @Autowired
    PostRepository postRepository;

    @GetMapping("/main")
    public ResponseEntity<MappingJacksonValue> main(Authentication authentication) {
        if (authentication.isAuthenticated()) {
            CustomUser user = (CustomUser)authentication.getPrincipal();
            HashMap<String, Object> data = dashboardService.getData(user);
            MappingJacksonValue mapping = new MappingJacksonValue(data);
            mapping.setFilters(UserController.getUserFilter());
            return ResponseEntity.ok(mapping);
        }
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
    }

}
