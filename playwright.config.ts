import { defineConfig, devices } from "@playwright/test";

/**
 * Cấu hình Playwright tự động quay Video chuẩn 1080p Full HD
 * Chế độ slowMo giúp chuyển động mượt mà, trực quan như người thật thao tác.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 180 * 1000, // 3 phút cho kịch bản quay toàn diện
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: false,
  workers: 1, // Chạy tuần tự 1 trình duyệt để quay video liền mạch
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    viewport: { width: 1920, height: 1080 },
    video: {
      mode: "on",
      size: { width: 1920, height: 1080 },
    },
    trace: "off",
    screenshot: "only-on-failure",
    launchOptions: {
      headless: false, // Mở cửa sổ thật để người dùng có thể xem trực tiếp quá trình quay
      slowMo: 650,    // Giảm tốc độ mỗi thao tác 650ms để video tự nhiên, dễ theo dõi
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
