"use client";

import React, { useState } from "react";
import Image from "next/image";
import logoImg from "../logo.png";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeItem?: string;
  onSelectItem?: (id: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  abbr: string;
}

export function Sidebar({
  isOpen,
  onToggle,
  activeItem = "dashboard",
  onSelectItem,
}: SidebarProps) {

  const topItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard / Icon", abbr: "IC" },
    { id: "task", label: "Task List", abbr: "TK" },
    { id: "matrix", label: "Eisenhower Matrix", abbr: "MX" },
    { id: "statistic", label: "Statistics & Reports", abbr: "ST" },
  ];

  const bottomItems: NavItem[] = [
    { id: "info", label: "Account Info / Profile", abbr: "IF" },
    { id: "logout", label: "Logout", abbr: "LO" },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-r border-neutral-200/80 dark:border-neutral-800/80 select-none shadow-sm transition-[width] duration-300 ease-in-out ${
        isOpen ? "w-18 visible" : "w-0 overflow-hidden invisible border-none"
      }`}
    >
      {/* Top Header: Logo Image + Collapse Toggle on hover (h-14 match Top Header) */}
      <div className="h-14 w-16 flex items-center justify-center border-b border-neutral-200/60 dark:border-neutral-800/60 shrink-0 relative">
        <button
          onClick={onToggle}
          title="Collapse Sidebar"
          className="w-10 h-10 relative flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-85 active:scale-95 transition-all group"
        >
          <Image
            src={logoImg}
            alt="Pomo-do Logo"
            className="w-full h-full object-contain p-0.5 group-hover:opacity-20 transition-opacity duration-200"
            priority
          />
          {/* Subtle << collapse indicator that reveals on hover */}
          <span className="hidden group-hover:flex absolute inset-0 items-center justify-center font-mono text-xs font-black text-neutral-800 dark:text-neutral-100">
            &lt;&lt;
          </span>
        </button>
      </div>

      {/* Top Navigation Items (overflow-visible so tooltips pop out clearly) */}
      <div className="flex-1 py-4 w-18 flex flex-col items-center gap-2 overflow-visible">
        {topItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <div key={item.id} className="relative group flex justify-center">
              <button
                onClick={() => onSelectItem?.(item.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                <span className="text-xs font-bold tracking-wider">
                  {item.abbr}
                </span>
              </button>

              {/* Tooltip positioned outside of the sidebar */}
              <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap">
                {item.label}
                {/* Tooltip pointing arrow */}
                <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-4 border-transparent border-r-neutral-900 dark:border-r-neutral-100" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation Items (INFO & LOGOUT) */}
      <div className="py-3 w-18 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col items-center gap-2 overflow-visible shrink-0">
        {bottomItems.map((item) => {
          const isLogout = item.id === "logout";
          const isActive = activeItem === item.id;
          return (
            <div key={item.id} className="relative group flex justify-center">
              <button
                onClick={() => onSelectItem?.(item.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isLogout
                    ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    : isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                <span className="text-xs font-bold tracking-wider">
                  {item.abbr}
                </span>
              </button>

              {/* Tooltip outside */}
              <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap">
                {item.label}
                <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-4 border-transparent border-r-neutral-900 dark:border-r-neutral-100" />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
