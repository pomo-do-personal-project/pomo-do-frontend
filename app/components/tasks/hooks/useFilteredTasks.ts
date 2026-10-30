"use client";

import { useMemo } from "react";
import { TaskDto } from "../../../types/api";
import { TaskCategory } from "../types";
import { parseTaskDueDate, formatLocalDate } from "../../../utils/dateUtils";

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
    const todayStr = formatLocalDate();
    return {
      Today: tasks.filter((t) => {
        if (t.isQuickAdd) return false;
        if (!t.dueDate) return true;
        return parseTaskDueDate(t.dueDate).dateStr <= todayStr;
      }).length,
      Upcoming: tasks.filter((t) => {
        if (t.isQuickAdd) return false;
        if (!t.dueDate) return false;
        return parseTaskDueDate(t.dueDate).dateStr > todayStr;
      }).length,
      QuickAdd: tasks.filter((t) => t.isQuickAdd).length,
      Calendar: tasks.length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const todayStr = formatLocalDate();

    return tasks.filter((t) => {
      if (currentCategory === "QuickAdd") {
        if (!t.isQuickAdd) return false;
      } else if (currentCategory === "Today") {
        if (t.isQuickAdd) return false;
        if (t.dueDate && parseTaskDueDate(t.dueDate).dateStr > todayStr) {
          return false;
        }
      } else if (currentCategory === "Upcoming") {
        if (t.isQuickAdd) return false;
        if (!t.dueDate || parseTaskDueDate(t.dueDate).dateStr <= todayStr) {
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
