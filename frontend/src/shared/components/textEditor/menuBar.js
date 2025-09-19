"use client";

import React, { useState, useCallback } from "react";
import { useEditorState } from "@tiptap/react";
import * as Popover from "@radix-ui/react-popover";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Image as ImageIcon,
  Table as TableIcon,
  Link as LinkIcon,
  Underline,
} from "lucide-react";

import { fontSizes, fonts } from "./fontHelper";

export default function MenuBar({ editor }) {
  if (!editor || !editor.view) return null;

  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeaderRow, setWithHeaderRow] = useState(true);

  const {
    fontFamily,
    fontSize,
    isHeading1,
    isHeading2,
    isHeading3,
    isBold,
    isItalic,
    isUnderline,
    isStrike,
    isAlignLeft,
    isAlignCenter,
    isAlignRight,
    isBulletList,
    isOrderedList,
    isHighlight,
  } = useEditorState({
    editor,
    selector: (ctx) => ({
      fontFamily: ctx.editor?.getAttributes("textStyle").fontFamily || "",
      fontSize: ctx.editor?.getAttributes("textStyle").fontSize || "",
      isHeading1: ctx.editor?.isActive("heading", { level: 1 }),
      isHeading2: ctx.editor?.isActive("heading", { level: 2 }),
      isHeading3: ctx.editor?.isActive("heading", { level: 3 }),
      isBold: ctx.editor?.isActive("bold"),
      isItalic: ctx.editor?.isActive("italic"),
      isUnderline: ctx.editor?.isActive("underline"),
      isStrike: ctx.editor?.isActive("strike"),
      isAlignLeft: ctx.editor?.isActive({ textAlign: "left" }),
      isAlignCenter: ctx.editor?.isActive({ textAlign: "center" }),
      isAlignRight: ctx.editor?.isActive({ textAlign: "right" }),
      isBulletList: ctx.editor?.isActive("bulletList"),
      isOrderedList: ctx.editor?.isActive("orderedList"),
      isHighlight: ctx.editor?.isActive("highlight"),
    }),
  });

  const Options = [
    {
      icon: <Heading1 className="size-4" />,
      label: "Heading 1",
      onClick: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed: isHeading1,
    },
    {
      icon: <Heading2 className="size-4" />,
      label: "Heading 2",
      onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed: isHeading2,
    },
    {
      icon: <Heading3 className="size-4" />,
      label: "Heading 3",
      onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed: isHeading3,
    },
    {
      icon: <Bold className="size-4" />,
      label: "Bold",
      onClick: () => editor?.chain().focus().toggleBold().run(),
      pressed: isBold,
    },
    {
      icon: <Italic className="size-4" />,
      label: "Italic",
      onClick: () => editor?.chain().focus().toggleItalic().run(),
      pressed: isItalic,
    },
    {
      icon: <Underline className="size-4" />,
      label: "Underline",
      onClick: () => editor?.chain().focus().toggleUnderline().run(),
      pressed: isUnderline,
    },
    {
      icon: <Strikethrough className="size-4" />,
      label: "Strikethrough",
      onClick: () => editor?.chain().focus().toggleStrike().run(),
      pressed: isStrike,
    },
    {
      icon: <AlignLeft className="size-4" />,
      label: "Align Left",
      onClick: () => editor?.chain().focus().setTextAlign("left").run(),
      pressed: isAlignLeft,
    },
    {
      icon: <AlignCenter className="size-4" />,
      label: "Align Center",
      onClick: () => editor?.chain().focus().setTextAlign("center").run(),
      pressed: isAlignCenter,
    },
    {
      icon: <AlignRight className="size-4" />,
      label: "Align Right",
      onClick: () => editor?.chain().focus().setTextAlign("right").run(),
      pressed: isAlignRight,
    },
    {
      icon: <List className="size-4" />,
      label: "Bullet List",
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
      pressed: isBulletList,
    },
    {
      icon: <ListOrdered className="size-4" />,
      label: "Ordered List",
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
      pressed: isOrderedList,
    },
    {
      icon: <Highlighter className="size-4" />,
      label: "Highlight",
      onClick: () => editor?.chain().focus().toggleHighlight().run(),
      pressed: isHighlight,
    },
  ];

  const addImage = useCallback(() => {
    if (!editor || !editor.view) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        if (typeof base64 === "string") {
          editor.chain().focus().setImage({ src: base64 }).run();
        }
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor || !editor.view) return;

    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter URL", previousUrl);

    if (url === null) return; // canceled
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const { empty } = editor.state.selection;

    if (empty) {
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: "text",
            text: url,
            marks: [
              {
                type: "link",
                attrs: {
                  href: url,
                },
              },
            ],
          },
        ])
        .run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const handleInsert = useCallback(() => {
    if (!editor || !editor.view) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
  }, [editor, rows, cols, withHeaderRow]);

  return (
    <div className="bg-color-98 border border-color-99 border-b-0 p-2 px-6 space-x-2 z-50">
      {Options.map(({ icon, label, onClick, pressed }, index) => (
        <button
          key={index}
          onClick={onClick}
          title={label}
          className={
            pressed
              ? "is-active p-1 rounded border bg-blue-500 text-white"
              : "p-1 rounded border hover:bg-gray-200"
          }
          type="button"
        >
          {icon}
        </button>
      ))}

      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            title="Insert Table"
            className="p-1 hover:bg-slate-100 rounded"
            aria-label="Insert Table"
          >
            <TableIcon className="size-4" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="bottom"
            className="rounded bg-white shadow p-4 w-64 space-y-3 z-50"
          >
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between text-sm">
                <span>Rows</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="border px-2 py-1 w-16 rounded text-sm"
                />
              </label>

              <label className="flex items-center justify-between text-sm">
                <span>Columns</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="border px-2 py-1 w-16 rounded text-sm"
                />
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={withHeaderRow}
                  onChange={(e) => setWithHeaderRow(e.target.checked)}
                />
                <span>With header row</span>
              </label>

              <button
                type="button"
                onClick={handleInsert}
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Insert Table
              </button>
            </div>

            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <button
        type="button"
        title="Insert Image"
        onClick={addImage}
        className="p-1 hover:bg-slate-100 rounded"
      >
        <ImageIcon className="size-4" />
      </button>

      <button
        type="button"
        title="Add/Edit Link"
        onClick={addLink}
        className="p-1 hover:bg-slate-100 rounded"
      >
        <LinkIcon className="size-4" />
      </button>

      <select
        onChange={(e) => {
          console.log(editor?.getAttributes("textStyle"));
          if (!editor || !editor.view) return;
          editor?.chain().focus().setFontFamily(e.target.value).run();
        }}
        value={fontFamily}
        className="border px-2 py-1 text-sm rounded"
      >
        {fonts.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>

      <select
        onChange={(e) => {
          if (!editor || !editor.view) return;
          editor.chain().focus().setFontSize(e.target.value).run();
        }}
        value={fontSize}
        className="border px-2 py-1 text-sm rounded"
      >
        {fontSizes.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
    </div>
  );
}
