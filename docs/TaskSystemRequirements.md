# Task System Requirements

## 1. Backend Database Schema

### Task Model
```javascript
const TaskSchema = new mongoose.Schema({
  quit_plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitPlan', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage' }, // Optional, tasks có thể thuộc về stage cụ thể
  
  title: { type: String, required: true },
  description: { type: String, required: true },
  task_type: { 
    type: String, 
    enum: ['daily', 'weekly', 'milestone', 'health_check', 'habit_building'], 
    required: true 
  },
  
  // Scheduling
  due_date: { type: Date },
  recurring: { type: Boolean, default: false },
  recurrence_pattern: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly'],
    required: function() { return this.recurring; }
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'skipped', 'overdue'], 
    default: 'pending' 
  },
  completed_at: { type: Date },
  
  // Priority & Progress
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  progress_percentage: { type: Number, default: 0, min: 0, max: 100 },
  
  // Rewards
  points_reward: { type: Number, default: 0 },
  
  // Auto-generated tasks
  is_auto_generated: { type: Boolean, default: false },
  template_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskTemplate' },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});
```

### TaskTemplate Model (for auto-generation)
```javascript
const TaskTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  task_type: { type: String, enum: ['daily', 'weekly', 'milestone', 'health_check', 'habit_building'] },
  
  // When to trigger this task
  trigger_condition: {
    days_since_start: Number, // Sau bao nhiêu ngày từ khi bắt đầu
    stage_number: Number,     // Ở stage nào
    progress_percentage: Number, // Khi đạt % progress nào đó
  },
  
  // Default values
  default_priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  default_points: { type: Number, default: 10 },
  recurring: { type: Boolean, default: false },
  recurrence_pattern: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});
```

## 2. Backend API Endpoints

### Task Management APIs
```javascript
// GET /api/tasks/user/:userId - Lấy tất cả tasks của user
// GET /api/tasks/user/:userId/upcoming - Lấy tasks sắp tới
// GET /api/tasks/user/:userId/overdue - Lấy tasks quá hạn
// POST /api/tasks - Tạo task mới (manual)
// PUT /api/tasks/:taskId - Cập nhật task
// PUT /api/tasks/:taskId/complete - Đánh dấu hoàn thành
// PUT /api/tasks/:taskId/skip - Bỏ qua task
// DELETE /api/tasks/:taskId - Xóa task

// Task Generation APIs
// POST /api/tasks/generate/:quitPlanId - Tự động tạo tasks cho quit plan
// POST /api/tasks/generate/daily/:userId - Tạo daily tasks
// GET /api/task-templates - Lấy danh sách templates
```

### Sample Task Templates
```javascript
const DEFAULT_TASK_TEMPLATES = [
  {
    name: "daily_progress_check",
    title: "Ghi nhận tiến trình hôm nay",
    description: "Cập nhật số điếu thuốc đã hút và cảm giác sức khỏe",
    task_type: "daily",
    trigger_condition: { days_since_start: 0 },
    recurring: true,
    recurrence_pattern: "daily",
    default_points: 5
  },
  {
    name: "drink_water",
    title: "Uống đủ nước",
    description: "Uống ít nhất 8 ly nước để thải độc nicotine",
    task_type: "daily",
    trigger_condition: { days_since_start: 0 },
    recurring: true,
    recurrence_pattern: "daily",
    default_points: 3
  },
  {
    name: "deep_breathing",
    title: "Thực hiện bài tập thở",
    description: "Thở sâu 10 lần khi cảm thấy thèm thuốc",
    task_type: "daily",
    trigger_condition: { days_since_start: 1 },
    recurring: true,
    recurrence_pattern: "daily",
    default_points: 5
  },
  {
    name: "week_1_milestone",
    title: "Hoàn thành tuần đầu tiên",
    description: "Chúc mừng bạn đã hoàn thành 7 ngày không thuốc!",
    task_type: "milestone",
    trigger_condition: { days_since_start: 7 },
    default_points: 50
  },
  {
    name: "health_checkup",
    title: "Đánh giá sức khỏe",
    description: "Ghi nhận những thay đổi tích cực về sức khỏe",
    task_type: "health_check",
    trigger_condition: { days_since_start: 3 },
    recurring: true,
    recurrence_pattern: "weekly",
    default_points: 15
  }
];
```

## 3. Backend Task Generation Logic

### Controller: generateTasksForQuitPlan
```javascript
exports.generateTasksForQuitPlan = async (req, res) => {
  try {
    const { quitPlanId } = req.params;
    const quitPlan = await QuitPlan.findById(quitPlanId);
    
    if (!quitPlan) {
      return res.status(404).json({ message: "Quit plan not found" });
    }

    const startDate = new Date(quitPlan.start_date);
    const endDate = new Date(quitPlan.target_quit_date);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Lấy task templates
    const templates = await TaskTemplate.find({ is_active: true });
    const tasksToCreate = [];
    
    for (let day = 0; day <= totalDays; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      for (const template of templates) {
        if (shouldCreateTask(template, day, totalDays)) {
          const task = createTaskFromTemplate(template, quitPlan, currentDate, day);
          tasksToCreate.push(task);
        }
      }
    }
    
    const createdTasks = await Task.insertMany(tasksToCreate);
    
    res.status(201).json({
      message: `Generated ${createdTasks.length} tasks for quit plan`,
      tasks: createdTasks
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating tasks", error });
  }
};

function shouldCreateTask(template, currentDay, totalDays) {
  const condition = template.trigger_condition;
  
  // Check day-based trigger
  if (condition.days_since_start !== undefined) {
    if (template.recurring) {
      // For recurring tasks, check if it should repeat
      if (template.recurrence_pattern === 'daily') {
        return currentDay >= condition.days_since_start;
      } else if (template.recurrence_pattern === 'weekly') {
        return currentDay >= condition.days_since_start && 
               (currentDay - condition.days_since_start) % 7 === 0;
      }
    } else {
      // One-time task
      return currentDay === condition.days_since_start;
    }
  }
  
  return false;
}

function createTaskFromTemplate(template, quitPlan, dueDate, dayNumber) {
  return {
    quit_plan_id: quitPlan._id,
    user_id: quitPlan.user_id,
    title: template.title,
    description: template.description.replace('{{day}}', dayNumber + 1),
    task_type: template.task_type,
    due_date: dueDate,
    recurring: template.recurring,
    recurrence_pattern: template.recurrence_pattern,
    priority: template.default_priority,
    points_reward: template.default_points,
    is_auto_generated: true,
    template_id: template._id
  };
}
```

### Controller: getUpcomingTasks
```javascript
exports.getUpcomingTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const today = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + 7);
    
    const tasks = await Task.find({
      user_id: userId,
      status: { $in: ['pending', 'in_progress'] },
      due_date: { $gte: today, $lte: endOfWeek }
    })
    .populate('quit_plan_id', 'name')
    .populate('stage_id', 'title')
    .sort({ due_date: 1, priority: -1 })
    .limit(parseInt(limit));
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching upcoming tasks", error });
  }
};
```

## 4. Frontend Integration

### Cập nhật DashboardScreen để fetch real tasks
```javascript
// Trong DashboardScreen.js
const fetchUpcomingTasks = async (userId) => {
  try {
    const response = await axios.get(`/api/tasks/user/${userId}/upcoming`);
    setUpcomingTasks(response.data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // Fallback to mock data
    setUpcomingTasks(MOCK_TASKS);
  }
};
```

### Tạo TaskService
```javascript
// services/taskService.js
export const getUpcomingTasks = async (userId) => {
  const token = await getToken();
  const response = await axios.get(`${API_URL}/tasks/user/${userId}/upcoming`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const completeTask = async (taskId) => {
  const token = await getToken();
  const response = await axios.put(`${API_URL}/tasks/${taskId}/complete`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const generateTasksForPlan = async (quitPlanId) => {
  const token = await getToken();
  const response = await axios.post(`${API_URL}/tasks/generate/${quitPlanId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

## 5. Implementation Steps

### Backend Priority:
1. ✅ Tạo Task và TaskTemplate models
2. ✅ Seed default task templates
3. ✅ Implement task generation logic
4. ✅ Create task management APIs
5. ✅ Tích hợp vào quit plan creation flow

### Frontend Priority:
1. ✅ Cập nhật TaskService với real APIs
2. ✅ Update DashboardScreen để gọi APIs
3. ✅ Trigger task generation khi tạo quit plan
4. ✅ Add task management features (complete, skip, etc.)

## 6. Sample Flow

```javascript
// Khi user tạo quit plan thành công:
1. Backend tạo quit plan
2. Backend auto-generate tasks cho toàn bộ quit plan duration
3. Frontend nhận response với quit plan + initial tasks
4. Dashboard hiển thị upcoming tasks từ database
5. User có thể complete/skip tasks
6. System track progress và award points