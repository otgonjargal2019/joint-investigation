package com.lsware.joint_investigation.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.lsware.joint_investigation.posts.dto.PostDto;
import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.repository.PostRepository;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class MainController {

    @Autowired
    PostRepository postRepository;

    @GetMapping("/main")
    public ResponseEntity<MappingJacksonValue> main(Authentication authentication) {
        if (authentication.isAuthenticated()) {
            HashMap<String, Object> response = new HashMap<String, Object>();

            List<PostDto> lastPosts = postRepository.findTop4ByBoardTypeOrderByCreatedAtDesc(Post.BOARD_TYPE.NOTICE)
                    .stream()
                    .map(PostDto::fromEntity)
                    .collect(Collectors.toList());
            response.put("lastPosts", lastPosts);

            List<PostDto> lastResearch = postRepository
                    .findTop4ByBoardTypeOrderByCreatedAtDesc(Post.BOARD_TYPE.RESEARCH).stream()
                    .map(PostDto::fromEntity)
                    .collect(Collectors.toList());
            response.put("lastResearchs", lastResearch);
            MappingJacksonValue mapping = new MappingJacksonValue(response);
            mapping.setFilters(UserController.getUserFilter());
            return ResponseEntity.ok(mapping);
        }
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
    }

}
