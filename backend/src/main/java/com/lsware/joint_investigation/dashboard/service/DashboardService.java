package com.lsware.joint_investigation.dashboard.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.posts.dto.PostDto;
import com.lsware.joint_investigation.posts.entity.Post;
import com.lsware.joint_investigation.posts.repository.PostRepository;
import com.lsware.joint_investigation.cases.entity.Case;
import com.lsware.joint_investigation.cases.entity.Case.CASE_STATUS;
import com.lsware.joint_investigation.cases.repository.CaseRepository;

@Service
public class DashboardService {

	@Autowired
    PostRepository postRepository;

	@Autowired
	private CaseRepository caseRepository;

	public HashMap<String, Object> getData(CustomUser user) {
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

		Map<CASE_STATUS, Long> caseSummary = caseRepository.getAssignedCaseSummary(user);
		response.put("caseSummary", caseSummary);

		List<Case> recentCases = caseRepository.findRecentAssignedCases(user);
		response.put("recentCases", recentCases.stream().map(Case::toDto).collect(Collectors.toList()));

		return response;
	}

}
