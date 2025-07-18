// utils/helpers.js

// Format date to Vietnamese locale
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

// Format date with time
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
};

// Calculate money savings based on smoking status and days
export const calculateSavings = (smokingStatus, daysSinceStart) => {
  if (!smokingStatus || !daysSinceStart) return 0;
  const packsPerDay = smokingStatus.cigarettes_per_day / 20;
  const dailyCost = packsPerDay * smokingStatus.cost_per_pack;
  return dailyCost * daysSinceStart;
};

// Calculate cigarettes avoided
export const calculateCigarettesAvoided = (smokingStatus, daysSinceStart) => {
  if (!smokingStatus || !daysSinceStart) return 0;
  return smokingStatus.cigarettes_per_day * daysSinceStart;
};

// Calculate days between two dates
export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Calculate progress percentage
export const calculateProgressPercentage = (currentDay, totalDays) => {
  if (!totalDays || totalDays === 0) return 0;
  const percentage = (currentDay / totalDays) * 100;
  return Math.min(Math.round(percentage), 100);
};

// Format currency in Vietnamese Dong
export const formatCurrency = (amount) => {
  if (!amount) return '0';
  return amount.toLocaleString('vi-VN') + ' VNĐ';
};

// Get time-based greeting
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Vietnamese format)
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  return phoneRegex.test(phone);
};

// Get motivation message based on days quit
export const getMotivationMessage = (daysQuit) => {
  if (daysQuit === 0) {
    return "Hôm nay là ngày đầu tiên! Bạn đã bắt đầu hành trình tuyệt vời rồi! 💪";
  } else if (daysQuit === 1) {
    return "Ngày thứ hai! Bạn đã vượt qua ngày đầu tiên khó khăn nhất! 🎉";
  } else if (daysQuit < 7) {
    return `${daysQuit} ngày! Cơ thể bạn đang bắt đầu thải độc nicotine. Hãy kiên trì! 🌟`;
  } else if (daysQuit < 30) {
    return `${daysQuit} ngày! Tuyệt vời! Vị giác và khứu giác đang được cải thiện! 👃`;
  } else if (daysQuit < 90) {
    return `${daysQuit} ngày! Lưu thông máu đã cải thiện đáng kể! Bạn thật tuyệt vời! ❤️`;
  } else {
    return `${daysQuit} ngày! Bạn là một chiến binh thực thụ! Sức khỏe phổi đang hồi phục mạnh mẽ! 🫁`;
  }
};

// Get health improvement timeline
export const getHealthImprovementTimeline = (daysQuit) => {
  const improvements = [];
  
  if (daysQuit >= 1) {
    improvements.push({
      title: "Cải thiện lưu thông máu",
      description: "Huyết áp và nhịp tim bắt đầu trở về bình thường",
      timeline: "20 phút",
      achieved: true
    });
  }
  
  if (daysQuit >= 1) {
    improvements.push({
      title: "Giảm nguy cơ đau tim",
      description: "Nguy cơ đau tim bắt đầu giảm",
      timeline: "12 giờ",
      achieved: true
    });
  }
  
  if (daysQuit >= 3) {
    improvements.push({
      title: "Cải thiện vị giác và khứu giác",
      description: "Vị giác và khứu giác bắt đầu được cải thiện",
      timeline: "2-3 ngày",
      achieved: true
    });
  }
  
  if (daysQuit >= 14) {
    improvements.push({
      title: "Cải thiện lưu thông và chức năng phổi",
      description: "Lưu thông máu được cải thiện, chức năng phổi tăng 30%",
      timeline: "2-12 tuần",
      achieved: daysQuit >= 14
    });
  }
  
  if (daysQuit >= 90) {
    improvements.push({
      title: "Giảm nguy cơ nhiễm trùng",
      description: "Giảm ho, khò khè và các vấn đề hô hấp",
      timeline: "1-9 tháng",
      achieved: daysQuit >= 90
    });
  }
  
  return improvements;
};

// Calculate streak (consecutive days without smoking)
export const calculateStreak = (progressRecords) => {
  if (!progressRecords || progressRecords.length === 0) return 0;
  
  // Sort by date descending
  const sorted = progressRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let streak = 0;
  for (const record of sorted) {
    if (record.cigarettes_smoked === 0) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// Get badge based on achievements
export const getBadgeForAchievement = (type, value) => {
  const badges = {
    days: [
      { threshold: 1, badge: "🌱", title: "Mầm xanh", description: "Ngày đầu tiên" },
      { threshold: 7, badge: "🌿", title: "Chồi non", description: "1 tuần không thuốc" },
      { threshold: 30, badge: "🌳", title: "Cây non", description: "1 tháng không thuốc" },
      { threshold: 90, badge: "🏆", title: "Chiến binh", description: "3 tháng không thuốc" },
      { threshold: 365, badge: "👑", title: "Bậc thầy", description: "1 năm không thuốc" }
    ],
    money: [
      { threshold: 100000, badge: "💰", title: "Tiết kiệm đầu tiên", description: "Tiết kiệm 100K" },
      { threshold: 500000, badge: "💎", title: "Kho báu nhỏ", description: "Tiết kiệm 500K" },
      { threshold: 1000000, badge: "🏦", title: "Triệu phú nhỏ", description: "Tiết kiệm 1M" },
      { threshold: 5000000, badge: "💸", title: "Đại gia", description: "Tiết kiệm 5M" }
    ]
  };
  
  const relevantBadges = badges[type] || [];
  const earnedBadges = relevantBadges.filter(badge => value >= badge.threshold);
  
  return earnedBadges.length > 0 ? earnedBadges[earnedBadges.length - 1] : null;
};

// Debounce function for search/input
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Check if date is today
export const isToday = (dateString) => {
  const today = new Date();
  const date = new Date(dateString);
  return date.toDateString() === today.toDateString();
};

// Get days until target date
export const getDaysUntilTarget = (targetDate) => {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};