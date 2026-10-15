"use client";

import { useMemo } from "react";
import { TaskDto } from "../../../types/api";
import { TaskCategory } from "../types";

export function useFilteredTasks(
  tasks: TaskDto[],
  currentCategory: TaskCategory,
  selectedTag: string
) {
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((t) => {
      t.tags?.forEach((tg) => tagSet.add(tg.name));
    });
    return Array.from(tagSet);
  }, [tasks]);

  const categoryCounts = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return {
      Today: tasks.filter((t) => !t.isQuickAdd && (!t.dueDate || t.dueDate.startsWith(todayStr))).length,
      Upcoming: tasks.filter((t) => !t.isQuickAdd && t.dueDate && !t.dueDate.startsWith(todayStr)).length,
      QuickAdd: tasks.filter((t) => t.isQuickAdd).length,
      Calendar: tasks.length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return tasks.filter((t) => {
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

      if (selectedTag !== "All") {
        if (!t.tags?.some((tg) => tg.name === selectedTag)) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, currentCategory, selectedTag]);

  return { allTags, categoryCounts, filteredTasks };
}
