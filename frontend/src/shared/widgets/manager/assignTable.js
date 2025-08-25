"use client";

import clsx from "clsx";
import React from "react";

import { Table, Thead2, Tbody, Tr, Th2, Td } from "../../components/table";
import Plus from "../../components/icons/plus";

function AssignTable({ columns, data, openModal }) {
  const countryKey = columns[0].key;

  const rowSpanMap = {};
  let prevCountry = null;

  data.forEach((row, index) => {
    const country = row[countryKey];
    if (country !== prevCountry) {
      rowSpanMap[index] = 1;
      prevCountry = country;
    } else {
      const firstIndex = Object.keys(rowSpanMap).at(-1);
      rowSpanMap[firstIndex]++;
    }
  });

  return (
    <div>
      <Table>
        <Thead2>
          <Tr>
            {columns.map((col, index) => (
              <Th2
                key={col.key}
                className={clsx({
                  "rounded-tl-20 border-t-0 border-l-0  border-color-97":
                    index === 0,
                  "rounded-tr-20 border-t-0 border-r-0 border-color-97":
                    index === columns.length - 1,
                  "border-b border-color-97":
                    index !== 0 && index !== columns.length - 1,
                })}
              >
                {col.title}
              </Th2>
            ))}
          </Tr>
        </Thead2>
        <Tbody>
          {data.map((row, rowIndex) => (
            <Tr key={rowIndex} hover={true}>
              {columns.map((col, colIndex) => {
                if (colIndex === 0) {
                  if (rowSpanMap[rowIndex]) {
                    return (
                      <Td key={col.key} rowSpan={rowSpanMap[rowIndex]}>
                        {row[col.key]}
                      </Td>
                    );
                  } else {
                    return null;
                  }
                }

                return <Td key={col.key}>{row[col.key]}</Td>;
              })}
            </Tr>
          ))}
          <Tr>
            <Td onClick={openModal} className="flex justify-center">
              <Plus />
            </Td>
            <Td colSpan={5}> </Td>
          </Tr>
        </Tbody>
      </Table>
    </div>
  );
}

export default AssignTable;
