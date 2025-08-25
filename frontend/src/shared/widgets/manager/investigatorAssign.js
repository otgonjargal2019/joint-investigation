"use client";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Card from "@/shared/components/card";
import AssignTable from "./assignTable";
import Search from "@/shared/widgets/search";
import Button from "@/shared/components/button";
import TreeView from "@/shared/components/treeView";
import Modal from "@/shared/components/modal";
import { Table, Thead2, Tbody, Tr, Th2, Td } from "@/shared/components/table";
import {
  koreanPoliceData,
  tableColumns,
  tableData,
  foreignPoliceData,
  tableColumns2,
} from "@/shared/widgets/manager/mockData";

function InvestigatorAssign({ setActiveTab }) {
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [data2, setData2] = useState([]);
  const t = useTranslations();

  const removeKoInvestigator = (id) => {
    setData((prevData) => prevData.filter((row) => row.id !== id));
  };

  const removeForeignInvestgator = (id) => {
    setData2((prevData) => prevData.filter((row) => row.id !== id));
  };

  const chooseKoreanInvestigator = (obj) => {
    setData((prev) => [
      ...prev,
      {
        id: prev?.length + 1,
        nation: obj.nation,
        role: obj.role,
        investigator: obj.label,
        affiliation: "test",
        department: "test department",
        action: (
          <Trash2
            size={20}
            onClick={() => removeKoInvestigator(prev?.length + 1)}
          />
        ),
      },
    ]);
  };

  useEffect(() => {
    if (tableData) {
      const updatedData = tableData.map((row) => ({
        ...row,
        action: (
          <Trash2 size={20} onClick={() => removeKoInvestigator(row.id)} />
        ),
      }));
      setData(updatedData);
    }
  }, [tableData]);

  const router = useRouter();

  const onClickSave = () => {
    //role shalgaad
    // go to manager/incident
    //or /investigtor/incident
    setTimeout(() => {
      router.push("/manager/incident");
    }, 1500);
  };

  const onGoBack = () => {
    setActiveTab(0);
  };

  const chooseForeignInvestigator = (obj) => {
    console.log(obj);
    setData2((prev) => [
      ...prev,
      {
        ...obj,
        id: prev?.length + 1,
        nation: obj.nation,
        investigator: obj.label,
        action: (
          <Trash2
            size={20}
            onClick={() => removeForeignInvestgator(prev?.length + 1)}
          />
        ),
      },
    ]);
  };

  return (
    <div className="p-4">
      <div className="flex justify-center gap-4">
        <Card className={"w-[250px] min-h-[500px]"}>
          <Search
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름/소속/부서"
          />
          <TreeView
            data={koreanPoliceData}
            onClick={chooseKoreanInvestigator}
          />
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
        >
          {t("save")}
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름/소속/부서"
            />
            <TreeView
              data={foreignPoliceData}
              onClick={chooseForeignInvestigator}
            />
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
                ...data2.map((item, index) => ({
                  ...item,
                  id: prev.length + index,
                  action: (
                    <Trash2
                      size={20}
                      onClick={() => removeKoInvestigator(prev.length + index)}
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
