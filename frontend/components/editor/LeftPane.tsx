"use client";

import React from "react";
import { useEditor } from "../../app/context/EditorContext";
import {
    FileText,
    MoveUp,
    MoveDown,
    Trash2,
    Layout,
    Sparkles,
    AlignLeft,
    Columns,
    Table as TableIcon,
    User,
    Cpu,
    BookOpen,
    Settings,
    AlertCircle,
    Minus
} from "lucide-react";

const blockTypeIcons: Record<string, React.ComponentType<any>> = {
    header: Layout,
    hero: Sparkles,
    section: AlignLeft,
    featureComparison: Columns,
    benchmarkTable: TableIcon,
    memberSpotlight: User,
    technicalSession: Cpu,
    airisReads: BookOpen,
    conclusion: FileText,
    footer: Settings,
    unsubscribe: AlertCircle,
    divider: Minus,
};

export default function LeftPane() {
    const {
        blocks,
        selectedBlockId,
        setSelectedBlockId,
        moveBlock,
        deleteBlock
    } = useEditor();

    return (
        <aside className="w-80 flex flex-col border-r border-neutral-900 bg-neutral-950 overflow-hidden shrink-0">
            {/* Current Blocks List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Newsletter Structure</h3>
                    <span className="text-[10px] font-medium text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-850">
                        {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
                    </span>
                </div>

                <div className="space-y-1">
                    {blocks.map((block, index) => {
                        const IconComponent = blockTypeIcons[block.type] || FileText;
                        const isSelected = selectedBlockId === block.id;

                        return (
                            <div
                                key={block.id}
                                onClick={() => setSelectedBlockId(block.id)}
                                className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150 ${isSelected
                                        ? "bg-neutral-900 border border-neutral-800 text-white shadow-sm"
                                        : "bg-transparent border border-transparent text-neutral-400 hover:bg-neutral-900/40 hover:text-neutral-200"
                                    }`}
                            >
                                {/* Left Accent indicator for active block */}
                                {isSelected && (
                                    <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#b654a7] rounded-r" />
                                )}

                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {/* Block Icon */}
                                    <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${isSelected ? "bg-neutral-800 text-[#b654a7]" : "bg-neutral-900/60 text-neutral-500 group-hover:text-neutral-400"
                                        }`}>
                                        <IconComponent size={14} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[11px] font-bold text-neutral-600 shrink-0">
                                                {index + 1}
                                            </span>
                                            <span className={`text-xs font-semibold capitalize truncate ${isSelected ? "text-neutral-200" : "text-neutral-400"
                                                }`}>
                                                {block.type.replace(/([A-Z])/g, ' $1')}
                                            </span>
                                        </div>
                                        {/* snippet text */}
                                        <p className="text-[10px] text-neutral-500 font-normal truncate mt-0.5">
                                            {block.title || block.presentsText || block.text || "(no title content)"}
                                        </p>
                                    </div>
                                </div>

                                {/* Move and delete controls - visible only on hover of the specific row */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 bg-neutral-950/80 group-hover:bg-neutral-900/80 p-0.5 rounded-lg border border-neutral-800/40 backdrop-blur-sm">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            moveBlock(index, "up");
                                        }}
                                        disabled={index === 0}
                                        className="p-1 rounded-md text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer transition-colors disabled:cursor-not-allowed hover:bg-neutral-800"
                                        title="Move Up"
                                    >
                                        <MoveUp size={12} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            moveBlock(index, "down");
                                        }}
                                        disabled={index === blocks.length - 1}
                                        className="p-1 rounded-md text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer transition-colors disabled:cursor-not-allowed hover:bg-neutral-800"
                                        title="Move Down"
                                    >
                                        <MoveDown size={12} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteBlock(block.id);
                                        }}
                                        className="p-1 rounded-md text-red-400 hover:text-red-300 hover:bg-red-950/30 cursor-pointer transition-colors"
                                        title="Delete Block"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}