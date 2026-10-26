import { test, expect } from "@playwright/test";

/**
 * 🎬 KỊCH BẢN QUAY VIDEO TỰ ĐỘNG - LUỒNG HAPPY CASE LIÊN THÔNG POMO-DO
 * Chạy tự động qua 6 phân cảnh lý tưởng chuẩn 1080p Full HD với slowMo mượt mà.
 */
test("Quay video Demo Luồng Happy Case Liên Thông Pomo-Do", async ({ page }) => {
  test.setTimeout(180_000);

  const pause = (ms: number) => page.waitForTimeout(ms);

  // ========================================================
  // PHÂN CẢNH 1: XÁC THỰC & ĐĂNG NHẬP HAPPY CASE
  // ========================================================
  console.log("▶️ Phân cảnh 1: Đăng nhập tài khoản User...");
  await page.goto("/vi");
  await pause(1500);

  // Mở modal đăng nhập từ sidebar
  const accountBtn = page.locator('button[aria-label="Sign in / Register"], button:has-text("Đăng nhập")').first();
  await accountBtn.click();
  await pause(800);

  // Điền thông tin usera
  await page.locator('input[type="email"]').fill("usera@pomodo.com");
  await pause(400);
  await page.locator('input[type="password"]').fill("UserA@1234");
  await pause(600);
  await page.locator('button:has-text("Đăng nhập")').click();
  await pause(2500);

  // ========================================================
  // PHÂN CẢNH 2: QUẢN LÝ CÔNG VIỆC & TASK DRAWER
  // ========================================================
  console.log("▶️ Phân cảnh 2: Tạo công việc & mở Task Drawer...");
  const taskNavBtn = page.locator('button[aria-label*="Nhiệm vụ"], button[aria-label*="Tasks"]').first();
  await taskNavBtn.click();
  await pause(1200);

  // Thêm task mới
  const addBtn = page.locator('button:has-text("+ Thêm công việc mới"), button:has-text("Thêm việc")').first();
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await pause(500);
  }
  const taskInput = page.locator('input[placeholder*="Nhập công việc"], input[placeholder*="Thêm việc"]').first();
  await taskInput.fill("Hoàn thiện báo cáo đồ án tốt nghiệp");
  await pause(600);
  await page.keyboard.press("Enter");
  await pause(1500);

  // Click vào task vừa tạo để mở Drawer chi tiết
  const createdTask = page.locator('text="Hoàn thiện báo cáo đồ án tốt nghiệp"').first();
  if (await createdTask.isVisible()) {
    await createdTask.click();
    await pause(1200);

    // Bấm liên thông sang Pomodoro từ thanh công cụ Drawer
    const startPomoBtn = page.locator('button:has-text("Bắt đầu Pomodoro"), button[title*="Pomodoro"]').first();
    if (await startPomoBtn.isVisible()) {
      await startPomoBtn.click();
      await pause(1500);
    }
  }

  // ========================================================
  // PHÂN CẢNH 3: MA TRẬN EISENHOWER & KÉO THẢ ĐIỀU PHỐI
  // ========================================================
  console.log("▶️ Phân cảnh 3: Điều phối trên Ma trận Eisenhower...");
  const matrixNavBtn = page.locator('button[aria-label*="Ma trận"], button[aria-label*="Matrix"]').first();
  await matrixNavBtn.click();
  await pause(1500);

  // Thêm task mới vào ô Schedule (Xanh dương)
  const scheduleAddBtn = page.locator('button[title*="Thêm việc vào ô này"]').nth(1);
  if (await scheduleAddBtn.isVisible()) {
    await scheduleAddBtn.click();
    await pause(400);
    const scheduleInput = page.locator('input[placeholder*="Nhập công việc mới"]').first();
    if (await scheduleInput.isVisible()) {
      await scheduleInput.fill("Ôn tập kiến thức Cloud & Docker");
      await page.keyboard.press("Enter");
      await pause(1500);
    }
  }

  // Đánh dấu hoàn thành 1 task
  const taskCheck = page.locator('button[title*="Hoàn thành"], input[type="checkbox"]').first();
  if (await taskCheck.isVisible()) {
    await taskCheck.click();
    await pause(1200);
  }

  // ========================================================
  // PHÂN CẢNH 4: TÙY BIẾN BẢNG MÀU CHỦ ĐỀ & HÌNH NỀN
  // ========================================================
  console.log("▶️ Phân cảnh 4: Tùy biến Bảng màu chủ đề...");
  const userMenuBtn = page.locator('button[aria-label*="User"]').first();
  await userMenuBtn.click();
  await pause(600);

  const settingsBtn = page.locator('button:has-text("Cài đặt"), button:has-text("Settings")').first();
  if (await settingsBtn.isVisible()) {
    await settingsBtn.click();
    await pause(1200);

    // Chuyển sang tab Giao diện & Ngôn ngữ
    const appearanceTab = page.locator('button:has-text("Giao diện"), button:has-text("Chủ đề")').first();
    if (await appearanceTab.isVisible()) {
      await appearanceTab.click();
      await pause(1000);

      // Chọn bảng màu Deep Ocean
      const paletteBtn = page.locator('button[title*="Deep Ocean"], button[title*="Đại dương"]').first();
      if (await paletteBtn.isVisible()) {
        await paletteBtn.click();
        await pause(1500);
      }
    }

    // Đóng Settings Modal bằng nút X góc trên bên phải
    const closeBtn = page.locator('button[aria-label="Đóng"], button[aria-label="Close"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await pause(1000);
    }
  }

  // ========================================================
  // PHÂN CẢNH 5: THỐNG KÊ & BẢN ĐỒ NHIỆT NĂNG SUẤT 7x24
  // ========================================================
  console.log("▶️ Phân cảnh 5: Phân tích Thống kê & Bản đồ nhiệt 7x24...");
  const statsNavBtn = page.locator('button[aria-label*="Thống kê"], button[aria-label*="Statistics"]').first();
  await statsNavBtn.click();
  await pause(2000);

  // Cuộn nhẹ xem 168 ô bản đồ nhiệt
  await page.mouse.wheel(0, 320);
  await pause(1800);

  // Chuyển sang Tab phân tích công việc
  const taskTabBtn = page.locator('button:has-text("Công việc"), button:has-text("Task")').first();
  if (await taskTabBtn.isVisible()) {
    await taskTabBtn.click();
    await pause(1800);
  }

  // ========================================================
  // PHÂN CẢNH 6: CỔNG QUẢN TRỊ ADMIN RBAC
  // ========================================================
  console.log("▶️ Phân cảnh 6: Cổng quản trị Admin...");
  // Đăng xuất
  await page.locator('button[aria-label*="User"]').first().click();
  await pause(600);
  const logoutBtn = page.locator('button:has-text("Đăng xuất"), button:has-text("Log out")').first();
  await logoutBtn.click();
  await pause(1500);

  // Đăng nhập Admin
  await accountBtn.click();
  await pause(600);
  await page.locator('input[type="email"]').fill("admin@pomodo.com");
  await pause(400);
  await page.locator('input[type="password"]').fill("Admin@1234");
  await pause(600);
  await page.locator('button:has-text("Đăng nhập")').click();
  await pause(2500);

  // Vào Dashboard Quản trị
  await page.goto("/vi/admin/dashboard");
  await pause(2200);

  // Chuyển sang trang Quản lý Người dùng
  await page.goto("/vi/admin/users");
  await pause(1800);

  // Tìm kiếm tài khoản userb
  const searchInput = page.locator('input[placeholder*="Tìm kiếm"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill("userb");
    await pause(1800);
  }

  console.log("✅ Đã hoàn tất kịch bản Happy Case liên thông!");
  await pause(1500);
});
