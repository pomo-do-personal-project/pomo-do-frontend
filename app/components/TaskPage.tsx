"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import { useAuthStore } from "../stores/useAuthStore";
import { Priority, TaskStatus, TaskDto } from "../types/api";
import {
  CalendarDays,
  FastForward,
  Zap,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Plus,
  Check,
  Clock,
  ChevronRight,
  Flag,
  ChevronDown,
  X,
  Trash2,
} from "lucide-react";

export type MatrixQuadrant =
  | "urgent-important" // Q1: Làm ngay (Do first)
  | "not-urgent-important" // Q2: Lên lịch (Schedule)
  | "urgent-not-important" // Q3: Cần gấp / Ủy quyền (Delegate)
  | "not-urgent-not-important"; // Q4: Loại bỏ / Thư giãn (Don't do)

export type TaskCategory = "Today" | "Upcoming" | "QuickAdd" | "Calendar";

export const PRIORITY_MAP: Record<MatrixQuadrant, Priority> = {
  "urgent-important": Priority.ImportantUrgent,
  "not-urgent-important": Priority.ImportantNotUrgent,
  "urgent-not-important": Priority.NotImportantUrgent,
  "not-urgent-not-important": Priority.NotImportantNotUrgent,
};

export const REVERSE_PRIORITY_MAP: Record<Priority, MatrixQuadrant> = {
  [Priority.ImportantUrgent]: "urgent-important",
  [Priority.ImportantNotUrgent]: "not-urgent-important",
  [Priority.NotImportantUrgent]: "urgent-not-important",
  [Priority.NotImportantNotUrgent]: "not-urgent-not-important",
};

const MATRIX_OPTIONS: { id: MatrixQuadrant; label: string; color: string; desc: string }[] = [
  { id: "urgent-important", label: "Khẩn cấp & Quan trọng", color: "bg-rose-500 text-white", desc: "Làm ngay (Do first)" },
  { id: "not-urgent-important", label: "Không khẩn & Quan trọng", color: "bg-blue-500 text-white", desc: "Lên lịch (Schedule)" },
  { id: "urgent-not-important", label: "Khẩn cấp & Không quan trọng", color: "bg-amber-500 text-white", desc: "Ủy quyền (Delegate)" },
  { id: "not-urgent-not-important", label: "Không khẩn & Không quan trọng", color: "bg-neutral-500 text-white", desc: "Loại bỏ / Thư giãn" },
];

export function TaskPage() {
  const {
    tasks,
    selectedTask,
    isLoading,
    isSaving,
    error,
    fetchTasks,
    selectTask,
    createTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    clearError,
  } = useTaskStore();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [currentCategory, setCurrentCategory] = useState<TaskCategory>("Today");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const [isAddingTaskInput, setIsAddingTaskInput] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [isAddingSubtaskInput, setIsAddingSubtaskInput] = useState(false);
  const [newSubtaskInput, setNewSubtaskInput] = useState("");
  const [isMatrixMenuOpen, setIsMatrixMenuOpen] = useState(false);

  // Form states cho selectedTask đang chỉnh sửa
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>(Priority.ImportantUrgent);
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState<number>(30);
  const [editDueDate, setEditDueDate] = useState<string>("");

  // Kích thước panel chi tiết và trạng thái kéo giãn (Resize)
  const [detailWidth, setDetailWidth] = useState<number>(384); // 384px = w-96 mặc định
  const [isResizing, setIsResizing] = useState(false);
  const detailWidthRef = useRef<number>(384);

  const matrixDropdownRef = useRef<HTMLDivElement>(null);
  const detailPanelRef = useRef<HTMLElement>(null);

  // Khôi phục chiều rộng panel đã lưu trong localStorage nếu có
  useEffect(() => {
    const savedWidth = localStorage.getItem("pomo-task-detail-width");
    if (savedWidth) {
      const parsed = parseInt(savedWidth, 10);
      if (!isNaN(parsed) && parsed >= 280 && parsed <= 750) {
        setDetailWidth(parsed);
        detailWidthRef.current = parsed;
      }
    }
  }, []);

  // Xử lý kéo thả chuột để co giãn chiều rộng panel mượt mà (dùng requestAnimationFrame)
  useEffect(() => {
    let animationFrameId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        // Tính chiều rộng từ cạnh phải màn hình
        const newWidth = window.innerWidth - e.clientX;
        const clampedWidth = Math.max(300, Math.min(newWidth, Math.min(750, window.innerWidth - 350)));
        detailWidthRef.current = clampedWidth;
        setDetailWidth(clampedWidth);
      });
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
        localStorage.setItem("pomo-task-detail-width", detailWidthRef.current.toString());
      }
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // Fetch tasks on initial mount or when auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      // Khi chưa đăng nhập: đảm bảo reset sạch danh sách task khỏi màn hình
      useTaskStore.getState().resetTaskStore();
    }
  }, [fetchTasks, isAuthenticated]);

  // Synchronize edit fields when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      setEditTitle(selectedTask.title);
      setEditPriority(selectedTask.priority);
      setEditEstimatedMinutes(selectedTask.estimatedMinutes || 30);
      setEditDueDate(
        selectedTask.dueDate
          ? selectedTask.dueDate.split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
    }
  }, [selectedTask]);

  // Close matrix dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (matrixDropdownRef.current && !matrixDropdownRef.current.contains(event.target as Node)) {
        setIsMatrixMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close task detail panel on click outside (ấn ra ngoài màn hình là đóng)
  useEffect(() => {
    function handleOutsideDetailClick(event: MouseEvent) {
      if (isResizing || !selectedTask) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Không đóng nếu click bên trong detail panel
      if (detailPanelRef.current && detailPanelRef.current.contains(target)) {
        return;
      }

      // Không đóng nếu click vào một task item trong danh sách (để tránh xung đột với việc chọn task khác)
      if (target.closest("[data-task-item]")) {
        return;
      }

      selectTask(null);
    }

    document.addEventListener("mousedown", handleOutsideDetailClick);
    return () => document.removeEventListener("mousedown", handleOutsideDetailClick);
  }, [isResizing, selectedTask, selectTask]);

  // Filter tags list based on tasks
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((t) => {
      t.tags?.forEach((tg) => tagSet.add(tg.name));
    });
    return Array.from(tagSet);
  }, [tasks]);

  // Counts for sidebar badges
  const categoryCounts = React.useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return {
      Today: tasks.filter((t) => !t.isQuickAdd && (!t.dueDate || t.dueDate.startsWith(todayStr))).length,
      Upcoming: tasks.filter((t) => !t.isQuickAdd && t.dueDate && !t.dueDate.startsWith(todayStr)).length,
      QuickAdd: tasks.filter((t) => t.isQuickAdd).length,
      Calendar: tasks.length,
    };
  }, [tasks]);

  // Filter tasks based on category & tag
  const filteredTasks = React.useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return tasks.filter((t) => {
      // Filter by Category
      if (currentCategory === "QuickAdd") {
        if (!t.isQuickAdd) return false;
      } else if (currentCategory === "Today") {
        if (t.isQuickAdd) return false;
        if (t.dueDate && !t.dueDate.startsWith(todayStr)) {
          return false;
        }
      } else if (currentCategory === "Upcoming") {
        if (t.isQuickAdd) return false;
        if (!t.dueDate || t.dueDate.startsWith(todayStr)) {
          return false;
        }
      }

      // Filter by Tag
      if (selectedTag !== "All") {
        const hasTag = t.tags?.some((tg) => tg.name === selectedTag);
        if (!hasTag) return false;
      }

      return true;
    });
  }, [tasks, currentCategory, selectedTag]);

  // Add Task inline
  const handleAddNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim() || isSaving) return;

    const isQuick = currentCategory === "QuickAdd";

    try {
      const created = await createTask({
        title: newTaskInput.trim(),
        priority: Priority.ImportantUrgent,
        estimatedPomodoros: Math.ceil(30 / 25),
        estimatedMinutes: 30,
        dueDate: isQuick ? null : new Date().toISOString(),
        isQuickAdd: isQuick,
      });
      if (created) {
        setNewTaskInput("");
        setIsAddingTaskInput(false);
      }
    } catch {
      // Error handled in store
    }
  };

  const handleToggleTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleTaskStatus(id);
  };

  const handleSaveDetail = async () => {
    if (!selectedTask || isSaving) return;
    try {
      const updated = await updateTask(selectedTask.id, {
        title: editTitle.trim() || selectedTask.title,
        priority: editPriority,
        status: selectedTask.status,
        estimatedMinutes: editEstimatedMinutes,
        estimatedPomodoros: Math.max(1, Math.round(editEstimatedMinutes / 25)),
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
      });
      // Đóng panel chi tiết sau khi lưu thành công
      if (updated) {
        selectTask(null);
      }
    } catch {
      // Handled in store
    }
  };

  const handleCloseDetail = () => {
    selectTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa công việc này?")) {
      await deleteTask(id);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskInput.trim() || !selectedTask) return;
    try {
      await addSubtask(selectedTask.id, {
        title: newSubtaskInput.trim(),
        orderIndex: selectedTask.subtasks?.length || 0,
      });
      setNewSubtaskInput("");
      setIsAddingSubtaskInput(false);
    } catch {
      // Handled in store
    }
  };

  const getMatrixBadgeColor = (p: Priority) => {
    switch (p) {
      case Priority.ImportantUrgent:
        return "text-rose-600 dark:text-rose-400";
      case Priority.ImportantNotUrgent:
        return "text-blue-600 dark:text-blue-400";
      case Priority.NotImportantUrgent:
        return "text-amber-600 dark:text-amber-400";
      default:
        return "text-neutral-400";
    }
  };

  return (
    <div className="flex-1 flex w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-transparent transition-colors">
      {/* 1. Left Sub-Sidebar (Category & Tag Filter) */}
      <aside className="w-56 border-r border-neutral-200/80 dark:border-neutral-800/80 flex flex-col p-4 shrink-0 bg-transparent">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3 px-2">
          Category
        </h3>
        <nav className="flex flex-col gap-1 mb-6">
          {(
            [
              { id: "Today", label: "Today", icon: CalendarDays },
              { id: "Upcoming", label: "Upcoming", icon: FastForward },
              { id: "QuickAdd", label: "Quick Add", icon: Zap },
              { id: "Calendar", label: "Calendar", icon: Calendar },
            ] as const
          ).map((item) => {
            const count = categoryCounts[item.id];
            const isActive = currentCategory === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentCategory(item.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? item.id === "QuickAdd"
                      ? "bg-amber-500 text-white shadow-xs font-semibold"
                      : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                    : item.id === "QuickAdd"
                    ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconComponent size={16} strokeWidth={1.75} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-black/20 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Tags / Custom Lists Filter */}
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Tags & Lists
          </h3>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto flex-1">
          <button
            onClick={() => setSelectedTag("All")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
              selectedTag === "All"
                ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-neutral-400 shrink-0" />
            <span className="truncate">Tất cả ({tasks.length})</span>
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                selectedTag === tag
                  ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
              <span className="truncate">{tag}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* 2. Middle Main Area: Task List for Selected Category */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {currentCategory === "QuickAdd" ? "⚡ Quick Add (Ý nghĩ phát sinh)" : currentCategory}
            </h1>
          </div>
          {isLoading && (
            <span className="text-xs text-neutral-400 animate-pulse font-mono">
              Đang đồng bộ...
            </span>
          )}
        </div>

        {error && isAuthenticated && !error.toLowerCase().includes("unauthorized") && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} strokeWidth={1.75} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchTasks()}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors cursor-pointer text-[11px] flex items-center gap-1"
              >
                <span>Thử lại</span>
                <RotateCcw size={12} strokeWidth={2} />
              </button>
              <button
                onClick={clearError}
                className="px-2 py-1 text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-100 font-medium cursor-pointer text-[11px]"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* "+ Add new task" Button Frame */}
        {!isAddingTaskInput ? (
          <button
            type="button"
            onClick={() => setIsAddingTaskInput(true)}
            className={`w-full mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl text-left cursor-pointer transition-all group shadow-2xs border-2 border-dashed ${
              currentCategory === "QuickAdd"
                ? "bg-amber-50/40 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border-amber-300 dark:border-amber-700"
                : "bg-neutral-100/50 hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-base font-bold shrink-0 group-hover:scale-105 transition-transform ${
                currentCategory === "QuickAdd"
                  ? "bg-amber-500 text-white"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              }`}
            >
              <Plus size={16} strokeWidth={2.2} />
            </span>
            <span
              className={`text-sm sm:text-base font-medium transition-colors ${
                currentCategory === "QuickAdd"
                  ? "text-amber-800 dark:text-amber-300"
                  : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200"
              }`}
            >
              {currentCategory === "QuickAdd"
                ? "Ghi nhanh ý nghĩ phát sinh (Quick Add)"
                : "Add new task"}
            </span>
          </button>
        ) : (
          <form onSubmit={handleAddNewTask} className="mb-6">
            <div
              className={`flex items-center gap-3 px-4 py-3 bg-transparent border-2 rounded-2xl shadow-2xs transition-colors ${
                currentCategory === "QuickAdd"
                  ? "border-amber-500"
                  : "border-neutral-900 dark:border-white"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  currentCategory === "QuickAdd"
                    ? "bg-amber-500 text-white"
                    : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                }`}
              >
                <Plus size={16} strokeWidth={2.2} />
              </span>
              <input
                type="text"
                autoFocus
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder={
                  currentCategory === "QuickAdd"
                    ? "Nhập nhanh ý nghĩ nảy ra khi đang làm việc..."
                    : "Nhập tên công việc mới rồi nhấn Enter..."
                }
                className="flex-1 bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => {
                  setIsAddingTaskInput(false);
                  setNewTaskInput("");
                }}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 px-2 py-1 rounded cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* Task Items List */}
        <div className="flex flex-col gap-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-sm text-neutral-400 dark:text-neutral-500">
              {isLoading
                ? "Đang tải công việc..."
                : currentCategory === "QuickAdd"
                ? "Chưa có ý nghĩ nảy sinh nào được ghi nhận. Hãy bấm nút trên để thêm nhanh!"
                : `Chưa có công việc nào trong mục ${currentCategory}. Hãy thêm task mới ở trên!`}
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              const isCompleted = task.status === TaskStatus.Completed;

              return (
                <div
                  key={task.id}
                  data-task-item="true"
                  onClick={() => selectTask(task)}
                  className={`px-4 py-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer select-none ${
                    isSelected
                      ? "bg-neutral-100 dark:bg-neutral-800/90 border-neutral-400 dark:border-neutral-600 shadow-xs"
                      : "bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Rounded Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleTask(task.id, e)}
                      aria-label={`Đánh dấu hoàn thành ${task.title}`}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-neutral-400 dark:border-neutral-600 hover:border-neutral-600"
                      }`}
                    >
                      {isCompleted && <Check size={13} strokeWidth={2.5} />}
                    </button>

                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`text-sm sm:text-base truncate ${
                          isCompleted
                            ? "line-through text-neutral-400 dark:text-neutral-500"
                            : "text-neutral-800 dark:text-neutral-200 font-medium"
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* QuickAdd Badge */}
                      {task.isQuickAdd && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Zap size={10} strokeWidth={2} />
                          <span>Quick</span>
                        </span>
                      )}

                      {/* Eisenhower Matrix Priority Indicator */}
                      <span
                        className={`text-xs ${getMatrixBadgeColor(task.priority)}`}
                        title="Độ ưu tiên Ma trận Eisenhower"
                      >
                        ●
                      </span>

                      {/* Estimated time tag */}
                      <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock size={11} strokeWidth={1.75} />
                        <span>{task.estimatedMinutes || 25}m</span>
                      </span>

                      {/* Subtasks summary */}
                      {task.subtasks?.length > 0 && (
                        <span className="text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                          {task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow indicator pointing to detail panel */}
                  <span className="text-neutral-400 dark:text-neutral-500 px-2 flex items-center">
                    <ChevronRight size={16} strokeWidth={1.75} />
                  </span>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* 3. Right Task Detail Panel (Resizable & Closable) */}
      {selectedTask && (
        <aside
          ref={detailPanelRef}
          style={{ width: `${detailWidth}px` }}
          className={`relative border-l border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md flex flex-col p-6 overflow-y-auto shrink-0 select-none ${
            isResizing ? "transition-none pointer-events-none" : "transition-[width] duration-150 ease-out"
          }`}
        >
          {/* Resize Handle Bar (kéo mép trái để co dãn kích thước panel) */}
          <div
            onMouseDown={() => setIsResizing(true)}
            title="Kéo sang trái/phải để co giãn khung chi tiết"
            className="absolute top-0 left-0 bottom-0 w-3 cursor-col-resize hover:bg-neutral-400/30 dark:hover:bg-neutral-500/30 transition-colors z-20 group flex items-center justify-center -ml-1.5 pointer-events-auto"
          >
            <div className="w-1 h-10 bg-neutral-300 dark:bg-neutral-600 rounded-full group-hover:bg-neutral-500 dark:group-hover:bg-neutral-400 transition-colors" />
          </div>

          {/* Header: Name task & Fix cứng Matrix Selector Button (Flag) */}
          <div className="relative pb-3 border-b-2 border-neutral-300 dark:border-neutral-700 mb-6 pointer-events-auto">
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-bold text-neutral-900 dark:text-white bg-transparent focus:outline-none flex-1 min-w-0 truncate"
                placeholder="Tên công việc"
              />

              {/* Matrix Flag Dropdown Trigger - Cố định vị trí cứng cáp */}
              <div className="relative shrink-0 flex items-center" ref={matrixDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsMatrixMenuOpen((prev) => !prev)}
                  title="Chọn dạng Ma trận Eisenhower (Matrix Quadrant)"
                  aria-label="Chọn Ma trận Eisenhower"
                  className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Flag size={18} strokeWidth={2} className={`${getMatrixBadgeColor(editPriority)} shrink-0`} />
                  <ChevronDown size={14} strokeWidth={2} className="text-neutral-400 shrink-0" />
                </button>

                  {/* Matrix Quadrant Selection Dropdown */}
                  {isMatrixMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl z-30 p-2 animate-in fade-in zoom-in-95 duration-150">
                      <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase px-2 py-1 mb-1">
                        Phân loại Ma trận Eisenhower
                      </div>
                      {MATRIX_OPTIONS.map((opt) => {
                        const optPriority = PRIORITY_MAP[opt.id];
                        const isSelected = editPriority === optPriority;

                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setEditPriority(optPriority);
                              setIsMatrixMenuOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs flex flex-col gap-0.5 transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-neutral-100 dark:bg-neutral-700 font-semibold"
                                : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-900 dark:text-white font-medium">
                                {opt.label}
                              </span>
                              {isSelected && (
                                <Check size={14} strokeWidth={2.5} className="text-emerald-500" />
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-400">
                              {opt.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
            </div>
          </div>

          {/* Detail Frame (Due Date, Estimation as Time) */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 mb-6 flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Chi tiết công việc
              </span>
              {selectedTask.isQuickAdd && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                  ⚡ Nguồn: Quick Add
                </span>
              )}
            </div>

            {/* Due Date */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400 font-medium">Due date</span>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Estimation as Time Duration */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400 font-medium">Estimation</span>
              <select
                value={editEstimatedMinutes}
                onChange={(e) => setEditEstimatedMinutes(parseInt(e.target.value) || 30)}
                className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer font-medium"
              >
                <option value={15}>15 phút</option>
                <option value={25}>25 phút (1 Pomo)</option>
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={50}>50 phút (2 Pomo)</option>
                <option value={60}>1 giờ</option>
                <option value={90}>1 giờ 30 phút</option>
                <option value={120}>2 giờ</option>
                <option value={180}>3 giờ</option>
              </select>
            </div>
          </div>

          {/* Subtask Section */}
          <div className="mb-8 flex flex-col gap-2 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Subtasks ({selectedTask.subtasks?.filter((s) => s.isCompleted).length || 0}/
              {selectedTask.subtasks?.length || 0})
            </span>

            {/* Subtask Button Frame */}
            {!isAddingSubtaskInput ? (
              <button
                type="button"
                onClick={() => setIsAddingSubtaskInput(true)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-100/50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 rounded-xl text-left cursor-pointer transition-all group mb-2"
              >
                <span className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center text-xs font-bold shrink-0 group-hover:scale-105 transition-transform">
                  <Plus size={13} strokeWidth={2.2} />
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
                  Thêm subtask
                </span>
              </button>
            ) : (
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mb-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-transparent border border-neutral-900 dark:border-white rounded-xl">
                  <span className="text-neutral-500">
                    <Plus size={13} strokeWidth={2.2} />
                  </span>
                  <input
                    type="text"
                    autoFocus
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    placeholder="Nhập tên subtask..."
                    className="flex-1 text-xs bg-transparent focus:outline-none text-neutral-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSubtaskInput(false);
                      setNewSubtaskInput("");
                    }}
                    className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    Hủy
                  </button>
                </div>
                <button
                  type="submit"
                  className="px-2.5 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  Lưu
                </button>
              </form>
            )}

            {/* Subtask list */}
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-40">
              {selectedTask.subtasks?.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => toggleSubtask(selectedTask.id, sub.id)}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-50/30 dark:bg-neutral-800/30 border border-neutral-200/50 dark:border-neutral-700/50 cursor-pointer text-xs group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                        sub.isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-neutral-400"
                      }`}
                    >
                      {sub.isCompleted && <Check size={10} strokeWidth={2.5} />}
                    </span>
                    <span
                      className={`truncate ${
                        sub.isCompleted ? "line-through text-neutral-400" : ""
                      }`}
                    >
                      {sub.title}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSubtask(selectedTask.id, sub.id);
                    }}
                    className="text-neutral-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                    title="Xóa subtask"
                    aria-label="Xóa subtask"
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Buttons: SAVE, CLOSE & DELETE */}
          <div className="flex items-center gap-2.5 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 mt-auto pointer-events-auto">
            <button
              onClick={handleSaveDetail}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Check size={14} strokeWidth={2.5} />
              <span>{isSaving ? "Đang lưu..." : "Save"}</span>
            </button>
            <button
              onClick={handleCloseDetail}
              className="py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold uppercase tracking-wider active:scale-98 transition-all cursor-pointer"
              title="Đóng panel chi tiết"
            >
              Đóng
            </button>
            <button
              onClick={() => handleDeleteTask(selectedTask.id)}
              className="py-2.5 px-3 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold uppercase tracking-wider active:scale-98 transition-all cursor-pointer flex items-center justify-center"
              title="Xóa công việc này"
              aria-label="Xóa công việc"
            >
              <Trash2 size={15} strokeWidth={1.75} />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
