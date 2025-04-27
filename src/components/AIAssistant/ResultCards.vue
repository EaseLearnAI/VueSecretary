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
            <span class="card-title">{{ event.title }}</span>
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
              <span>{{ formatDateTime(event.startTime) }}</span>
              <span v-if="event.endTime"> - {{ formatDateTime(event.endTime) }}</span>
            </div>
            <div v-if="event.location" class="card-detail">
              <font-awesome-icon icon="map-marker-alt" class="detail-icon" />
              <span>{{ event.location }}</span>
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
            <div v-if="task.dueDate" class="card-detail">
              <font-awesome-icon icon="calendar-day" class="detail-icon" />
              <span>{{ formatDate(task.dueDate) }}</span>
            </div>
            <div v-if="task.priority" class="card-detail">
              <font-awesome-icon icon="flag" class="detail-icon" />
              <span>优先级: {{ formatPriority(task.priority) }}</span>
            </div>
            <div v-if="task.description" class="card-description">
              {{ task.description }}
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
            <div v-if="habit.timeOfDay" class="card-detail">
              <font-awesome-icon icon="clock" class="detail-icon" />
              <span>{{ habit.timeOfDay }}</span>
            </div>
            <div v-if="habit.description" class="card-description">
              {{ habit.description }}
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
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const dateObj = new Date(dateTime);
  return dateObj.toLocaleString('zh-CN', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Format priority level
const formatPriority = (priority) => {
  const priorityMap = {
    high: '高',
    medium: '中',
    low: '低'
  };
  return priorityMap[priority.toLowerCase()] || priority;
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
</style> 