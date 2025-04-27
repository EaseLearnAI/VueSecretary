<template>
  <div class="result-cards">
    <!-- Events Cards -->
    <div v-if="events && events.length > 0" class="card-section">
      <h3 class="section-title">
        <font-awesome-icon icon="calendar" class="section-icon" />
        事件
      </h3>
      <div class="cards-container">
        <div v-for="(event, index) in events" :key="index" class="card event-card">
          <div class="card-header">
            <span class="card-title">{{ event.title || event.content }}</span>
            <div class="card-actions">
              <button class="action-btn" @click="updateEvent(event, 'edit')">
                <font-awesome-icon icon="pen" />
              </button>
              <button class="action-btn" @click="updateEvent(event, 'delete')">
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </div>
          <div class="card-content">
            <div class="card-detail">
              <font-awesome-icon icon="clock" class="detail-icon" />
              <span>{{ formatDateTime(event.startTime || event.time) }}</span>
              <span v-if="event.endTime"> - {{ formatDateTime(event.endTime) }}</span>
            </div>
            <div v-if="event.location" class="card-detail">
              <font-awesome-icon icon="map-marker-alt" class="detail-icon" />
              <span>{{ event.location }}</span>
            </div>
            <div v-if="event.priority" class="card-detail">
              <font-awesome-icon icon="flag" class="detail-icon" />
              <span>优先级: {{ formatPriority(event.priority) }}</span>
            </div>
            <div v-if="event.description" class="card-description">
              {{ event.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tasks Cards -->
    <div v-if="tasks && tasks.length > 0" class="card-section">
      <h3 class="section-title">
        <font-awesome-icon icon="tasks" class="section-icon" />
        任务
      </h3>
      <div class="cards-container">
        <div v-for="(task, index) in tasks" :key="index" class="card task-card">
          <div class="card-header">
            <span class="card-title">{{ task.title }}</span>
            <div class="card-actions">
              <button class="action-btn" @click="updateTask(task, 'complete')" v-if="!task.completed">
                <font-awesome-icon icon="check" />
              </button>
              <button class="action-btn" @click="updateTask(task, 'edit')">
                <font-awesome-icon icon="pen" />
              </button>
              <button class="action-btn" @click="updateTask(task, 'delete')">
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </div>
          <div class="card-content">
            <div v-if="task.dueDate || task.deadline" class="card-detail">
              <font-awesome-icon icon="calendar-day" class="detail-icon" />
              <span>{{ formatDate(task.dueDate || task.deadline) }}</span>
            </div>
            <div v-if="task.priority" class="card-detail">
              <font-awesome-icon icon="flag" class="detail-icon" />
              <span>优先级: {{ formatPriority(task.priority) }}</span>
            </div>
            <div v-if="task.description" class="card-description">
              {{ task.description }}
            </div>
            
            <!-- Subtasks -->
            <div v-if="task.subtasks && task.subtasks.length > 0" class="subtasks">
              <div class="subtasks-header">子任务</div>
              <div v-for="(subtask, subtaskIndex) in task.subtasks" :key="subtaskIndex" class="subtask-item">
                <div class="subtask-checkbox">
                  <font-awesome-icon icon="circle" class="subtask-icon" />
                </div>
                <div class="subtask-content">
                  <div class="subtask-title">{{ subtask.title || subtask.content }}</div>
                  <div v-if="subtask.scheduledTime" class="subtask-time">
                    建议时间: {{ subtask.scheduledTime }}
                  </div>
                  <div v-if="subtask.estimatedDuration" class="subtask-duration">
                    预计用时: {{ subtask.estimatedDuration }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Habits Cards -->
    <div v-if="habits && habits.length > 0" class="card-section">
      <h3 class="section-title">
        <font-awesome-icon icon="sync" class="section-icon" />
        习惯
      </h3>
      <div class="cards-container">
        <div v-for="(habit, index) in habits" :key="index" class="card habit-card">
          <div class="card-header">
            <span class="card-title">{{ habit.title }}</span>
            <div class="card-actions">
              <button class="action-btn" @click="updateHabit(habit, 'edit')">
                <font-awesome-icon icon="pen" />
              </button>
              <button class="action-btn" @click="updateHabit(habit, 'delete')">
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </div>
          <div class="card-content">
            <div class="card-detail">
              <font-awesome-icon icon="repeat" class="detail-icon" />
              <span>{{ formatFrequency(habit.frequency) }}</span>
            </div>
            <div v-if="habit.timeOfDay || habit.schedule" class="card-detail">
              <font-awesome-icon icon="clock" class="detail-icon" />
              <span>{{ habit.timeOfDay || habit.schedule }}</span>
            </div>
            <div v-if="habit.description" class="card-description">
              {{ habit.description }}
            </div>
            
            <!-- Habit plan -->
            <div v-if="habit.plan && habit.plan.steps && habit.plan.steps.length > 0" class="habit-plan">
              <div class="habit-plan-header">计划步骤</div>
              <ul class="habit-plan-steps">
                <li v-for="(step, stepIndex) in habit.plan.steps" :key="stepIndex">
                  {{ step }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  },
  tasks: {
    type: Array,
    default: () => []
  },
  habits: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:event', 'update:task', 'update:habit']);

// Format date and time
const formatDate = (date) => {
  if (!date) return '';
  
  // Handle date strings that are not in ISO format
  if (typeof date === 'string' && !date.includes('T') && !date.includes('-')) {
    return date; // Return as is for descriptive dates like "明天" or "周五之前"
  }
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (e) {
    return date; // Fallback to original string if parsing fails
  }
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  
  // Handle descriptive time strings
  if (typeof dateTime === 'string' && !dateTime.includes('T') && !dateTime.includes('-')) {
    return dateTime; // Return as is for descriptive times like "早上十一点"
  }
  
  try {
    const dateObj = new Date(dateTime);
    return dateObj.toLocaleString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  } catch (e) {
    return dateTime; // Fallback to original string if parsing fails
  }
};

// Format priority level
const formatPriority = (priority) => {
  if (!priority) return '';
  
  const priorityMap = {
    high: '高',
    medium: '中',
    low: '低',
    '高': '高',
    '中': '中', 
    '低': '低'
  };
  
  if (typeof priority === 'string') {
    return priorityMap[priority.toLowerCase()] || priority;
  }
  
  return priority.toString();
};

// Format frequency
const formatFrequency = (frequency) => {
  if (!frequency) return '每天';
  
  const frequencyMap = {
    daily: '每天',
    weekly: '每周',
    'weekdays': '工作日',
    'weekends': '周末',
    monthly: '每月'
  };
  
  if (typeof frequency === 'string') {
    return frequencyMap[frequency.toLowerCase()] || frequency;
  } else if (Array.isArray(frequency)) {
    // If it's an array of days
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return frequency.map(day => {
      if (typeof day === 'number') {
        return days[day % 7];
      }
      return day;
    }).join('、');
  }
  
  return frequency.toString();
};

// Event handlers
const updateEvent = (event, action) => {
  emit('update:event', { ...event, action });
};

const updateTask = (task, action) => {
  emit('update:task', { ...task, action });
};

const updateHabit = (habit, action) => {
  emit('update:habit', { ...habit, action });
};
</script>

<style scoped>
.result-cards {
  width: 100%;
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--app-dark, #343a40);
  display: flex;
  align-items: center;
}

.section-icon {
  margin-right: 8px;
  color: var(--app-primary, #007bff);
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.event-card {
  border-left: 4px solid var(--app-primary, #007bff);
}

.task-card {
  border-left: 4px solid var(--app-success, #28a745);
}

.habit-card {
  border-left: 4px solid var(--app-warning, #ffc107);
}

.card-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: rgba(0, 0, 0, 0.02);
}

.card-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--app-dark, #343a40);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: var(--app-gray, #6c757d);
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: var(--app-primary, #007bff);
  background-color: rgba(0, 123, 255, 0.08);
}

.card-content {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-detail {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--app-gray-dark, #495057);
}

.detail-icon {
  margin-right: 8px;
  color: var(--app-gray, #6c757d);
  font-size: 12px;
  width: 12px;
}

.card-description {
  font-size: 14px;
  color: var(--app-gray-dark, #495057);
  margin-top: 4px;
  line-height: 1.4;
}

/* Subtasks styling */
.subtasks {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.subtasks-header {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--app-dark, #343a40);
}

.subtask-item {
  display: flex;
  margin-bottom: 6px;
  padding-left: 4px;
}

.subtask-checkbox {
  margin-right: 8px;
  color: var(--app-gray, #6c757d);
}

.subtask-icon {
  font-size: 10px;
}

.subtask-content {
  flex: 1;
}

.subtask-title {
  font-size: 14px;
  color: var(--app-gray-dark, #495057);
}

.subtask-time, .subtask-duration {
  font-size: 12px;
  color: var(--app-gray, #6c757d);
  margin-top: 2px;
}

/* Habit plan styling */
.habit-plan {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.habit-plan-header {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--app-dark, #343a40);
}

.habit-plan-steps {
  padding-left: 20px;
  margin: 0;
}

.habit-plan-steps li {
  font-size: 14px;
  color: var(--app-gray-dark, #495057);
  margin-bottom: 4px;
}
</style> 