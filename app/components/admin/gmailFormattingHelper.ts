export const DEFAULT_ADMIN_SIGNATURE = "\n\nTrân trọng,\nBan Quản trị Pomo-do\nadmin@pomo-do.com";

export function applyTextFormat(
  content: string,
  type: "bold" | "italic" | "underline" | "strike" | "quote" | "ol" | "ul" | "clear" | "h1" | "h2",
  start: number,
  end: number
): { text: string; newCursorEnd: number } {
  const selected = content.slice(start, end) || "văn bản";
  let formatted = selected;

  if (type === "bold") formatted = `**${selected}**`;
  else if (type === "italic") formatted = `*${selected}*`;
  else if (type === "underline") formatted = `<u>${selected}</u>`;
  else if (type === "strike") formatted = `~~${selected}~~`;
  else if (type === "quote") formatted = `\n> ${selected}\n`;
  else if (type === "ul") formatted = `\n• ${selected}\n`;
  else if (type === "ol") formatted = `\n1. ${selected}\n`;
  else if (type === "h1") formatted = `\n# ${selected}\n`;
  else if (type === "h2") formatted = `\n## ${selected}\n`;
  else if (type === "clear") {
    formatted = selected.replace(/[*_~`>#]/g, "").replace(/<\/?u>/g, "");
  }

  const next = content.slice(0, start) + formatted + content.slice(end);
  return {
    text: next,
    newCursorEnd: start + formatted.length,
  };
}

// Chuyển đổi cú pháp markdown soạn thảo thành HTML an toàn hiển thị trong tab Xem trước (Preview)
export function renderMarkdownToSafePreviewHtml(rawText: string): string {
  if (!rawText || !rawText.trim()) return "<span class='text-neutral-400 italic'>Chưa có nội dung để xem trước...</span>";

  // 1. Escape HTML cơ bản để chống XSS
  let html = rawText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // 2. Chuyển đổi # H1, ## H2
  html = html.replace(/^#\s+(.+)$/gm, "<h2 class='text-base font-bold text-neutral-900 dark:text-white mt-3 mb-1'>$1</h2>");
  html = html.replace(/^##\s+(.+)$/gm, "<h3 class='text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-2 mb-1'>$1</h3>");

  // 3. Blockquote
  html = html.replace(
    /^&gt;\s+(.+)$/gm,
    "<blockquote class='border-l-2 border-neutral-300 dark:border-neutral-600 pl-3 py-0.5 text-neutral-600 dark:text-neutral-400 italic my-1.5'>$1</blockquote>"
  );

  // 4. In đậm
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong class='font-bold text-neutral-900 dark:text-white'>$1</strong>");

  // 5. Gạch ngang
  html = html.replace(/~~(.+?)~~/g, "<del class='line-through opacity-70'>$1</del>");

  // 6. In nghiêng
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, "<em class='italic'>$1</em>");

  // 7. Khôi phục thẻ <u> sau escape
  html = html.replace(/&lt;u&gt;/g, "<u class='underline'>").replace(/&lt;\/u&gt;/g, "</u>");

  // 8. Chuyển đổi xuống dòng
  html = html.replace(/\r\n/g, "<br/>").replace(/\n/g, "<br/>");

  return html;
}
