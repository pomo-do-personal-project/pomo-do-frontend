"use client";

import React, { useMemo } from "react";
import { TaskDto, TagDto, TaskStatus } from "../../types/api";
import { useTranslation } from "../../stores/useLanguageStore";
import { Tag as TagIcon, Layers, CheckCircle2 } from "lucide-react";

interface TaskTagsDistributionCardProps {
  tasks: TaskDto[];
  tags: TagDto[];
}

interface TagStatItem {
  id: string;
  name: string;
  colorHex: string;
  total: number;
  completed: number;
  percent: number;
}

export function TaskTagsDistributionCard({ tasks, tags }: TaskTagsDistributionCardProps) {
  const { t } = useTranslation();

  const tagStats = useMemo<TagStatItem[]>(() => {
    const list: TagStatItem[] = [];

    // Thống kê theo từng Tag đã tạo
    tags.forEach((tag) => {
      const tagTasks = tasks.filter((task) => task.tags && task.tags.some((tg) => tg.id === tag.id));
      if (tagTasks.length > 0) {
        const completed = tagTasks.filter((task) => task.status === TaskStatus.Completed).length;
        list.push({
          id: tag.id,
          name: tag.name,
          colorHex: tag.colorHex || "#10b981",
          total: tagTasks.length,
          completed,
          percent: Math.round((completed / tagTasks.length) * 100),
        });
      }
    });

    // Thống kê nhóm việc chưa gắn thẻ
    const untagged = tasks.filter((task) => !task.tags || task.tags.length === 0);
    if (untagged.length > 0) {
      const completed = untagged.filter((task) => task.status === TaskStatus.Completed).length;
      list.push({
        id: "untagged",
        name: t.statistics.noTagsTasks,
        colorHex: "#94a3b8",
        total: untagged.length,
        completed,
        percent: Math.round((completed / untagged.length) * 100),
      });
    }

    return list.sort((a, b) => b.total - a.total);
  }, [tasks, tags, t.statistics.noTagsTasks]);

  return (
    <section className="w-full bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 p-6 md:p-8 shadow-sm transition-colors mb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <TagIcon size={18} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              {t.statistics.taskTagsTitle}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t.statistics.taskTagsSubtitle}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
          {tagStats.length} danh mục
        </span>
      </div>

      {/* Tags List */}
      {tagStats.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
          Chưa có thẻ phân loại nào được sử dụng. Hãy gán thẻ cho công việc để theo dõi chi tiết!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tagStats.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.colorHex }}
                  />
                  <span className="font-bold text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 truncate">
                    #{item.name}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300 font-mono">
                    {item.total} việc
                  </span>
                </div>

                <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white shrink-0 ml-2">
                  {item.completed}/{item.total} ({item.percent}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mt-1">
                <div
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.colorHex,
                  }}
                  className="h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
