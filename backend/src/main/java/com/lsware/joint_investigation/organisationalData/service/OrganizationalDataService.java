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

	/**
	 * API 1: Get organizational tree structure for current user's country
	 * Returns headquarters, departments and INVESTIGATOR users from the same
	 * country
	 */
	public CountryOrganizationTreeDto getCurrentCountryOrganizationTree(Long currentUserCountryId) {
		return getCurrentCountryOrganizationTree(currentUserCountryId, null, null, null, null);
	}

	/**
	 * API 1: Get organizational tree structure for current user's country with
	 * unified search
	 * Returns headquarters, departments and INVESTIGATOR users from the same
	 * country
	 * Searches across country name, headquarter name, department name, and
	 * investigator name using OR operator
	 */
	public CountryOrganizationTreeDto getCurrentCountryOrganizationTree(Long currentUserCountryId,
			String searchWord) {
		// Get country information
		Country country = organizationalDataRepository.findCountryById(currentUserCountryId);
		if (country == null) {
			throw new IllegalArgumentException("Country not found with ID: " + currentUserCountryId);
		}

		// If search word is provided, check if country matches, otherwise get all data
		boolean includeCountry = true;
		if (searchWord != null && !searchWord.trim().isEmpty()) {
			includeCountry = country.getName().toLowerCase().contains(searchWord.toLowerCase());
		}

		List<HeadquarterTreeNodeDto> headquarterNodes = new ArrayList<>();

		if (includeCountry || (searchWord != null && !searchWord.trim().isEmpty())) {
			// Get filtered data from repository using unified search
			List<Headquarter> headquarters = organizationalDataRepository
					.findHeadquartersByCountryIdWithUnifiedSearch(
							currentUserCountryId, searchWord);

			List<Department> departments = organizationalDataRepository
					.findDepartmentsByCountryIdWithUnifiedSearch(
							currentUserCountryId, searchWord);

			List<Users> investigators = organizationalDataRepository
					.findInvestigatorsByCountryIdWithUnifiedSearch(
							currentUserCountryId, searchWord);

			// Build the tree structure with filtered data
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

	/**
	 * API 1: Get organizational tree structure for current user's country with
	 * search filters
	 * Returns headquarters, departments and INVESTIGATOR users from the same
	 * country
	 * Supports filtering by country name, headquarter name, department name, and
	 * investigator name
	 */
	public CountryOrganizationTreeDto getCurrentCountryOrganizationTree(
			Long currentUserCountryId,
			String countryName,
			String headquarterName,
			String departmentName,
			String investigatorName) {

		// Get country information
		Country country = organizationalDataRepository.findCountryById(currentUserCountryId);
		if (country == null) {
			throw new IllegalArgumentException("Country not found with ID: " + currentUserCountryId);
		}

		// If country name filter is provided and doesn't match, return empty result
		if (countryName != null && !countryName.trim().isEmpty() &&
				!country.getName().toLowerCase().contains(countryName.toLowerCase())) {
			return new CountryOrganizationTreeDto(
					country.getId(),
					country.getUuid(),
					country.getName(),
					country.getCode(),
					new ArrayList<>());
		}

		// Get filtered data from repository
		List<Headquarter> headquarters = organizationalDataRepository.findHeadquartersByCountryIdWithSearch(
				currentUserCountryId, headquarterName);

		List<Department> departments = organizationalDataRepository.findDepartmentsByCountryIdWithSearch(
				currentUserCountryId, headquarterName, departmentName);

		List<Users> investigators = organizationalDataRepository.findInvestigatorsByCountryIdWithSearch(
				currentUserCountryId, headquarterName, departmentName, investigatorName);

		// Build the tree structure with filtered data
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

	/**
	 * API 2: Get INV_ADMIN users from other countries
	 * Returns tree structure grouped by country
	 */
	public List<ForeignInvAdminTreeDto> getForeignInvAdminsTree(Long currentUserCountryId) {
		return getForeignInvAdminsTree(currentUserCountryId, null, null);
	}

	/**
	 * API 2: Get INV_ADMIN users from other countries with search filters
	 * Returns tree structure grouped by country
	 * Supports filtering by country name and INV_ADMIN name
	 */
	public List<ForeignInvAdminTreeDto> getForeignInvAdminsTree(Long currentUserCountryId, String countryName,
			String invAdminName) {
		// Get filtered INV_ADMIN users from other countries
		List<Users> foreignInvAdmins = organizationalDataRepository
				.findInvAdminsFromOtherCountriesWithSearch(currentUserCountryId, countryName,
						invAdminName);

		// Group INV_ADMIN users by country
		Map<Long, List<Users>> invAdminsByCountry = foreignInvAdmins.stream()
				.collect(Collectors.groupingBy(Users::getCountryId));

		List<Long> countryIds = new ArrayList<>(invAdminsByCountry.keySet());

		// Get filtered other countries
		List<Country> otherCountries = organizationalDataRepository
				.findOtherCountriesWithSearch(currentUserCountryId, countryIds, countryName);

		// Build tree structure with filtering
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

	/**
	 * Build headquarter tree with departments and investigators
	 */
	private List<HeadquarterTreeNodeDto> buildHeadquarterTree(
			List<Headquarter> headquarters,
			List<Department> departments,
			List<Users> investigators) {

		// Group departments by headquarter ID
		Map<Long, List<Department>> departmentsByHeadquarter = departments.stream()
				.collect(Collectors.groupingBy(dept -> dept.getHeadquarter().getId()));

		// Group investigators by department ID
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

	/**
	 * Build filtered headquarter tree with unified search
	 * Since filtering is done at repository level, this method mainly organizes the
	 * data
	 */
	private List<HeadquarterTreeNodeDto> buildFilteredHeadquarterTreeWithUnifiedSearch(
			List<Headquarter> headquarters,
			List<Department> departments,
			List<Users> investigators,
			String searchWord) {

		// Group departments by headquarter ID
		Map<Long, List<Department>> departmentsByHeadquarter = departments.stream()
				.collect(Collectors.groupingBy(dept -> dept.getHeadquarter().getId()));

		// Group investigators by department ID
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

	/**
	 * Build filtered headquarter tree with departments and investigators
	 * Applies additional filtering logic for search functionality
	 */
	private List<HeadquarterTreeNodeDto> buildFilteredHeadquarterTree(
			List<Headquarter> headquarters,
			List<Department> departments,
			List<Users> investigators,
			String headquarterName,
			String departmentName,
			String investigatorName) {

		// Group departments by headquarter ID
		Map<Long, List<Department>> departmentsByHeadquarter = departments.stream()
				.collect(Collectors.groupingBy(dept -> dept.getHeadquarter().getId()));

		// Group investigators by department ID
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
								// Include department if it has investigators or if no
								// investigator filter is applied
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
					// Include headquarter if it has departments with data or if no specific filters
					// are applied
					return hq.getDepartments().size() > 0 ||
							(departmentName == null || departmentName.trim().isEmpty()) &&
									(investigatorName == null || investigatorName
											.trim().isEmpty());
				})
				.collect(Collectors.toList());
	}

	/**
	 * Convert Users entity to UserTreeNodeDto
	 */
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

	/**
	 * Combined API: Get both current country organizational tree and foreign
	 * INV_ADMINs
	 * Returns complete organizational data for INV_ADMIN users
	 */
	public CombinedOrganizationalDataDto getCombinedOrganizationalData(Long currentUserCountryId) {
		// Get current country organizational tree
		CountryOrganizationTreeDto currentCountryOrganization = getCurrentCountryOrganizationTree(
				currentUserCountryId);

		// Get foreign INV_ADMIN tree
		List<ForeignInvAdminTreeDto> foreignInvAdmins = getForeignInvAdminsTree(currentUserCountryId);

		return new CombinedOrganizationalDataDto(currentCountryOrganization, foreignInvAdmins);
	}

	/**
	 * Get list of all countries
	 * Returns all countries ordered by name
	 */
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
