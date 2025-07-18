// File này đã được loại bỏ để tránh trùng lặp
// Chức năng tạo kế hoạch đã được tích hợp vào PlanScreen thông qua QuitPlanForm modal
// 
// Flow mới:
// SmokingInfoScreen -> PlanScreen (auto open modal) -> Dashboard
//
// Thay vì:
// SmokingInfoScreen -> CreatePlanScreen -> Dashboard

console.warn('⚠️ CreatePlanScreen đã bị deprecated. Sử dụng QuitPlanForm trong PlanScreen thay thế.');

export default null;