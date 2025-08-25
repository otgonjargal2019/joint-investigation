"use client";

import React from "react";

import { Table, Thead, Tbody, Tr, Th, Td } from "../components/table";

function SimpleDataTable({ columns, data, onClickRow }) {
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
        {Array.isArray(data) &&
          data.map((row, rowIndex) => (
            <Tr key={rowIndex} hover={true} onClick={() => onClickRow?.(row)}>
              {columns.map((col) => (
                <Td key={col.key} textAlign={col.textAlign}>
                  {row[col.key]}
                </Td>
              ))}
            </Tr>
          ))}
      </Tbody>
    </Table>
  );
}

export default SimpleDataTable;
