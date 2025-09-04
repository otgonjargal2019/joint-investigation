package com.lsware.joint_investigation.organisationalData.service;

import com.lsware.joint_investigation.organisationalData.dto.*;
import com.lsware.joint_investigation.organisationalData.repository.OrganizationalDataRepository;
import com.lsware.joint_investigation.user.entity.*;
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

    /**
     * API 1: Get organizational tree structure for current user's country
     * Returns headquarters, departments and INVESTIGATOR users from the same
     * country
     */
    public CountryOrganizationTreeDto getCurrentCountryOrganizationTree(Long currentUserCountryId) {
        // Get country information
        Country country = organizationalDataRepository.findCountryById(currentUserCountryId);
        if (country == null) {
            throw new IllegalArgumentException("Country not found with ID: " + currentUserCountryId);
        }

        // Get all headquarters for this country
        List<Headquarter> headquarters = organizationalDataRepository.findHeadquartersByCountryId(currentUserCountryId);

        // Get all departments for this country
        List<Department> departments = organizationalDataRepository.findDepartmentsByCountryId(currentUserCountryId);

        // Get all investigators for this country
        List<Users> investigators = organizationalDataRepository.findInvestigatorsByCountryId(currentUserCountryId);

        // Build the tree structure
        List<HeadquarterTreeNodeDto> headquarterNodes = buildHeadquarterTree(headquarters, departments, investigators);

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
        // Get all INV_ADMIN users from other countries
        List<Users> foreignInvAdmins = organizationalDataRepository
                .findInvAdminsFromOtherCountries(currentUserCountryId);

        // Get all other countries
        List<Country> otherCountries = organizationalDataRepository.findOtherCountries(currentUserCountryId);

        // Group INV_ADMIN users by country
        Map<Long, List<Users>> invAdminsByCountry = foreignInvAdmins.stream()
                .collect(Collectors.groupingBy(Users::getCountryId));

        // Build tree structure
        return otherCountries.stream()
                .map(country -> {
                    List<Users> countryInvAdmins = invAdminsByCountry.getOrDefault(country.getId(), new ArrayList<>());
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
                    List<Department> hqDepartments = departmentsByHeadquarter.getOrDefault(hq.getId(),
                            new ArrayList<>());
                    List<DepartmentTreeNodeDto> departmentNodes = hqDepartments.stream()
                            .map(dept -> {
                                List<Users> deptInvestigators = investigatorsByDepartment.getOrDefault(dept.getId(),
                                        new ArrayList<>());
                                List<UserTreeNodeDto> investigatorNodes = deptInvestigators.stream()
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
     * Combined API: Get both current country organizational tree and foreign INV_ADMINs
     * Returns complete organizational data for INV_ADMIN users
     */
    public CombinedOrganizationalDataDto getCombinedOrganizationalData(Long currentUserCountryId) {
        // Get current country organizational tree
        CountryOrganizationTreeDto currentCountryOrganization = getCurrentCountryOrganizationTree(currentUserCountryId);
        
        // Get foreign INV_ADMIN tree
        List<ForeignInvAdminTreeDto> foreignInvAdmins = getForeignInvAdminsTree(currentUserCountryId);
        
        return new CombinedOrganizationalDataDto(currentCountryOrganization, foreignInvAdmins);
    }
}
