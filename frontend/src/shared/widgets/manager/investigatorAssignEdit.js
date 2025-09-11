"use client";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { toast } from "react-toastify";

import Card from "@/shared/components/card";
import AssignTable from "./assignTable";
import Search from "@/shared/widgets/search";
import Button from "@/shared/components/button";
import TreeView from "@/shared/components/treeView";
import Modal from "@/shared/components/modal";
import { Table, Thead2, Tbody, Tr, Th2, Td } from "@/shared/components/table";
import { useCurrentCountryOrganizationTree, useForeignInvAdminsTree } from "@/entities/organizationalData";
import { useUpdateCaseAssignments, useCaseAssignees } from "@/entities/case";
import {
    tableColumns,
    tableColumns2,
} from "@/shared/widgets/manager/mockData";

function InvestigatorAssignEdit({ caseId }) {
    const router = useRouter();
    const [queryCurrentCountry, setQueryCurrentCountry] = useState("");
    const [queryOtherCountries, setQueryOtherCountries] = useState("");
    const [data, setData] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [data2, setData2] = useState([]);
    const t = useTranslations();

    // Fetch organizational data with search functionality first
    const { data: currentCountryData, isLoading, error } = useCurrentCountryOrganizationTree(queryCurrentCountry);

    // Fetch foreign INV_ADMIN data with search functionality
    const { data: foreignInvAdminsData, isLoading: isForeignLoading, error: foreignError } = useForeignInvAdminsTree(queryOtherCountries);

    // Fetch current case assignees only after organizational data is loaded
    const {
        data: currentAssignees,
        isLoading: isLoadingAssignees,
        error: assigneesError
    } = useCaseAssignees(caseId, {
        enabled: !!caseId && !!currentCountryData && !!foreignInvAdminsData
    });

    // Case assignment mutation
    const updateAssignmentsMutation = useUpdateCaseAssignments();

    // Helper function to find user details in current country organizational data
    const findUserInCurrentCountry = (userId) => {
        if (!currentCountryData?.headquarters) return null;
        
        for (const hq of currentCountryData.headquarters) {
            for (const dept of hq.departments || []) {
                const user = (dept.investigators || []).find(inv => inv.userId === userId);
                if (user) {
                    return {
                        ...user,
                        nation: currentCountryData.countryName,
                        headquarterName: hq.headquarterName,
                        departmentName: dept.departmentName
                    };
                }
            }
        }
        return null;
    };

    // Helper function to find user details in foreign countries data
    const findUserInForeignCountries = (userId) => {
        if (!foreignInvAdminsData || !Array.isArray(foreignInvAdminsData)) return null;
        
        for (const country of foreignInvAdminsData) {
            const user = (country.invAdmins || []).find(admin => admin.userId === userId);
            if (user) {
                return {
                    ...user,
                    nation: country.countryName,
                    headquarterName: "-", // Foreign admins don't have headquarters
                    departmentName: "-"   // Foreign admins don't have departments
                };
            }
        }
        return null;
    };

    // Helper function to build presentation data from assignees and organizational data
    const buildAssigneeDisplayData = (assignees) => {
        if (!assignees || assignees.length === 0) return [];
        
        return assignees.map(assignee => {
            // First try to find in current country data
            let userDetails = findUserInCurrentCountry(assignee.userId);
            
            // If not found, try foreign countries data
            if (!userDetails) {
                userDetails = findUserInForeignCountries(assignee.userId);
            }
            
            // Fallback to user data from the assignee DTO if organizational data not found
            if (!userDetails && assignee.user) {
                userDetails = {
                    nameKr: assignee.user.nameKr,
                    nameEn: assignee.user.nameEn,
                    role: assignee.user.role,
                    nation: assignee.user.countryName || "-",
                    headquarterName: assignee.user.headquarterName || "-",
                    departmentName: assignee.user.departmentName || "-",
                    userId: assignee.user.userId,
                    email: assignee.user.email,
                    phone: assignee.user.phone
                };
            }
            
            return {
                id: assignee.userId,
                nation: userDetails?.nation || "-",
                role: userDetails ? t(`user-role.${userDetails.role}`) : "-",
                investigator: userDetails?.nameKr || userDetails?.nameEn || "-",
                affiliation: userDetails?.headquarterName || "-",
                department: userDetails?.departmentName || "-",
                action: (
                    <Trash2
                        size={20}
                        onClick={() => removeCurrentCountryInvestigator(assignee.userId)}
                    />
                ),
            };
        });
    };

    // Load current assignees into the table when data is available
    useEffect(() => {
        if (currentAssignees && currentAssignees.length > 0 && currentCountryData && foreignInvAdminsData) {
            const assigneeData = buildAssigneeDisplayData(currentAssignees);
            setData(assigneeData);
        } else if (currentAssignees && currentAssignees.length === 0) {
            // Clear data if no assignees
            setData([]);
        }
    }, [currentAssignees, currentCountryData, foreignInvAdminsData, t]);

    const transformToTreeData = (currentCountry) => {
        if (!currentCountry) return [];
        return (currentCountry.headquarters || []).map(hq => ({
            name: hq.headquarterName,
            label: hq.headquarterName,
            type: "headquarter",
            nation: currentCountry.countryName,
            children: (hq.departments || []).map(dept => ({
                name: dept.departmentName,
                label: dept.departmentName,
                type: "department",
                nation: currentCountry.countryName,
                children: (dept.investigators || []).map(inv => ({
                    name: inv.nameKr,
                    label: inv.nameKr,
                    type: "employee",
                    role: t(`user-role.${inv.role}`) || "-",
                    nation: currentCountry.countryName,
                    headquarterName: hq.headquarterName,
                    departmentName: dept.departmentName,
                    userId: inv.userId,
                    email: inv.email,
                    phone: inv.phone
                }))
            }))
        }));
    };

    const transformForeignInvAdminsToTreeData = (foreignInvAdmins) => {
        if (!foreignInvAdmins || !Array.isArray(foreignInvAdmins)) return [];

        return foreignInvAdmins.map(country => {
            return {
                name: country.countryName,
                label: country.countryName,
                type: "headquarter",
                nation: country.countryName,
                children: country.invAdmins.map(invAdmin => {
                    return {
                        name: invAdmin.nameKr || invAdmin.nameEn,
                        label: invAdmin.nameKr || invAdmin.nameEn,
                        type: "employee",
                        nation: country.countryName,
                        role: t(`user-role.${invAdmin.role}`) || "-",
                        userId: invAdmin.userId,
                        email: invAdmin.email,
                        phone: invAdmin.phone
                    };
                }),
            };
        });
    };

    const removeCurrentCountryInvestigator = (id) => {
        setData((prevData) => prevData.filter((row) => row.id !== id));
    };

    const removeForeignInvestgator = (id) => {
        setData2((prevData) => prevData.filter((row) => row.id !== id));
    };

    const chooseCurrentCountryInvestigator = (obj) => {
        if (data.find(item => item.id === obj.userId)) {
            return;
        }
        setData((prev) => [
            ...prev,
            {
                id: obj.userId,
                nation: obj.nation,
                role: obj.role,
                investigator: obj.label,
                affiliation: obj.headquarterName,
                department: obj.departmentName,
                action: (
                    <Trash2
                        size={20}
                        onClick={() => removeCurrentCountryInvestigator(obj.userId)}
                    />
                ),
            },
        ]);
    };

    const onClickSave = async () => {
        // Extract user IDs from the data state
        const userIds = data.map(item => item.id);

        if (!caseId) {
            console.error("No case ID provided");
            return;
        }

        try {
            console.log("Updating case assignments:", { caseId, userIds });

            const result = await updateAssignmentsMutation.mutateAsync({
                caseId: caseId,
                userIds: userIds
            });

            console.log("Successfully updated assignments:", result);

            toast.success(t('case-detail.update-success'), {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });

            router.push(`/manager/cases/${caseId}`);

        } catch (error) {
            console.error("Failed to update assignments:", error);
            toast.error(t('case-detail.update-error'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        }
    };

    const onGoBack = () => {
        router.push(`/manager/cases/${caseId}`);
    };

    const chooseForeignInvestigator = (obj) => {
        if (data2.find(item => item.id === obj.userId)) {
            return;
        }
        if (obj.type === "employee") {
            setData2((prev) => [
                ...prev,
                {
                    id: obj.userId,
                    nation: obj.countryName || obj.nation,
                    role: obj.role,
                    investigator: obj.label,
                    affiliation: "-",
                    department: "-",
                    action: (
                        <Trash2
                            size={20}
                            onClick={() => removeForeignInvestgator(obj.userId)}
                        />
                    ),
                },
            ]);
        }
    };

    // Loading state - show loading if any of the required data is loading
    if (isLoading || isForeignLoading || isLoadingAssignees) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">
                    {isLoading ? t('loading-organizational-data') :
                     isForeignLoading ? t('loading-foreign-data') :
                     isLoadingAssignees ? t('loading-assignees') : t('loading')}...
                </div>
            </div>
        );
    }

    // Error state - show error if any query fails
    if (error || foreignError || assigneesError) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <div className="text-red-500 text-lg mb-4">
                    {error ? t('organizational-data-load-error') :
                     foreignError ? t('foreign-data-load-error') :
                     assigneesError ? t('assignees-load-error') : t('case-detail.load-error')}
                </div>
                <Button onClick={onGoBack} variant="primary">
                    {t('go-back')}
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex justify-center gap-4">
                <Card className={"w-[250px] min-h-[500px]"}>
                    <Search
                        value={queryCurrentCountry}
                        onChange={(e) => setQueryCurrentCountry(e.target.value)}
                        placeholder="이름/소속/부서"
                    />
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="text-sm text-gray-500">Loading...</div>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="text-sm text-red-500">Error loading data</div>
                        </div>
                    ) : (
                        <TreeView
                            data={transformToTreeData(currentCountryData)}
                            onClick={chooseCurrentCountryInvestigator}
                        />
                    )}
                </Card>
                <Card className={"w-[987px]"}>
                    <AssignTable
                        columns={tableColumns}
                        data={data}
                        openModal={() => setModalOpen(true)}
                    />
                </Card>
            </div>
            <div className="flex justify-center gap-4 mt-4">
                <Button
                    size="bigForm"
                    variant="gray2"
                    onClick={onGoBack}
                    className="w-[148px]"
                >
                    {t("cancel")}
                </Button>
                <Button
                    size="bigForm"
                    type="submit"
                    className="w-[148px]"
                    onClick={onClickSave}
                    disabled={updateAssignmentsMutation.isPending}
                >
                    {updateAssignmentsMutation.isPending ? "Updating..." : t("update")}
                </Button>
            </div>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="xxl">
                <h2 className="text-center text-[24px] font-medium text-color-8 mb-4">
                    국제 수사 관리자 추가
                </h2>

                <div className="flex justify-center gap-4">
                    <div
                        className={"w-[300px] min-h-[414px] border-r border-color-97 pr-4"}
                    >
                        <Search
                            value={queryOtherCountries}
                            onChange={(e) => setQueryOtherCountries(e.target.value)}
                            placeholder="이름/소속/부서"
                        />
                        {isForeignLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="text-sm text-gray-500">Loading...</div>
                            </div>
                        ) : foreignError ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="text-sm text-red-500">Error loading data</div>
                            </div>
                        ) : (
                            <TreeView
                                data={transformForeignInvAdminsToTreeData(foreignInvAdminsData)}
                                onClick={chooseForeignInvestigator}
                            />
                        )}
                    </div>
                    <div className={"w-[400px]"}>
                        <Table>
                            <Thead2>
                                <Tr>
                                    {tableColumns2.map((col, index) => (
                                        <Th2 key={col.key}>{col.title}</Th2>
                                    ))}
                                </Tr>
                            </Thead2>
                            <Tbody>
                                {Array.isArray(data2) &&
                                    data2.map((row, rowIndex) => (
                                        <Tr key={rowIndex} hover={true}>
                                            {tableColumns2.map((col) => (
                                                <Td key={col.key}>{row[col.key]}</Td>
                                            ))}
                                        </Tr>
                                    ))}
                            </Tbody>
                        </Table>
                    </div>
                </div>
                <div className="flex justify-center gap-5 mt-14">
                    <Button
                        size="bigForm"
                        variant="gray2"
                        className="w-[148px]"
                        onClick={() => {
                            setModalOpen(false);
                            setData2([]);
                        }}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        size="bigForm"
                        className="w-[148px]"
                        onClick={() => {
                            setData((prev) => [
                                ...prev,
                                ...data2.filter(item => data.find(existing => existing.id === item.id) === undefined).map((item, index) => ({
                                    ...item,
                                    action: (
                                        <Trash2
                                            size={20}
                                            onClick={() => removeCurrentCountryInvestigator(item.id)}
                                        />
                                    ),
                                })),
                            ]);
                            setModalOpen(false);
                            setData2([]);
                        }}
                    >
                        {t("add")}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

export default InvestigatorAssignEdit;
