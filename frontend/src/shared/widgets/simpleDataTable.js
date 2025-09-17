"use client";

import React from "react";
import { useTranslations } from "next-intl";

import { Table, Thead, Tbody, Tr, Th, Td } from "../components/table";

function SimpleDataTable({ columns, data, onClickRow }) {
  const hasData = Array.isArray(data) && data.length > 0;
  const t = useTranslations();
  return (
    <Table>
      <Thead>
        <Tr variant="head">
          {columns.map((col) => (
            <Th key={col.key}>{col.title}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {hasData ? (
          data.map((row, rowIndex) => (
            <Tr key={rowIndex} hover={true} onClick={() => onClickRow?.(row)}>
              {columns.map((col) => {
                return (
                  <Td
                    key={col.key}
                    textAlign={col.textAlign}
                    onClick={
                      col.key === "action"
                        ? (e) => e.stopPropagation()
                        : undefined
                    }
                  >
                    {col.render ? col.render(row[col.key]) : row[col.key]}
                  </Td>
                );
              })}
            </Tr>
          ))
        ) : (
          <Tr>
            <Td colSpan={columns.length} textAlign="text-center">
              {t("no-data")}
            </Td>
          </Tr>
        )}
      </Tbody>
    </Table>
  );
}

export default SimpleDataTable;
