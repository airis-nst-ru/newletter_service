"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon } from "lucide-react";
import { FontSize } from "./extensions/FontSize";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "" }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#b654a7] font-bold underline cursor-pointer",
        },
      }),
      TextStyle,
      Color,
      FontSize,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content from prop if it changes outside (e.g. switching blocks)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="w-full h-32 bg-black border border-neutral-800 rounded-2xl animate-pulse" />
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const colors = [
    { name: "Default", value: "" },
    { name: "Brand Purple", value: "#b654a7" },
    { name: "Muted Grey", value: "#999999" },
    { name: "Warning Red", value: "#ef4444" },
    { name: "Accent Blue", value: "#3b82f6" },
  ];

  return (
    <div className="w-full bg-black border border-neutral-800 focus-within:border-neutral-600 rounded-2xl overflow-hidden transition-all duration-200">
      {/* Mini formatting toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-neutral-900/40 border-b border-neutral-900 px-3 py-1.5 select-none">
        <select
          onChange={(e) => {
            if (e.target.value === "") {
              editor.chain().focus().unsetFontSize().run();
            } else {
              editor.chain().focus().setFontSize(e.target.value).run();
            }
          }}
          value={editor.getAttributes("textStyle").fontSize || ""}
          className="bg-transparent text-neutral-300 text-sm border border-neutral-800 rounded px-1 py-0.5 focus:ring-0 cursor-pointer outline-none hover:text-white"
          title="Font Size"
        >
          <option value="" className="bg-neutral-900">Size</option>
          <option value="12px" className="bg-neutral-900">12px</option>
          <option value="14px" className="bg-neutral-900">14px</option>
          <option value="16px" className="bg-neutral-900">16px</option>
          <option value="18px" className="bg-neutral-900">18px</option>
          <option value="20px" className="bg-neutral-900">20px</option>
          <option value="24px" className="bg-neutral-900">24px</option>
          <option value="30px" className="bg-neutral-900">30px</option>
          <option value="36px" className="bg-neutral-900">36px</option>
        </select>

        <div className="w-px h-5 bg-neutral-850 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive("bold") ? "bg-[#b654a7] text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
          title="Bold"
        >
          <Bold size={14} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive("italic") ? "bg-[#b654a7] text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
          title="Italic"
        >
          <Italic size={14} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive("underline") ? "bg-[#b654a7] text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
          title="Underline"
        >
          <UnderlineIcon size={14} />
        </button>

        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive("link") ? "bg-[#b654a7] text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
          title="Add Link"
        >
          <LinkIcon size={14} />
        </button>

        <div className="w-px h-5 bg-neutral-850 mx-1" />

        {/* Color presets dropdown-like interface */}
        <div className="flex items-center gap-1.5">
          {colors.map((color) => {
            const isActive = color.value === "" 
              ? !editor.getAttributes("textStyle").color 
              : editor.getAttributes("textStyle").color === color.value;
            
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => {
                  if (color.value === "") {
                    editor.chain().focus().unsetColor().run();
                  } else {
                    editor.chain().focus().setColor(color.value).run();
                  }
                }}
                className={`w-4 h-4 rounded-full border cursor-pointer transition-all duration-150 ${
                  isActive ? "border-white scale-110 shadow-md" : "border-neutral-700 hover:scale-105"
                }`}
                style={{ backgroundColor: color.value || "#9f9f9f" }}
                title={color.name}
              />
            );
          })}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="px-4 py-3 min-h-[120px] max-h-96 overflow-y-auto text-sm text-white [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px] [&_a]:text-[#b654a7] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
        <EditorContent editor={editor} className="prose prose-invert max-w-none text-white focus:outline-none" />
      </div>
    </div>
  );
}
