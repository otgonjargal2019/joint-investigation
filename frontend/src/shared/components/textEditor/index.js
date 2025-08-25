"use client";

import "./styles.scss";
import "./table.scss";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import Image from "@tiptap/extension-image";

import MenuBar from "./menuBar";
import TableToolbar from "./tableToolbar";

const Tiptap = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      TextStyleKit,
      TableKit.configure({
        table: { resizable: true },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    // content: "<p>Hello World!</p>",
    // Don't render immediately on the server to avoid SSR issues
    editorProps: {
      attributes: {
        class: "min-h-[300px] border border-color-99 bg-color-98 py-2 px-3",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="editor-wrapper">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <TableToolbar editor={editor} />
    </div>
  );
};

export default Tiptap;
