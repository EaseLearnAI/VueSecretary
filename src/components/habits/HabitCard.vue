<template>
  <div class="habit-card" :class="{ 'disabled': disabled }">
    <div class="habit-header">
      <div class="habit-icon" :style="{ backgroundColor: habit.color }">
        <font-awesome-icon :icon="habit.icon" />
      </div>
      <div class="habit-info">
        <div class="habit-name">{{ habit.name }}</div>
        <div class="habit-streak">已坚持 <span>{{ habit.streak }}</span> 天</div>
      </div>
    </div>
    
    <div class="active-week">
      <div 
        v-for="(day, index) in weekDays" 
        :key="day" 
        class="day-item"
      >
        <div class="day-name">{{ day.charAt(0) }}</div>
        <div 
          class="day-circle" 
          :class="{
            'today': isToday(day), 
            'completed': isCompleted(day)
          }"
          @click="!disabled && toggleDay(day)"
        >
          <template v-if="isCompleted(day)">
            <font-awesome-icon icon="check" />
          </template>
          <template v-else>
            {{ index + 1 }}
          </template>
        </div>
      </div>
    </div>
    
    <div v-if="!disabled" class="habit-actions">
      <button class="habit-button" @click="skipHabit">跳过</button>
      <button 
        class="habit-button primary" 
        :class="{ 'completed': isTodayCompleted }" 
        @click="completeHabit"
      >
        {{ isTodayCompleted ? '已完成' : '完成' }}
      </button>
    </div>
    
    <div v-else class="habit-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ 
            width: `${progressPercent}%`, 
            backgroundColor: habit.color 
          }"
        ></div>
      </div>
      <div class="progress-percent">{{ progressPercent }}%</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  habit: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-completion']);

// Week days
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// Helper functions
const isToday = (day) => {
  // In a real app, would compare with current day of week
  return day === '周三';
};

const isCompleted = (day) => {
  return props.habit.daysCompleted.includes(day);
};

const isTodayCompleted = computed(() => {
  return isCompleted(weekDays.find(day => isToday(day)));
});

// Progress calculation for non-today habits
const progressPercent = computed(() => {
  // For demo purposes, using a fixed percentage
  // In a real app, would calculate based on completion data
  return Math.floor(Math.random() * 30) + 70; // Random between 70-100
});

// Actions
const toggleDay = (day) => {
  if (isToday(day)) {
    emit('toggle-completion', props.habit.id, !isCompleted(day));
  }
};

const completeHabit = () => {
  const today = weekDays.find(day => isToday(day));
  emit('toggle-completion', props.habit.id, !isCompleted(today));
};

const skipHabit = () => {
  // In a real app, would mark as skipped in the backend
  console.log(`Skipped habit: ${props.habit.id}`);
};
</script>

<style scoped>
.habit-card {
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--app-shadow);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease forwards;
}

.habit-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.habit-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-size: 16px;
}

.habit-info {
  flex: 1;
}

.habit-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.habit-streak {
  font-size: 12px;
  color: var(--app-gray);
}

.habit-streak span {
  color: var(--app-dark);
  font-weight: 500;
}

.active-week {
  display: flex;
  justify-content: space-between;
  margin: 16px 0;
}

.day-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
}

.day-name {
  color: var(--app-gray);
  margin-bottom: 4px;
}

.day-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--app-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.day-circle:active {
  transform: scale(0.9);
}

.day-circle.today {
  border: 2px solid var(--app-primary);
}

.day-circle.completed {
  background-color: var(--app-success);
  color: white;
}

.habit-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.habit-button {
  flex: 1;
  background-color: var(--app-light);
  border-radius: 8px;
  padding: 10px 0;
  text-align: center;
  font-size: 14px;
  color: var(--app-dark);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.habit-button:active {
  transform: scale(0.98);
}

.habit-button.primary {
  background-color: var(--app-primary);
  color: white;
}

.habit-button.primary.completed {
  background-color: var(--app-success);
}

.habit-progress {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.progress-bar {
  height: 6px;
  background-color: var(--app-light);
  border-radius: 3px;
  flex: 1;
  overflow: hidden;
  margin-right: 12px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s ease;
}

.progress-percent {
  font-size: 14px;
  font-weight: 600;
}

.habit-card.disabled {
  opacity: 0.8;
}

.habit-card.disabled .day-circle {
  cursor: default;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .habit-card {
    background-color: #2C2C2E;
  }
  
  .habit-streak span {
    color: var(--app-light);
  }
  
  .day-circle {
    background-color: #3A3A3C;
  }
  
  .habit-button {
    background-color: #3A3A3C;
    color: white;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 