"use client";
import { Trash2 } from "lucide-react";
import { useState } from "react";
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
import {
  useCurrentCountryOrganizationTree,
  useForeignInvAdminsTree,
} from "@/entities/organizationalData";
import { useAssignUsersToCase } from "@/entities/case/api";
import {
  tableColumns,
  tableColumns2,
} from "@/shared/widgets/manager/tableHelper";

function InvestigatorAssign({ setActiveTab, createdCaseId }) {
  const router = useRouter();
  const [queryCurrentCountry, setQueryCurrentCountry] = useState("");
  const [queryOtherCountries, setQueryOtherCountries] = useState("");
  const [data, setData] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [data2, setData2] = useState([]);
  const t = useTranslations();

  // Fetch organizational data with search functionality
  const {
    data: currentCountryData,
    isLoading,
    error,
  } = useCurrentCountryOrganizationTree(queryCurrentCountry);

  // Fetch foreign INV_ADMIN data with search functionality
  const {
    data: foreignInvAdminsData,
    isLoading: isForeignLoading,
    error: foreignError,
  } = useForeignInvAdminsTree(queryOtherCountries);

  // Case assignment mutation
  const assignUsersMutation = useAssignUsersToCase();

  const transformToTreeData = (currentCountry) => {
    if (!currentCountry) return [];
    return (currentCountry.headquarters || []).map((hq) => ({
      name: hq.headquarterName,
      label: hq.headquarterName,
      type: "headquarter",
      nation: currentCountry.countryName,
      children: (hq.departments || []).map((dept) => ({
        name: dept.departmentName,
        label: dept.departmentName,
        type: "department",
        nation: currentCountry.countryName,
        children: (dept.investigators || []).map((inv) => ({
          name: inv.nameKr,
          label: inv.nameKr,
          type: "employee",
          role: t(`user-role.${inv.role}`) || "-",
          nation: currentCountry.countryName,
          headquarterName: hq.headquarterName,
          departmentName: dept.departmentName,
          userId: inv.userId,
          email: inv.email,
          phone: inv.phone,
        })),
      })),
    }));
  };

  const transformForeignInvAdminsToTreeData = (foreignInvAdmins) => {
    if (!foreignInvAdmins || !Array.isArray(foreignInvAdmins)) return [];

    return foreignInvAdmins.map((country) => {
      return {
        name: country.countryName,
        label: country.countryName,
        type: "headquarter",
        nation: country.countryName,
        children: country.invAdmins.map((invAdmin) => {
          return {
            name: invAdmin.nameKr || invAdmin.nameEn,
            label: invAdmin.nameKr || invAdmin.nameEn,
            type: "employee",
            nation: country.countryName,
            role: t(`user-role.${invAdmin.role}`) || "-",
            userId: invAdmin.userId,
            email: invAdmin.email,
            phone: invAdmin.phone,
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
    // console.log("obj", obj);
    if (data.find((item) => item.id === obj.userId)) {
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
    const userIds = data.map((item) => item.id);

    if (!createdCaseId) {
      console.error("No case ID provided");
      return;
    }

    if (userIds.length === 0) {
      console.warn("No investigators selected");
      return;
    }

    try {
      console.log("Assigning investigators to case:", {
        caseId: createdCaseId,
        userIds,
      });

      const result = await assignUsersMutation.mutateAsync({
        caseId: createdCaseId,
        userIds: userIds,
      });

      console.log("Successfully assigned investigators:", result);

      toast.success(t("case-detail.create-success"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      router.push("/manager/cases");
    } catch (error) {
      console.error("Failed to assign investigators:", error);
      // TODO: Show error notification to user
    }
  };

  const onGoBack = () => {
    setActiveTab(0);
  };

  const chooseForeignInvestigator = (obj) => {
    // console.log(obj);
    if (data2.find((item) => item.id === obj.userId)) {
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
          affiliation: "-", // obj.countryName || obj.nation,
          department: "-", // Foreign investigators don't have departments in this structure
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
          {t("prev")}
        </Button>
        <Button
          size="bigForm"
          type="submit"
          className="w-[148px]"
          onClick={onClickSave}
          disabled={assignUsersMutation.isPending}
        >
          {assignUsersMutation.isPending ? "Saving..." : t("save")}
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
                ...data2
                  .filter(
                    (item) =>
                      data.find((existing) => existing.id === item.id) ===
                      undefined
                  )
                  .map((item, index) => ({
                    ...item,
                    action: (
                      <Trash2
                        size={20}
                        onClick={() =>
                          removeCurrentCountryInvestigator(item.id)
                        }
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

export default InvestigatorAssign;
