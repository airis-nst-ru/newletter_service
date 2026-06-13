"use client";

import React, { useState } from "react";
import { useEditor } from "../../app/context/EditorContext";
import {
    FileText,
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
    Minus,
    MoreVertical,
    GripVertical,
    Plus,
    CheckSquare,
    Square,
    Eye,
    EyeOff,
    Code
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
    html: Code,
};

export default function LeftPane() {
    const {
        blocks,
        setBlocks,
        selectedBlockId,
        setSelectedBlockId,
        deleteBlock,
        setShowAddBlockOverlay,
        commentsByBlock
    } = useEditor();

    const [isRearrangeMode, setIsRearrangeMode] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [showSectionMenu, setShowSectionMenu] = useState(false);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleBlockHidden = (id: string) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, hidden: !b.hidden } : b));
    };

    // Drag-and-drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        setBlocks((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(draggedIndex, 1);
            updated.splice(targetIndex, 0, moved);
            return updated;
        });
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <aside className="w-80 flex flex-col border-r border-neutral-900 bg-neutral-950 overflow-hidden shrink-0">
            {/* Top toolbar: Add Block, Arrange, Three-dots  — or select-mode actions */}
            <div className="px-4 pt-4 pb-3 border-b border-neutral-900 flex items-center gap-1.5 shrink-0">
                {isSelectMode ? (
                    /* Select mode: show count + delete action */
                    <>
                        <span className="text-[10px] font-semibold text-neutral-400 flex-1">
                            {selectedIds.size > 0
                                ? `${selectedIds.size} ${selectedIds.size === 1 ? "block" : "blocks"} selected`
                                : "Tap blocks to select"}
                        </span>

                        {selectedIds.size > 0 && (
                            <button
                                onClick={() => {
                                    selectedIds.forEach(id => deleteBlock(id));
                                    setSelectedIds(new Set());
                                    setIsSelectMode(false);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 hover:border-red-700/60 text-red-400 hover:text-red-300 text-[10px] font-bold transition-all duration-150 cursor-pointer"
                            >
                                <Trash2 size={11} />
                                Delete
                            </button>
                        )}

                        <button
                            onClick={() => { setIsSelectMode(false); setSelectedIds(new Set()); }}
                            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white text-[10px] font-bold transition-all duration-150 cursor-pointer"
                        >
                            Done
                        </button>
                    </>
                ) : (
                    /* Normal mode: Add Block, Arrange, three-dots */
                    <>
                        <button
                            onClick={() => setShowAddBlockOverlay(true)}
                            title="Add a Block"
                            className="flex items-center gap-1.5 flex-1 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-[#b654a7]/15 border border-neutral-800 hover:border-[#b654a7]/40 text-neutral-300 hover:text-white transition-all duration-150 cursor-pointer text-xs font-semibold"
                        >
                            <Plus size={13} className="text-[#b654a7] shrink-0" />
                            Add Block
                        </button>

                        <button
                            onClick={() => {
                                setIsRearrangeMode(v => !v);
                                setIsSelectMode(false);
                            }}
                            title="Arrange Blocks"
                            className={`p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
                                isRearrangeMode
                                    ? "bg-[#b654a7]/20 border-[#b654a7]/50 text-[#b654a7]"
                                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800"
                            }`}
                        >
                            <GripVertical size={14} />
                        </button>

                        {/* Section three-dots menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSectionMenu(v => !v)}
                                title="More options"
                                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all duration-150 cursor-pointer"
                            >
                                <MoreVertical size={14} />
                            </button>

                            {showSectionMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10 cursor-default"
                                        onClick={() => setShowSectionMenu(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-40 bg-neutral-950 border border-neutral-800 rounded-xl py-1 shadow-2xl z-20 flex flex-col overflow-hidden animate-in fade-in duration-100">
                                        <button
                                            onClick={() => {
                                                setIsSelectMode(v => !v);
                                                setIsRearrangeMode(false);
                                                setSelectedIds(new Set());
                                                setShowSectionMenu(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-[10px] font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                                        >
                                            <CheckSquare size={12} />
                                            Select Blocks
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Current Blocks List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        {isRearrangeMode ? "Rearranging..." : isSelectMode ? "Select Blocks" : "Newsletter Structure"}
                    </h3>
                    {isRearrangeMode ? (
                        <button
                            onClick={() => setIsRearrangeMode(false)}
                            className="text-[10px] font-bold text-white bg-[#b654a7] px-3 py-1 rounded-xl cursor-pointer hover:bg-[#a04692] transition-colors"
                        >
                            Done
                        </button>
                    ) : isSelectMode ? (
                        <button
                            onClick={() => { setIsSelectMode(false); setSelectedIds(new Set()); }}
                            className="text-[10px] font-bold text-white bg-neutral-700 px-3 py-1 rounded-xl cursor-pointer hover:bg-neutral-600 transition-colors"
                        >
                            Done
                        </button>
                    ) : (
                        <span className="text-[10px] font-medium text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-850">
                            {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
                        </span>
                    )}
                </div>

                <div className="space-y-1">
                    {blocks.map((block, index) => {
                        const IconComponent = blockTypeIcons[block.type] || FileText;
                        const isSelected = selectedBlockId === block.id;

                        return (
                            <div
                                key={block.id}
                                onClick={() => {
                                    if (isSelectMode) {
                                        setSelectedIds(prev => {
                                            const next = new Set(prev);
                                            next.has(block.id) ? next.delete(block.id) : next.add(block.id);
                                            return next;
                                        });
                                    } else if (!isRearrangeMode) {
                                        setSelectedBlockId(block.id);
                                    }
                                }}
                                draggable={isRearrangeMode}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-150 ${
                                    isRearrangeMode 
                                        ? "cursor-grab active:cursor-grabbing border border-neutral-800/45" 
                                        : "cursor-pointer"
                                } ${isSelectMode && selectedIds.has(block.id)
                                        ? "bg-[#b654a7]/10 border border-[#b654a7]/30 text-white"
                                        : isSelected && !isRearrangeMode && !isSelectMode
                                            ? "bg-neutral-900 border border-neutral-800 text-white shadow-sm"
                                            : "bg-transparent border border-transparent text-neutral-400 hover:bg-neutral-900/40 hover:text-neutral-200"
                                } ${draggedIndex === index ? "opacity-30 border-dashed border-neutral-700 bg-neutral-950" : ""}`}
                            >
                                {/* Left Accent indicator for active block (only in normal mode) */}
                                {isSelected && !isRearrangeMode && !isSelectMode && (
                                    <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#b654a7] rounded-r" />
                                )}

                                <div className={`flex items-center gap-3 min-w-0 flex-1 transition-opacity ${
                                    block.hidden && !isSelectMode ? "opacity-40 pointer-events-none" : ""
                                }`}>
                                    {/* Block Icon / Grip Icon / Checkbox */}
                                    <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                                        isSelectMode
                                            ? selectedIds.has(block.id)
                                                ? "bg-[#b654a7]/20 text-[#b654a7]"
                                                : "bg-neutral-900/60 text-neutral-500"
                                            : isSelected && !isRearrangeMode 
                                                ? "bg-neutral-800 text-[#b654a7]" 
                                                : "bg-neutral-900/60 text-neutral-500 group-hover:text-neutral-400"
                                    }`}>
                                        {isSelectMode ? (
                                            selectedIds.has(block.id)
                                                ? <CheckSquare size={14} />
                                                : <Square size={14} />
                                        ) : isRearrangeMode ? (
                                            <GripVertical size={14} className="text-neutral-400 animate-pulse" />
                                        ) : (
                                            <IconComponent size={14} />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-xs font-semibold capitalize truncate ${
                                                block.hidden
                                                    ? "text-neutral-600 line-through"
                                                    : isSelected && !isRearrangeMode ? "text-neutral-200" : "text-neutral-400"
                                            }`}>
                                                {block.type.replace(/([A-Z])/g, ' $1')}
                                            </span>
                                            {/* comment count badge */}
                                            {(() => {
                                                const blockComments = commentsByBlock?.[block.id] || [];
                                                const unresolvedCount = blockComments.filter(c => !c.resolved).length;
                                                return unresolvedCount > 0 ? (
                                                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-[#2b2b2b] text-yellow-400 font-semibold">
                                                        {unresolvedCount}
                                                    </span>
                                                ) : null;
                                            })()}
                                            {block.hidden && (
                                                <EyeOff size={10} className="text-neutral-600 shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Three-dots menu (hidden in rearrange/select mode) */}
                                {!isRearrangeMode && !isSelectMode && (
                                    <div className="relative shrink-0 ml-2 group-hover:opacity-100 opacity-0 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === block.id ? null : block.id);
                                            }}
                                            className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white cursor-pointer transition-colors"
                                            title="Block options"
                                        >
                                            <MoreVertical size={14} />
                                        </button>

                                        {activeMenuId === block.id && (
                                            <>
                                                {/* Backdrop to close dropdown */}
                                                <div
                                                    className="fixed inset-0 z-10 cursor-default"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(null);
                                                    }}
                                                />
                                                <div className="absolute right-0 top-full mt-1 w-36 bg-neutral-950 border border-neutral-855 rounded-xl py-1 shadow-2xl z-20 flex flex-col overflow-hidden animate-in fade-in duration-100">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleBlockHidden(block.id);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-[10px] font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        {block.hidden
                                                            ? <><Eye size={12} />Unhide Block</>
                                                            : <><EyeOff size={12} />Hide Block</>
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsRearrangeMode(true);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-[10px] font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        <GripVertical size={12} />
                                                        Move Block
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteBlock(block.id);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-[10px] font-bold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        <Trash2 size={12} />
                                                        Delete Block
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}