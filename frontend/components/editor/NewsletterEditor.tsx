"use client";

import {
  useEditor,
  EditorContent,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import FontFamily from "@tiptap/extension-font-family";

import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Save,
  Eye,
  UnderlineIcon,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Quote,
  Minus,
  Braces,
  Table2,
  Newspaper,
  Calendar,
  Sparkles,
  Bot,
  ImagePlus,
  Rows3,
  Columns3,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import MediaManager from "./MediaManager";

interface Props {
  newsletterId: string;
}

const presetColors = [
  "#ffffff",
  "#60a5fa",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#a855f7",
  "#eab308",
  "#14b8a6",
];

export default function NewsletterEditor({
  newsletterId,
}: Props) {
  const [title, setTitle] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [previewMode, setPreviewMode] =
    useState(false);

  const [showMediaManager,
    setShowMediaManager,
  ] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit,

      Placeholder.configure({
        placeholder:
          "Write your AI newsletter...",
      }),

      TextStyle,
      Color,
      Underline,
      FontFamily,
      Highlight,

      Link.configure({
        openOnClick: false,
      }),

      Image.configure({
        inline: false,
        allowBase64: true,
      }),

      TextAlign.configure({
        types: [
          "heading",
          "paragraph",
        ],
      }),

      Table.configure({
        resizable: true,
      }),

      TableRow,
      TableHeader,
      TableCell,
    ],

    content: "",

    editorProps: {
      attributes: {
        class:
          "ProseMirror min-h-[700px] outline-none px-10 py-8 text-lg leading-8",
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const fetchNewsletter =
      async () => {
        try {
          setLoading(true);

          const response =
            await fetch(
              `/api/v1/newsletters/${newsletterId}`,
              {
                credentials:
                  "include",
              }
            );

          const data =
            await response.json();

          if (
            data?.data?.content
          ) {
            setTitle(
              data.data.content.title
            );

            editor.commands.setContent(
              data.data.content.content ||
              ""
            );
          }
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

    fetchNewsletter();
  }, [editor, newsletterId]);

  const handleSave = async () => {
    try {
      if (!editor) {
        return;
      }

      setSaving(true);

      const html =
        editor.getHTML();

      const json =
        JSON.stringify(
          editor.getJSON()
        );

      const response =
        await fetch(
          `/api/v1/newsletters/${newsletterId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body: JSON.stringify({
              title,
              content: html,
              state: json,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to save"
        );
      }

      alert(
        "Newsletter saved"
      );
    } catch (error) {
      console.log(error);
      alert(
        "Save failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const insertAIBlock = (
    type:
      | "news"
      | "tool"
      | "event"
  ) => {
    if (!editor) return;

    if (type === "news") {
      editor
        .chain()
        .focus()
        .insertContent(`
          <div class="airis-news-card">
            <h2>AI News Title</h2>
            <p>
              AI summary goes here.
            </p>
            <a href="#">
              Read More
            </a>
          </div>
        `)
        .run();
    }

    if (type === "tool") {
      editor
        .chain()
        .focus()
        .insertContent(`
          <div class="airis-tool-card">
            <h2>AI Tool</h2>
            <p>
              Tool description.
            </p>
            <a href="#">
              Explore Tool
            </a>
          </div>
        `)
        .run();
    }

    if (type === "event") {
      editor
        .chain()
        .focus()
        .insertContent(`
          <div class="airis-event-card">
            <h2>Workshop/Event</h2>
            <p>
              Event details.
            </p>
            <a href="#">
              Register Now
            </a>
          </div>
        `)
        .run();
    }
  };

  if (!editor || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Loading AIRIS Editor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-black border-b border-neutral-800 px-8 py-5 flex items-center justify-between">

        <div>
          <p className="text-sm text-neutral-500 mb-1">
            AIRIS Chronicle
          </p>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            placeholder="Newsletter Title"
            className="bg-transparent text-3xl font-bold outline-none w-[600px]"
          />
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() =>
              setPreviewMode(
                !previewMode
              )
            }
            className="border border-neutral-700 px-4 py-2 rounded-2xl flex items-center gap-2 hover:bg-neutral-900"
          >
            <Eye size={18} />
            {previewMode
              ? "Edit"
              : "Preview"}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-black px-5 py-2 rounded-2xl font-semibold flex items-center gap-2"
          >
            <Save size={18} />
            {saving
              ? "Saving..."
              : "Save Draft"}
          </button>

        </div>
      </div>

      {/* TOOLBAR */}
      {!previewMode && (
        <div className="sticky top-[92px] z-40 bg-black border-b border-neutral-800 px-6 py-4 flex items-center gap-2 flex-wrap">

          {/* FONT */}
          <select
            onChange={(e) => {
              editor
                .chain()
                .focus()
                .setFontFamily(
                  e.target.value
                )
                .run();
            }}
            className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2"
          >
            <option value="Arial">
              Arial
            </option>

            <option value="Georgia">
              Georgia
            </option>

            <option value="Verdana">
              Verdana
            </option>

            <option value="Times New Roman">
              Times
            </option>
          </select>

          {/* COLORS */}
          <div className="flex items-center gap-2 px-3">
            {presetColors.map(
              (color) => (
                <button
                  key={color}
                  style={{
                    background:
                      color,
                  }}
                  className="w-8 h-8 rounded-full border border-white/20"
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .setColor(
                        color
                      )
                      .run();
                  }}
                />
              )
            )}
          </div>

          {/* FORMATTING */}
          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleBold()
                .run();
            }}
          >
            <Bold size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleItalic()
                .run();
            }}
          >
            <Italic size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleUnderline()
                .run();
            }}
          >
            <UnderlineIcon size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleHighlight()
                .run();
            }}
          >
            <Highlighter size={18} />
          </ToolbarButton>



          {/* HEADINGS */}
          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 1,
                })
                .run();
            }}
          >
            <Heading1 size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 2,
                })
                .run();
            }}
          >
            <Heading2 size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 3,
                })
                .run();
            }}
          >
            <Heading3 size={18} />
          </ToolbarButton>

          {/* LISTS */}
          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleBulletList()
                .run();
            }}
          >
            <List size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleOrderedList()
                .run();
            }}
          >
            <ListOrdered size={18} />
          </ToolbarButton>

          {/* ALIGNMENT */}
          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .setTextAlign(
                  "left"
                )
                .run();
            }}
          >
            <AlignLeft size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .setTextAlign(
                  "center"
                )
                .run();
            }}
          >
            <AlignCenter size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .setTextAlign(
                  "right"
                )
                .run();
            }}
          >
            <AlignRight size={18} />
          </ToolbarButton>

          {/* LINK */}
          <ToolbarButton
            onClick={() => {
              const url =
                window.prompt(
                  "Enter URL"
                );

              if (!url) return;

              editor
                .chain()
                .focus()
                .setLink({
                  href: url,
                })
                .run();
            }}
          >
            <Link2 size={18} />
          </ToolbarButton>

          {/* MEDIA */}
          <ToolbarButton
            onClick={() =>
              setShowMediaManager(
                true
              )
            }
          >
            <ImagePlus size={18} />
          </ToolbarButton>

          {/* VARIABLES */}
          <ToolbarButton
            onClick={() => {
              const variable =
                window.prompt(
                  "Variable name"
                );

              if (!variable) return;

              editor
                .chain()
                .focus()
                .insertContent(
                  `{{${variable}}}`
                )
                .run();
            }}
          >
            <Braces size={18} />
          </ToolbarButton>

          {/* TABLE */}
          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .insertTable({
                  rows: 3,
                  cols: 3,
                  withHeaderRow: true,
                })
                .run();
            }}
          >
            <Table2 size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .addRowAfter()
                .run();
            }}
          >
            <Rows3 size={18} />
          </ToolbarButton>


          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .addColumnAfter()
                .run();
            }}
          >
            <Columns3 size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .deleteRow()
                .run();
            }}
          >
            Delete Row
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .deleteColumn()
                .run();
            }}
          >
            Delete Column
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .deleteTable()
                .run();
            }}
          >
            <Trash2 size={18} />
          </ToolbarButton>


          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .addColumnAfter()
                .run();
            }}
          >
            <Columns3 size={18} />
          </ToolbarButton>

          {/* DIVIDER */}
          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .setHorizontalRule()
                .run();
            }}
          >
            <Minus size={18} />
          </ToolbarButton>

          {/* QUOTE */}
          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleBlockquote()
                .run();
            }}
          >
            <Quote size={18} />
          </ToolbarButton>

          {/* AI BLOCKS */}
          <ToolbarButton
            onClick={() =>
              insertAIBlock(
                "news"
              )
            }
          >
            <Newspaper size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              insertAIBlock(
                "tool"
              )
            }
          >
            <Bot size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              insertAIBlock(
                "event"
              )
            }
          >
            <Calendar size={18} />
          </ToolbarButton>

          {/* AI GENERATE */}
          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .insertContent(`
                  <div class="airis-ai-box">
                    <h2>
                      AI Generated Summary
                    </h2>
                    <p>
                      Generate summary using Groq.
                    </p>
                  </div>
                `)
                .run();
            }}
          >
            <Sparkles size={18} />
          </ToolbarButton>

          {/* UNDO */}
          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .undo()
                .run();
            }}
          >
            <Undo2 size={18} />
          </ToolbarButton>

          {/* REDO */}
          <ToolbarButton
            onClick={() => {
              editor
                .chain()
                .focus()
                .redo()
                .run();
            }}
          >
            <Redo2 size={18} />
          </ToolbarButton>

        </div>
      )}

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto py-10">

        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">

          {previewMode ? (
            <div
              className="prose prose-invert max-w-none px-10 py-8"
              dangerouslySetInnerHTML={{
                __html:
                  editor.getHTML(),
              }}
            />
          ) : (
            <EditorContent
              editor={editor}
            />
          )}

        </div>

      </div>

      {/* MEDIA MANAGER */}
      {showMediaManager && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-8">

          <div className="w-full max-w-6xl bg-neutral-950 border border-neutral-800 rounded-3xl p-8 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">
                Media Library
              </h2>

              <button
                onClick={() =>
                  setShowMediaManager(
                    false
                  )
                }
                className="border border-neutral-700 px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>

            <MediaManager
              onSelect={(url: any) => {
                editor
                  ?.chain()
                  .focus()
                  .setImage({
                    src: url,
                  })
                  .run();

                setShowMediaManager(
                  false
                );
              }}
            />

          </div>

        </div>
      )}

    </div>
  );
}

interface ToolbarButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

function ToolbarButton({
  children,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-xl border border-neutral-700 hover:bg-neutral-900 transition-all"
    >
      {children}
    </button>
  );
}