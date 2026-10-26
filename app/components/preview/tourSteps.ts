import { DemoStep } from "./types";

interface TourActions {
  setIsTimerRunning: (val: boolean) => void;
  setIsCameraAiOn: (val: boolean) => void;
  setActiveScreen: (screen: DemoStep["screen"]) => void;
  setMockTasks: (tasks: string[]) => void;
  setMatrixTasksQ1: (tasks: string[]) => void;
  setDemoHeatmapTooltip: (val: boolean) => void;
}

export function createPreviewTourSteps(actions: TourActions): DemoStep[] {
  return [
    // SCENE 1: ĐỒNG HỒ POMODORO & CAMERA AI
    {
      screen: "timer",
      x: 53.5,
      y: 70,
      isClick: false,
      label: "Di chuyển đến nút Bắt đầu phiên",
    },
    {
      screen: "timer",
      x: 53.5,
      y: 70,
      isClick: true,
      label: "Bắt đầu đếm ngược Pomodoro (04:00)",
      action: () => actions.setIsTimerRunning(true),
    },
    {
      screen: "timer",
      x: 54.5,
      y: 82,
      isClick: false,
      label: "Di chuyển đến công tắc Camera AI Focus",
    },
    {
      screen: "timer",
      x: 54.5,
      y: 82,
      isClick: true,
      label: "Kích hoạt Trợ lý Camera AI Focus",
      action: () => actions.setIsCameraAiOn(true),
    },
    {
      screen: "timer",
      x: 3.5,
      y: 21,
      isClick: false,
      label: "Mở menu: Danh sách nhiệm vụ Today",
    },
    {
      screen: "task",
      x: 3.5,
      y: 21,
      isClick: true,
      label: "Đã mở danh sách nhiệm vụ Today",
      action: () => actions.setActiveScreen("task"),
    },

    // SCENE 2: NHIỆM VỤ TODAY
    {
      screen: "task",
      x: 50,
      y: 27,
      isClick: false,
      label: "Bấm ô thêm công việc cần làm",
    },
    {
      screen: "task",
      x: 50,
      y: 27,
      isClick: true,
      label: "Ghi nhanh: 'Hoàn thiện đồ án MVP'",
      action: () => actions.setMockTasks(["Hoàn thiện đồ án MVP Pomo-Do"]),
    },
    {
      screen: "task",
      x: 3.5,
      y: 28,
      isClick: false,
      label: "Mở menu: Ma trận Eisenhower 4 ô",
    },
    {
      screen: "matrix",
      x: 3.5,
      y: 28,
      isClick: true,
      label: "Đã mở không gian Ma trận Eisenhower",
      action: () => actions.setActiveScreen("matrix"),
    },

    // SCENE 3: MA TRẬN EISENHOWER 4 Ô
    {
      screen: "matrix",
      x: 27,
      y: 36,
      isClick: false,
      label: "Kiểm tra tiến độ công việc tại Ô 1: Làm ngay",
    },
    {
      screen: "matrix",
      x: 27,
      y: 36,
      isClick: true,
      label: "Đã tích chọn hoàn thành nhiệm vụ Q1",
      action: () => actions.setMatrixTasksQ1(["Task (Đã xong)"]),
    },
    {
      screen: "matrix",
      x: 3.5,
      y: 35,
      isClick: false,
      label: "Mở menu: Thống kê & Bản đồ nhiệt",
    },
    {
      screen: "stat-focus",
      x: 3.5,
      y: 35,
      isClick: true,
      label: "Đã mở Thống kê Focus & Heatmap 7x24",
      action: () => actions.setActiveScreen("stat-focus"),
    },

    // SCENE 4: THỐNG KÊ FOCUS & HEATMAP 7X24
    {
      screen: "stat-focus",
      x: 77,
      y: 77,
      isClick: false,
      label: "Rà soát khung giờ vàng trên Bản đồ nhiệt Heatmap",
    },
    {
      screen: "stat-focus",
      x: 77,
      y: 77,
      isClick: true,
      label: "Khung giờ vàng: Thứ 5 lúc 19:00 (Hạng S)",
      action: () => actions.setDemoHeatmapTooltip(true),
    },
    {
      screen: "stat-focus",
      x: 55,
      y: 13,
      isClick: false,
      label: "Chuyển sang tab phân tích nhiệm vụ",
    },
    {
      screen: "stat-task",
      x: 55,
      y: 13,
      isClick: true,
      label: "Đã mở Phân bổ Ma trận & Tiến độ Hoàn thành",
      action: () => {
        actions.setDemoHeatmapTooltip(false);
        actions.setActiveScreen("stat-task");
      },
    },

    // SCENE 5: THỐNG KÊ TASK & MA TRẬN
    {
      screen: "stat-task",
      x: 82,
      y: 38,
      isClick: false,
      label: "Kiểm tra biểu đồ tỷ lệ hoàn thành nhiệm vụ",
    },
    {
      screen: "stat-task",
      x: 82,
      y: 38,
      isClick: true,
      label: "Tiến độ công việc đạt 100% (1/1 đã xong)",
    },
    {
      screen: "stat-task",
      x: 3.5,
      y: 14,
      isClick: false,
      label: "Quay về màn hình Đồng hồ Pomodoro chính",
    },
    {
      screen: "timer",
      x: 3.5,
      y: 14,
      isClick: true,
      label: "Tiếp tục chu kỳ tập trung sâu",
      action: () => {
        actions.setActiveScreen("timer");
        actions.setMatrixTasksQ1(["Task"]);
      },
    },
  ];
}
