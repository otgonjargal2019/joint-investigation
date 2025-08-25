"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Minus,
  TableCellsMergeIcon,
  TableCellsSplitIcon,
  Trash2,
} from "lucide-react";

export default function TableToolbar({ editor }) {
  const [position, setPosition] = useState(null);
  const toolbarRef = useRef(null);

  const updateToolbarPosition = () => {
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection?.anchorNode) return;

    let node =
      selection.anchorNode.nodeType === 3
        ? selection.anchorNode.parentElement
        : selection.anchorNode;

    const table = node?.closest?.("table");
    if (!table) {
      setPosition(null);
      return;
    }

    const rect = table.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!editor) return;

    updateToolbarPosition();

    editor.on("selectionUpdate", updateToolbarPosition);
    window.addEventListener("resize", updateToolbarPosition);
    window.addEventListener("scroll", updateToolbarPosition, true); // scrollable parents

    return () => {
      editor.off("selectionUpdate", updateToolbarPosition);
      window.removeEventListener("resize", updateToolbarPosition);
      window.removeEventListener("scroll", updateToolbarPosition, true);
    };
  }, [editor]);

  const canAddRow = editor?.can().addRowAfter();
  const canDeleteRow = editor?.can().deleteRow();
  const canAddColumn = editor?.can().addColumnAfter();
  const canDeleteColumn = editor?.can().deleteColumn();
  const canMergeCells = editor?.can().mergeCells();
  const canSplitCell = editor?.can().splitCell();
  const canDeleteTable = editor?.can().deleteTable();

  if (!position) return null;

  return (
    <div
      ref={toolbarRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        width: position.width,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: 4,
        padding: "4px 8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        display: "flex",
        gap: 8,
        zIndex: 1000,
      }}
      role="toolbar"
      aria-label="Table controls"
    >
      <button
        disabled={!canAddRow}
        onClick={() => editor.chain().focus().addRowAfter().run()}
        title="Add Row After"
        className="p-1 disabled:opacity-50"
        type="button"
      >
        <Plus size={16} />
      </button>

      <button
        disabled={!canDeleteRow}
        onClick={() => editor.chain().focus().deleteRow().run()}
        title="Delete Row"
        className="p-1 disabled:opacity-50"
        type="button"
      >
        <Minus size={16} />
      </button>

      <button
        disabled={!canAddColumn}
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        title="Add Column After"
        className="p-1 disabled:opacity-50"
        type="button"
      >
        <Plus size={16} />
      </button>

      <button
        disabled={!canDeleteColumn}
        onClick={() => editor.chain().focus().deleteColumn().run()}
        title="Delete Column"
        className="p-1 disabled:opacity-50"
        type="button"
      >
        <Minus size={16} />
      </button>

      <button
        disabled={!canMergeCells}
        onClick={() => editor.chain().focus().mergeCells().run()}
        title="Merge Cells"
        className="p-1 disabled:opacity-50"
        type="button"
      >
        <TableCellsMergeIcon size={16} />
      </button>

      <button
        disabled={!canSplitCell}
        onClick={() => editor.chain().focus().splitCell().run()}
        title="Split Cell"
        className="p-1 disabled:opacity-50"
        type="button"
      >
        <TableCellsSplitIcon size={16} />
      </button>

      <button
        disabled={!canDeleteTable}
        onClick={() => editor.chain().focus().deleteTable().run()}
        title="Delete Table"
        className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
        type="button"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
