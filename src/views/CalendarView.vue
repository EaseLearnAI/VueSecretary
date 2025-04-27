<template>
  <BaseLayout title="日历">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="calendar-nav prev-month" @click="previousMonth">
        <font-awesome-icon icon="chevron-left" />
      </div>
      <div class="current-month">{{ currentMonthDisplay }}</div>
      <div class="calendar-nav next-month" @click="nextMonth">
        <font-awesome-icon icon="chevron-right" />
      </div>
    </div>
    
    <!-- Calendar Weekdays -->
    <div class="calendar-weekdays">
      <div v-for="day in weekDays" :key="day">{{ day }}</div>
    </div>
    
    <!-- Calendar Days -->
    <div class="calendar-days">
      <div 
        v-for="dayInfo in calendarDays" 
        :key="`${dayInfo.month}-${dayInfo.day}`"
        class="calendar-day"
        :class="{
          'today': dayInfo.isToday,
          'other-month': !dayInfo.isCurrentMonth,
          'has-tasks': dayInfo.hasTasks,
          'selected': selectedDate && isSameDay(selectedDate, dayInfo.date)
        }"
        @click="selectDay(dayInfo.date)"
      >
        {{ dayInfo.day }}
      </div>
    </div>
    
    <!-- Task Panel -->
    <div class="task-panel">
      <div class="task-panel-header">
        <div class="task-panel-title">{{ selectedDateDisplay }}</div>
        <div class="task-count">{{ completedTasksCount }}项已完成</div>
      </div>
      
      <div v-if="tasksForSelectedDate.length > 0" class="task-list">
        <div 
          v-for="(task, index) in tasksForSelectedDate" 
          :key="task.id"
          class="task-list-item"
          :style="{ '--index': index }"
        >
          <div class="task-icon" :style="{ backgroundColor: task.color }">
            <font-awesome-icon :icon="task.icon" />
          </div>
          <div class="task-details">
            <div class="task-name">{{ task.name }}</div>
            <div class="task-time">{{ task.timeRange }}</div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-tasks">
        <font-awesome-icon icon="calendar-day" class="no-tasks-icon" />
        <div>{{ selectedDate && isSameDay(selectedDate, new Date()) ? '今天' : '这天' }}没有完成的任务</div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseLayout from '../components/layout/BaseLayout.vue';

// Calendar data
const currentDate = ref(new Date());
const selectedDate = ref(new Date());

// Weekdays
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// Tasks data (in a real app, this would come from API)
const tasks = [
  { 
    id: 1, 
    name: '早晨锻炼', 
    date: new Date(2023, 5, 1),  // June 1
    timeRange: '07:00 - 08:00',
    icon: 'running',
    color: '#FF9500'
  },
  { 
    id: 2, 
    name: '项目会议', 
    date: new Date(2023, 5, 1),  // June 1
    timeRange: '10:00 - 11:30',
    icon: 'briefcase',
    color: '#007AFF'
  },
  { 
    id: 3, 
    name: '阅读时间', 
    date: new Date(2023, 5, 1),  // June 1
    timeRange: '19:00 - 20:00',
    icon: 'book',
    color: '#5AC8FA'
  },
  { 
    id: 4, 
    name: '医生预约', 
    date: new Date(2023, 5, 5),  // June 5
    timeRange: '14:30 - 15:30',
    icon: 'user-md',
    color: '#FF2D55'
  },
  { 
    id: 5, 
    name: '团队建设', 
    date: new Date(2023, 5, 10),  // June 10
    timeRange: '15:00 - 17:00',
    icon: 'users',
    color: '#007AFF'
  },
  { 
    id: 6, 
    name: '购物', 
    date: new Date(2023, 5, 15),  // June 15
    timeRange: '11:00 - 13:00',
    icon: 'shopping-cart',
    color: '#FF9500'
  }
];

// Helper functions
const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() && 
         date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear();
};

const hasTasksOnDate = (date) => {
  return tasks.some(task => isSameDay(task.date, date));
};

// Display formatted strings
const currentMonthDisplay = computed(() => {
  return `${currentDate.value.getFullYear()}年${currentDate.value.getMonth() + 1}月`;
});

const selectedDateDisplay = computed(() => {
  return `${selectedDate.value.getFullYear()}年${selectedDate.value.getMonth() + 1}月${selectedDate.value.getDate()}日`;
});

// Calendar days calculation
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  // First day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(year, month, 1).getDay();
  
  // Number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Previous month's days to display
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const days = [];
  
  // Add days from previous month
  for (let i = 0; i < firstDay; i++) {
    const day = daysInPrevMonth - firstDay + i + 1;
    const date = new Date(year, month - 1, day);
    days.push({
      day,
      month: month - 1,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
      hasTasks: hasTasksOnDate(date),
      date
    });
  }
  
  // Add days for current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      day: i,
      month,
      isCurrentMonth: true,
      isToday: isSameDay(date, new Date()),
      hasTasks: hasTasksOnDate(date),
      date
    });
  }
  
  // Calculate remaining cells to fill (up to 6 rows x 7 days = 42 cells)
  const remainingCells = 42 - days.length;
  
  // Add days from next month
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      day: i,
      month: month + 1,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
      hasTasks: hasTasksOnDate(date),
      date
    });
  }
  
  return days;
});

// Tasks for selected date
const tasksForSelectedDate = computed(() => {
  return tasks.filter(task => selectedDate.value && isSameDay(task.date, selectedDate.value));
});

const completedTasksCount = computed(() => {
  return tasksForSelectedDate.value.length;
});

// Calendar navigation
const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

// Day selection
const selectDay = (date) => {
  selectedDate.value = date;
};

// Initialize calendar
onMounted(() => {
  // Select today by default
  selectDay(new Date());
});
</script>

<style scoped>
/* Calendar header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  font-weight: 600;
  font-size: 20px;
}

.calendar-nav {
  color: var(--app-primary);
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s ease;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-nav:active {
  transform: scale(0.9);
  background-color: rgba(0, 122, 255, 0.1);
}

/* Calendar weekdays */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  color: var(--app-gray);
  font-weight: 600;
  padding: 8px 16px;
}

/* Calendar days */
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0 16px 16px;
  gap: 8px;
}

.calendar-day {
  aspect-ratio: 1/1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 17px;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: fadeIn 0.3s ease forwards;
}

.calendar-day:active {
  transform: scale(0.9);
}

.calendar-day.today {
  background-color: var(--app-primary);
  color: white;
}

.calendar-day.has-tasks::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--app-primary);
}

.calendar-day.today.has-tasks::after {
  background-color: white;
}

.calendar-day.selected {
  background-color: rgba(0, 122, 255, 0.1);
  border: 1px solid var(--app-primary);
}

.calendar-day.other-month {
  color: var(--app-gray);
  opacity: 0.5;
}

/* Task panel */
.task-panel {
  background-color: white;
  border-radius: 16px 16px 0 0;
  margin-top: 16px;
  padding: 20px 16px;
  flex: 1;
  overflow-y: auto;
  box-shadow: var(--app-shadow);
}

.task-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.task-panel-title {
  font-weight: 600;
  font-size: 18px;
}

.task-count {
  font-size: 14px;
  color: var(--app-gray);
}

.task-list-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--app-border);
  animation: fadeIn 0.3s ease forwards;
  animation-delay: calc(var(--index) * 0.1s);
  opacity: 0;
}

.task-list-item:last-child {
  border-bottom: none;
}

.task-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  color: white;
  font-size: 16px;
}

.task-details {
  flex: 1;
}

.task-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.task-time {
  font-size: 14px;
  color: var(--app-gray);
}

.no-tasks {
  text-align: center;
  padding: 32px 0;
  color: var(--app-gray);
  font-size: 16px;
  animation: fadeIn 0.5s ease forwards;
}

.no-tasks-icon {
  font-size: 32px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .task-panel {
    background-color: #2C2C2E;
  }
  
  .calendar-day.selected {
    background-color: rgba(10, 132, 255, 0.2);
  }
  
  .task-list-item {
    border-color: var(--app-border);
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 