"use client";

import React, { useState, useRef, useEffect } from "react";

export type MatrixQuadrant =
  | "urgent-important" // Q1: Làm ngay (Do first)
  | "not-urgent-important" // Q2: Lên lịch (Schedule)
  | "urgent-not-important" // Q3: Ủy quyền / Cần gấp (Delegate)
  | "not-urgent-not-important"; // Q4: Loại bỏ / Việc phụ (Don't do)

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  category: "Upcoming" | "Today" | "Calendar";
  list: string;
  dueDate: string;
  estimatedMinutes: number; // Thời gian ước tính tính theo phút (15m, 30m, 1h,...)
  description: string;
  subtasks: { id: string; title: string; completed: boolean }[];
  matrixQuadrant?: MatrixQuadrant;
}

const MATRIX_OPTIONS: { id: MatrixQuadrant; label: string; color: string; desc: string }[] = [
  { id: "urgent-important", label: "Khẩn cấp & Quan trọng", color: "bg-rose-500 text-white", desc: "Làm ngay (Do first)" },
  { id: "not-urgent-important", label: "Không khẩn & Quan trọng", color: "bg-blue-500 text-white", desc: "Lên lịch (Schedule)" },
  { id: "urgent-not-important", label: "Khẩn cấp & Không quan trọng", color: "bg-amber-500 text-white", desc: "Ủy quyền (Delegate)" },
  { id: "not-urgent-not-important", label: "Không khẩn & Không quan trọng", color: "bg-neutral-500 text-white", desc: "Loại bỏ / Thư giãn" },
];

export function TaskPage() {
  const [currentCategory, setCurrentCategory] = useState<"Upcoming" | "Today" | "Calendar">("Today");
  const [selectedList, setSelectedList] = useState<string>("Personal");
  const [lists, setLists] = useState<string[]>(["Personal"]);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "1",
      title: "Thiết kế giao diện Task Management",
      completed: false,
      category: "Today",
      list: "Personal",
      dueDate: "2026-10-25",
      estimatedMinutes: 60,
      description: "Tạo component quản lý công việc và panel chi tiết task",
      subtasks: [
        { id: "s1", title: "Phác thảo layout 3 cột", completed: true },
        { id: "s2", title: "Gắn tính năng thêm và xóa task", completed: false },
      ],
      matrixQuadrant: "urgent-important",
    },
    {
      id: "2",
      title: "Hoàn thiện Pomodoro Timer logic",
      completed: true,
      category: "Today",
      list: "Personal",
      dueDate: "2026-10-25",
      estimatedMinutes: 45,
      description: "Kiểm tra lại bộ đếm giây và chuông báo",
      subtasks: [],
      matrixQuadrant: "not-urgent-important",
    },
  ]);

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isAddingTaskInput, setIsAddingTaskInput] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [isAddingSubtaskInput, setIsAddingSubtaskInput] = useState(false);
  const [newSubtaskInput, setNewSubtaskInput] = useState("");
  const [isMatrixMenuOpen, setIsMatrixMenuOpen] = useState(false);

  const matrixDropdownRef = useRef<HTMLDivElement>(null);

  // Close matrix popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (matrixDropdownRef.current && !matrixDropdownRef.current.contains(event.target as Node)) {
        setIsMatrixMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add Task inline from "+ Add new task"
  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newTaskInput.trim(),
      completed: false,
      category: currentCategory,
      list: selectedList,
      dueDate: new Date().toISOString().split("T")[0],
      estimatedMinutes: 30, // Mặc định 30 phút
      description: "",
      subtasks: [],
      matrixQuadrant: "urgent-important",
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskInput("");
    setIsAddingTaskInput(false);
    setSelectedTask(newTask); // Open detail panel for the new task
  };

  const toggleTaskCompleted = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    if (selectedTask?.id === id) {
      setSelectedTask((prev) => (prev ? { ...prev, completed: !prev.completed } : null));
    }
  };

  const handleSaveDetail = () => {
    if (!selectedTask) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTask.id ? selectedTask : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskInput.trim() || !selectedTask) return;
    const newSub = {
      id: Date.now().toString(),
      title: newSubtaskInput.trim(),
      completed: false,
    };
    const updated = {
      ...selectedTask,
      subtasks: [...selectedTask.subtasks, newSub],
    };
    setSelectedTask(updated);
    setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updated : t)));
    setNewSubtaskInput("");
    setIsAddingSubtaskInput(false);
  };

  const toggleSubtask = (subId: string) => {
    if (!selectedTask) return;
    const updated = {
      ...selectedTask,
      subtasks: selectedTask.subtasks.map((s) =>
        s.id === subId ? { ...s, completed: !s.completed } : s
      ),
    };
    setSelectedTask(updated);
    setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updated : t)));
  };

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    if (!lists.includes(newListName.trim())) {
      setLists((prev) => [...prev, newListName.trim()]);
      setSelectedList(newListName.trim());
    }
    setNewListName("");
    setIsAddingList(false);
  };

  // Filter tasks for center column
  const filteredTasks = tasks.filter(
    (t) => t.category === currentCategory && (selectedList ? t.list === selectedList : true)
  );

  const getMatrixBadgeColor = (quadrant?: MatrixQuadrant) => {
    switch (quadrant) {
      case "urgent-important":
        return "text-rose-600 dark:text-rose-400";
      case "not-urgent-important":
        return "text-blue-600 dark:text-blue-400";
      case "urgent-not-important":
        return "text-amber-600 dark:text-amber-400";
      default:
        return "text-neutral-400";
    }
  };

  return (
    <div className="flex-1 flex w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-transparent transition-colors">
      {/* 1. Left Sub-Sidebar (Category & Custom Lists) */}
      <aside className="w-56 border-r border-neutral-200/80 dark:border-neutral-800/80 flex flex-col p-4 shrink-0 bg-transparent">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3 px-2">
          Task
        </h3>
        <nav className="flex flex-col gap-1 mb-6">
          {(["Upcoming", "Today", "Calendar"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCurrentCategory(cat)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                currentCategory === cat
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <span>{cat === "Upcoming" ? "⏩" : cat === "Today" ? "📅" : "🗓️"}</span>
              <span>{cat}</span>
            </button>
          ))}
        </nav>

        {/* Custom Lists */}
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            List
          </h3>
          <button
            onClick={() => setIsAddingList((p) => !p)}
            title="Add List"
            className="text-xs font-bold text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
          >
            +
          </button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto flex-1">
          {lists.map((lst) => (
            <button
              key={lst}
              onClick={() => setSelectedList(lst)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                selectedList === lst
                  ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
              <span className="truncate">{lst}</span>
            </button>
          ))}

          {isAddingList && (
            <form onSubmit={handleAddList} className="mt-2 px-1">
              <input
                type="text"
                autoFocus
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Tên danh mục..."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </form>
          )}
        </nav>
      </aside>

      {/* 2. Middle Main Area: Task List for Selected Category */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6">
          {currentCategory}
        </h1>

        {/* "+ Add new task" Button Frame */}
        {!isAddingTaskInput ? (
          <button
            type="button"
            onClick={() => setIsAddingTaskInput(true)}
            className="w-full mb-6 flex items-center gap-3 px-4 py-3 bg-neutral-100/50 hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-900 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 rounded-2xl text-left cursor-pointer transition-all group shadow-2xs"
          >
            <span className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center text-base font-bold shrink-0 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <span className="text-sm sm:text-base font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
              Add new task
            </span>
          </button>
        ) : (
          <form onSubmit={handleAddNewTask} className="mb-6">
            <div className="flex items-center gap-3 px-4 py-3 bg-transparent border-2 border-neutral-900 dark:border-white rounded-2xl shadow-2xs transition-colors">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <input
                type="text"
                autoFocus
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Nhập tên công việc mới rồi nhấn Enter..."
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
              Chưa có công việc nào trong mục {currentCategory}. Hãy thêm task mới ở trên!
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
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
                      onClick={(e) => toggleTaskCompleted(task.id, e)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs transition-colors shrink-0 cursor-pointer ${
                        task.completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-neutral-400 dark:border-neutral-600 hover:border-neutral-600"
                      }`}
                    >
                      {task.completed && "✓"}
                    </button>

                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`text-sm sm:text-base truncate ${
                          task.completed
                            ? "line-through text-neutral-400 dark:text-neutral-500"
                            : "text-neutral-800 dark:text-neutral-200 font-medium"
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Small Matrix Indicator Dot */}
                      <span
                        className={`text-xs ${getMatrixBadgeColor(task.matrixQuadrant)}`}
                        title="Eisenhower Matrix Quadrant"
                      >
                        ●
                      </span>

                      {/* Estimated time tag */}
                      <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                        ⏱ {task.estimatedMinutes}m
                      </span>
                    </div>
                  </div>

                  {/* Arrow indicator pointing to detail panel */}
                  <span className="text-neutral-400 dark:text-neutral-500 font-mono text-base px-2">
                    &gt;
                  </span>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* 3. Right Task Detail Panel */}
      {selectedTask && (
        <aside className="w-96 border-l border-neutral-200/80 dark:border-neutral-800/80 bg-transparent flex flex-col p-6 overflow-y-auto shrink-0 transition-all">
          {/* Header: Name new task & Matrix Selector Button (Flag) */}
          <div className="relative pb-3 border-b-2 border-neutral-300 dark:border-neutral-700 mb-6">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={selectedTask.title}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, title: e.target.value })
                }
                className="text-lg font-bold text-neutral-900 dark:text-white bg-transparent focus:outline-none flex-1 truncate mr-2"
                placeholder="Name new task"
              />

              {/* Matrix Flag Dropdown Trigger */}
              <div className="relative" ref={matrixDropdownRef}>
                <button
                  onClick={() => setIsMatrixMenuOpen((prev) => !prev)}
                  title="Chọn dạng Ma trận Eisenhower (Matrix Quadrant)"
                  className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className={`text-lg ${getMatrixBadgeColor(selectedTask.matrixQuadrant)}`}>
                    ⚑
                  </span>
                  <span className="text-[10px] text-neutral-400">▼</span>
                </button>

                {/* Matrix Quadrant Selection Dropdown */}
                {isMatrixMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl z-30 p-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase px-2 py-1 mb-1">
                      Phân loại Ma trận Eisenhower
                    </div>
                    {MATRIX_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSelectedTask({
                            ...selectedTask,
                            matrixQuadrant: opt.id,
                          });
                          setIsMatrixMenuOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex flex-col gap-0.5 transition-colors cursor-pointer ${
                          selectedTask.matrixQuadrant === opt.id
                            ? "bg-neutral-100 dark:bg-neutral-700 font-semibold"
                            : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-900 dark:text-white font-medium">
                            {opt.label}
                          </span>
                          {selectedTask.matrixQuadrant === opt.id && (
                            <span className="text-emerald-500 font-bold">✓</span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-400">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detail Frame (List, Due Date, Estimation as Time) */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 mb-6 flex flex-col gap-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Detail
            </span>

            {/* List Selection */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400 font-medium">List</span>
              <select
                value={selectedTask.list}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, list: e.target.value })
                }
                className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
              >
                {lists.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400 font-medium">Due date</span>
              <input
                type="date"
                value={selectedTask.dueDate}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, dueDate: e.target.value })
                }
                className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Estimation as Time Duration (15m, 30m, 45m, 1h, 1.5h, 2h,...) */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400 font-medium">Estimation</span>
              <select
                value={selectedTask.estimatedMinutes}
                onChange={(e) =>
                  setSelectedTask({
                    ...selectedTask,
                    estimatedMinutes: parseInt(e.target.value) || 30,
                  })
                }
                className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer font-medium"
              >
                <option value={15}>15 phút</option>
                <option value={25}>25 phút (1 Pomo)</option>
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={60}>1 giờ</option>
                <option value={90}>1 giờ 30 phút</option>
                <option value={120}>2 giờ</option>
                <option value={180}>3 giờ</option>
                <option value={240}>4 giờ</option>
              </select>
            </div>
          </div>

          {/* Description Box */}
          <div className="mb-6 flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Description
            </span>
            <textarea
              rows={3}
              value={selectedTask.description}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, description: e.target.value })
              }
              placeholder="Thêm mô tả chi tiết cho công việc này..."
              className="w-full p-3 text-xs sm:text-sm bg-neutral-50/50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:border-neutral-500 transition-colors resize-none"
            />
          </div>

          {/* Subtask Section */}
          <div className="mb-8 flex flex-col gap-2 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Subtask ({selectedTask.subtasks.filter((s) => s.completed).length}/
              {selectedTask.subtasks.length})
            </span>

            {/* Subtask Button Frame */}
            {!isAddingSubtaskInput ? (
              <button
                type="button"
                onClick={() => setIsAddingSubtaskInput(true)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-100/50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 rounded-xl text-left cursor-pointer transition-all group mb-2"
              >
                <span className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center text-xs font-bold shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
                  Thêm subtask
                </span>
              </button>
            ) : (
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mb-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-transparent border border-neutral-900 dark:border-white rounded-xl">
                  <span className="text-neutral-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
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
              {selectedTask.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => toggleSubtask(sub.id)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50/30 dark:bg-neutral-800/30 border border-neutral-200/50 dark:border-neutral-700/50 cursor-pointer text-xs"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] border ${
                      sub.completed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-neutral-400"
                    }`}
                  >
                    {sub.completed && "✓"}
                  </span>
                  <span
                    className={`flex-1 truncate ${
                      sub.completed ? "line-through text-neutral-400" : ""
                    }`}
                  >
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Buttons: SAVE & DELETE */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 mt-auto">
            <button
              onClick={handleSaveDetail}
              className="flex-1 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-sm"
            >
              Save
            </button>
            <button
              onClick={() => handleDeleteTask(selectedTask.id)}
              className="flex-1 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold uppercase tracking-wider active:scale-98 transition-all cursor-pointer"
            >
              Delete
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
