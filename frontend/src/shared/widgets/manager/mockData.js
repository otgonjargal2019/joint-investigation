export const koreanPoliceData = [
  {
    name: "1",
    label: "침해 대응 본부",
    type: "headquarter",
    nation: "korea",

    children: [
      {
        name: "1.1",
        label: "온라인 보호부",
        type: "department",
        nation: "korea",
        children: [
          {
            name: "1.1.1",
            label: "김철수",
            type: "employee",
            nation: "korea",
            role: "수사관",
          },
          {
            name: "1.1.2",
            label: "최기민",
            type: "employee",
            nation: "korea",
            role: "수사 관리자",
          },
        ],
      },
    ],
  },
  {
    name: "2",
    label: "침해 대응 본부",
    type: "headquarter",
    nation: "korea",
  },
  {
    name: "3",
    label: "침해 대응 본부",
    type: "headquarter",
    nation: "korea",
  },
  {
    name: "4",
    label: "침해 대응 본부",
    type: "headquarter",
    nation: "korea",
  },
  {
    name: "5",
    label: "침해 대응 본부",
    type: "headquarter",
    nation: "korea",
  },
  {
    name: "6",
    label: "침해 대응 본부",
    type: "headquarter",
    nation: "korea",
    children: [
      {
        name: "6.1",
        label: "온라인 보호부",
        type: "department",
        nation: "korea",
        children: [
          {
            name: "6.1.1",
            label: "김철수",
            type: "employee",
            nation: "korea",
            role: "수사관",
          },
          {
            name: "6.1.2",
            label: "최기민",
            type: "employee",
            nation: "korea",
            role: "수사관",
          },
        ],
      },
    ],
  },
];

export const foreignPoliceData = [
  {
    name: "1",
    label: "태국",
    type: "headquarter",
    nation: "thailand",
    children: [
      {
        name: "1.1.1",
        label: "CHAIYASIT THANAKORN",
        type: "employee",
        nation: "thailand",
        role: "수사관",
      },
      {
        name: "1.1.2",
        label: "NGUYEN MINH KHOA",
        type: "employee",
        nation: "thailand",
        role: "수사 관리자",
      },
    ],
  },
  {
    name: "2",
    label: "베트남",
    type: "headquarter",
    nation: "vietnam",
    children: [
      {
        name: "1.1.1",
        label: "CHAIYASIT THANAKORN",
        type: "employee",
        nation: "vietnam",
        role: "수사 관리자",
      },
      {
        name: "1.1.2",
        label: "NGUYEN MINH KHOA",
        type: "employee",
        nation: "vietnam",
        role: "수사관",
      },
    ],
  },
  {
    name: "3",
    label: "말레이시아",
    type: "headquarter",
  },
  {
    name: "4",
    label: "인도네시아",
    type: "headquarter",
  },
];

export const tableColumns = [
  { key: "nation", title: "국가" },
  { key: "role", title: "역할" },
  { key: "investigator", title: "담당 수사관" },
  { key: "affiliation", title: "소속" },
  { key: "department", title: "부서" },
  { key: "action", title: "" },
];

export const tableColumns2 = [
  { key: "nation", title: "국가" },
  { key: "investigator", title: "담당 수사관" },
  { key: "action", title: "" },
];

export const tableData = [
  // {
  //   id: 0,
  //   role: "수사 관리자",
  //   investigator: "test2",
  //   affiliation: "test3",
  //   department: "test4",
  //   nation: "대한민국",
  // },
  // {
  //   id: 1,
  //   role: "수사관",
  //   investigator: "test6",
  //   affiliation: "test7",
  //   department: "test8",
  //   nation: "대한민국",
  // },
];
