package com.lsware.joint_investigation.organisationalData.service;

import com.lsware.joint_investigation.organisationalData.dto.*;
import com.lsware.joint_investigation.user.dto.CountryDto;
import com.lsware.joint_investigation.organisationalData.repository.OrganizationalDataRepository;
import com.lsware.joint_investigation.user.entity.*;
import com.lsware.joint_investigation.user.repository.CountryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationalDataService {

	private final OrganizationalDataRepository organizationalDataRepository;
	private final CountryRepository countryRepository;

	public CountryOrganizationTreeDto getCurrentCountryOrganizationTree(Long currentUserCountryId) {
		return getCurrentCountryOrganizationTree(currentUserCountryId, null, null, null, null);
	}

	public CountryOrganizationTreeDto getCurrentCountryOrganizationTree(Long currentUserCountryId,
			String searchWord) {

		Country country = organizationalDataRepository.findCountryById(currentUserCountryId);
		if (country == null) {
			throw new IllegalArgumentException("Country not found with ID: " + currentUserCountryId);
		}

		boolean includeCountry = true;
		if (searchWord != null && !searchWord.trim().isEmpty()) {
			includeCountry = country.getName().toLowerCase().contains(searchWord.toLowerCase());
		}

		List<HeadquarterTreeNodeDto> headquarterNodes = new ArrayList<>();

		if (includeCountry || (searchWord != null && !searchWord.trim().isEmpty())) {

			List<Headquarter> headquarters = organizationalDataRepository
					.findHeadquartersByCountryIdWithUnifiedSearch(
							currentUserCountryId, searchWord);

			List<Department> departments = organizationalDataRepository
					.findDepartmentsByCountryIdWithUnifiedSearch(
							currentUserCountryId, searchWord);

			List<Users> investigators = organizationalDataRepository
					.findInvestigatorsByCountryIdWithUnifiedSearch(
							currentUserCountryId, searchWord);

			headquarterNodes = buildFilteredHeadquarterTreeWithUnifiedSearch(
					headquarters, departments, investigators, searchWord);
		}

		return new CountryOrganizationTreeDto(
				country.getId(),
				country.getUuid(),
				country.getName(),
				country.getCode(),
				headquarterNodes);
	}

	public CountryOrganizationTreeDto getCurrentCountryOrganizationTree(
			Long currentUserCountryId,
			String countryName,
			String headquarterName,
			String departmentName,
			String investigatorName) {

		Country country = organizationalDataRepository.findCountryById(currentUserCountryId);
		if (country == null) {
			throw new IllegalArgumentException("Country not found with ID: " + currentUserCountryId);
		}

		if (countryName != null && !countryName.trim().isEmpty() &&
				!country.getName().toLowerCase().contains(countryName.toLowerCase())) {
			return new CountryOrganizationTreeDto(
					country.getId(),
					country.getUuid(),
					country.getName(),
					country.getCode(),
					new ArrayList<>());
		}

		List<Headquarter> headquarters = organizationalDataRepository.findHeadquartersByCountryIdWithSearch(
				currentUserCountryId, headquarterName);

		List<Department> departments = organizationalDataRepository.findDepartmentsByCountryIdWithSearch(
				currentUserCountryId, headquarterName, departmentName);

		List<Users> investigators = organizationalDataRepository.findInvestigatorsByCountryIdWithSearch(
				currentUserCountryId, headquarterName, departmentName, investigatorName);

		List<HeadquarterTreeNodeDto> headquarterNodes = buildFilteredHeadquarterTree(
				headquarters, departments, investigators, headquarterName, departmentName,
				investigatorName);

		return new CountryOrganizationTreeDto(
				country.getId(),
				country.getUuid(),
				country.getName(),
				country.getCode(),
				headquarterNodes);
	}

	public List<ForeignInvAdminTreeDto> getForeignInvAdminsTree(Long currentUserCountryId) {
		return getForeignInvAdminsTree(currentUserCountryId, null, null);
	}

	public List<ForeignInvAdminTreeDto> getForeignInvAdminsTree(Long currentUserCountryId, String countryName,
			String invAdminName) {

		List<Users> foreignInvAdmins = organizationalDataRepository
				.findInvAdminsFromOtherCountriesWithSearch(currentUserCountryId, countryName,
						invAdminName);

		Map<Long, List<Users>> invAdminsByCountry = foreignInvAdmins.stream()
				.collect(Collectors.groupingBy(Users::getCountryId));

		List<Long> countryIds = new ArrayList<>(invAdminsByCountry.keySet());

		List<Country> otherCountries = organizationalDataRepository
				.findOtherCountriesWithSearch(currentUserCountryId, countryIds, countryName);

		return otherCountries.stream()
				.map(country -> {
					List<Users> countryInvAdmins = invAdminsByCountry.getOrDefault(country.getId(),
							new ArrayList<>());
					List<UserTreeNodeDto> invAdminNodes = countryInvAdmins.stream()
							.map(this::convertToUserTreeNode)
							.collect(Collectors.toList());

					return new ForeignInvAdminTreeDto(
							country.getId(),
							country.getUuid(),
							country.getName(),
							country.getCode(),
							invAdminNodes);
				})
				.collect(Collectors.toList());
	}

	private List<HeadquarterTreeNodeDto> buildHeadquarterTree(
			List<Headquarter> headquarters,
			List<Department> departments,
			List<Users> investigators) {

		Map<Long, List<Department>> departmentsByHeadquarter = departments.stream()
				.collect(Collectors.groupingBy(dept -> dept.getHeadquarter().getId()));

		Map<Long, List<Users>> investigatorsByDepartment = investigators.stream()
				.filter(user -> user.getDepartmentId() != null)
				.collect(Collectors.groupingBy(Users::getDepartmentId));

		return headquarters.stream()
				.map(hq -> {
					List<Department> hqDepartments = departmentsByHeadquarter.getOrDefault(
							hq.getId(),
							new ArrayList<>());
					List<DepartmentTreeNodeDto> departmentNodes = hqDepartments.stream()
							.map(dept -> {
								List<Users> deptInvestigators = investigatorsByDepartment
										.getOrDefault(dept.getId(),
												new ArrayList<>());
								List<UserTreeNodeDto> investigatorNodes = deptInvestigators
										.stream()
										.map(this::convertToUserTreeNode)
										.collect(Collectors.toList());

								return new DepartmentTreeNodeDto(
										dept.getId(),
										dept.getUuid(),
										dept.getName(),
										investigatorNodes);
							})
							.collect(Collectors.toList());

					return new HeadquarterTreeNodeDto(
							hq.getId(),
							hq.getUuid(),
							hq.getName(),
							departmentNodes);
				})
				.collect(Collectors.toList());
	}

	private List<HeadquarterTreeNodeDto> buildFilteredHeadquarterTreeWithUnifiedSearch(
			List<Headquarter> headquarters,
			List<Department> departments,
			List<Users> investigators,
			String searchWord) {

		Map<Long, List<Department>> departmentsByHeadquarter = departments.stream()
				.collect(Collectors.groupingBy(dept -> dept.getHeadquarter().getId()));

		Map<Long, List<Users>> investigatorsByDepartment = investigators.stream()
				.filter(user -> user.getDepartmentId() != null)
				.collect(Collectors.groupingBy(Users::getDepartmentId));

		return headquarters.stream()
				.map(hq -> {
					List<Department> hqDepartments = departmentsByHeadquarter.getOrDefault(
							hq.getId(),
							new ArrayList<>());

					List<DepartmentTreeNodeDto> departmentNodes = hqDepartments.stream()
							.map(dept -> {
								List<Users> deptInvestigators = investigatorsByDepartment
										.getOrDefault(dept.getId(),
												new ArrayList<>());
								List<UserTreeNodeDto> investigatorNodes = deptInvestigators
										.stream()
										.map(this::convertToUserTreeNode)
										.collect(Collectors.toList());

								return new DepartmentTreeNodeDto(
										dept.getId(),
										dept.getUuid(),
										dept.getName(),
										investigatorNodes);
							})
							.collect(Collectors.toList());

					return new HeadquarterTreeNodeDto(
							hq.getId(),
							hq.getUuid(),
							hq.getName(),
							departmentNodes);
				})
				.collect(Collectors.toList());
	}

	private List<HeadquarterTreeNodeDto> buildFilteredHeadquarterTree(
			List<Headquarter> headquarters,
			List<Department> departments,
			List<Users> investigators,
			String headquarterName,
			String departmentName,
			String investigatorName) {

		Map<Long, List<Department>> departmentsByHeadquarter = departments.stream()
				.collect(Collectors.groupingBy(dept -> dept.getHeadquarter().getId()));

		Map<Long, List<Users>> investigatorsByDepartment = investigators.stream()
				.filter(user -> user.getDepartmentId() != null)
				.collect(Collectors.groupingBy(Users::getDepartmentId));

		return headquarters.stream()
				.map(hq -> {
					List<Department> hqDepartments = departmentsByHeadquarter.getOrDefault(
							hq.getId(),
							new ArrayList<>());

					List<DepartmentTreeNodeDto> departmentNodes = hqDepartments.stream()
							.map(dept -> {
								List<Users> deptInvestigators = investigatorsByDepartment
										.getOrDefault(dept.getId(),
												new ArrayList<>());
								List<UserTreeNodeDto> investigatorNodes = deptInvestigators
										.stream()
										.map(this::convertToUserTreeNode)
										.collect(Collectors.toList());

								return new DepartmentTreeNodeDto(
										dept.getId(),
										dept.getUuid(),
										dept.getName(),
										investigatorNodes);
							})
							.filter(dept -> {

								return dept.getInvestigators().size() > 0
										|| investigatorName == null
										|| investigatorName.trim().isEmpty();
							})
							.collect(Collectors.toList());

					return new HeadquarterTreeNodeDto(
							hq.getId(),
							hq.getUuid(),
							hq.getName(),
							departmentNodes);
				})
				.filter(hq -> {

					return hq.getDepartments().size() > 0 ||
							(departmentName == null || departmentName.trim().isEmpty()) &&
									(investigatorName == null || investigatorName
											.trim().isEmpty());
				})
				.collect(Collectors.toList());
	}

	private UserTreeNodeDto convertToUserTreeNode(Users user) {
		return new UserTreeNodeDto(
				user.getUserId(),
				user.getLoginId(),
				user.getNameKr(),
				user.getNameEn(),
				user.getEmail(),
				user.getPhone(),
				user.getRole().name(),
				user.getStatus().name());
	}

	public CombinedOrganizationalDataDto getCombinedOrganizationalData(Long currentUserCountryId) {

		CountryOrganizationTreeDto currentCountryOrganization = getCurrentCountryOrganizationTree(
				currentUserCountryId);

		List<ForeignInvAdminTreeDto> foreignInvAdmins = getForeignInvAdminsTree(currentUserCountryId);

		return new CombinedOrganizationalDataDto(currentCountryOrganization, foreignInvAdmins);
	}

	public List<CountryDto> getAllCountries() {
		List<Country> countries = countryRepository.findByOrderByNameAsc();

		return countries.stream()
				.map(country -> new CountryDto(
						country.getId(),
						country.getUuid(),
						country.getName(),
						country.getPhonePrefix(),
						country.getCode(),
						country.getCreatedAt(),
						country.getUpdatedAt()))
				.collect(Collectors.toList());
	}
}
