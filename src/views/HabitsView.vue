<template>
  <BaseLayout 
    title="习惯" 
    :right-action="true" 
    @right-action="openAddHabitModal"
  >
    <section class="habit-section">
      <h2 class="section-title">今日</h2>
      
      <div class="habit-cards">
        <HabitCard 
          v-for="habit in todayHabits" 
          :key="habit.id" 
          :habit="habit"
          @toggle-completion="toggleHabitCompletion"
        />
        
        <div v-if="todayHabits.length === 0" class="empty-state">
          <font-awesome-icon icon="calendar-day" class="empty-icon" />
          <p>今天没有需要完成的习惯</p>
        </div>
      </div>
    </section>
    
    <section class="habit-section">
      <h2 class="section-title">其他习惯</h2>
      
      <div class="habit-cards">
        <HabitCard 
          v-for="habit in otherHabits" 
          :key="habit.id" 
          :habit="habit"
          :disabled="true"
        />
        
        <div v-if="otherHabits.length === 0" class="empty-state">
          <font-awesome-icon icon="calendar-check" class="empty-icon" />
          <p>没有其他习惯</p>
        </div>
      </div>
    </section>
    
    <!-- Add Habit Modal -->
    <ModalContainer v-model="showAddHabitModal" title="新建习惯">
      <el-form :model="newHabit" label-position="top">
        <el-form-item label="习惯名称">
          <el-input v-model="newHabit.name" placeholder="输入习惯名称" />
        </el-form-item>
        
        <el-form-item label="图标">
          <div class="icon-selector">
            <div 
              v-for="icon in availableIcons" 
              :key="icon"
              class="icon-option"
              :class="{ active: newHabit.icon === icon }"
              :style="{ backgroundColor: newHabit.color }"
              @click="newHabit.icon = icon"
            >
              <font-awesome-icon :icon="icon" />
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="颜色">
          <div class="color-selector">
            <div 
              v-for="color in availableColors" 
              :key="color"
              class="color-option"
              :class="{ active: newHabit.color === color }"
              :style="{ backgroundColor: color }"
              @click="newHabit.color = color"
            />
          </div>
        </el-form-item>
        
        <el-form-item label="频率">
          <el-select v-model="newHabit.frequency" placeholder="选择频率" style="width: 100%">
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="newHabit.frequency === 'weekly'" label="每周哪几天">
          <el-checkbox-group v-model="newHabit.weekDays">
            <el-checkbox label="周一" />
            <el-checkbox label="周二" />
            <el-checkbox label="周三" />
            <el-checkbox label="周四" />
            <el-checkbox label="周五" />
            <el-checkbox label="周六" />
            <el-checkbox label="周日" />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <button class="btn btn-secondary" @click="showAddHabitModal = false">取消</button>
        <button class="btn btn-primary" @click="addHabit">创建</button>
      </template>
    </ModalContainer>
  </BaseLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseLayout from '../components/layout/BaseLayout.vue';
import ModalContainer from '../components/layout/ModalContainer.vue';
import HabitCard from '../components/habits/HabitCard.vue';

// Habits data
const habits = ref([
  {
    id: 1,
    name: '阅读',
    icon: 'book',
    color: '#5AC8FA',
    streak: 28,
    daysCompleted: ['周一', '周二', '周三'],
    frequency: 'daily',
    isForToday: true
  },
  {
    id: 2,
    name: '锻炼',
    icon: 'running',
    color: '#FF9500',
    streak: 15,
    daysCompleted: ['周一'],
    frequency: 'daily',
    isForToday: true
  },
  {
    id: 3,
    name: '冥想',
    icon: 'spa',
    color: '#AF52DE',
    streak: 7,
    daysCompleted: [],
    frequency: 'weekly',
    weekDays: ['周一', '周三', '周五'],
    isForToday: false
  },
  {
    id: 4,
    name: '日记',
    icon: 'pencil-alt',
    color: '#34C759',
    streak: 21,
    daysCompleted: [],
    frequency: 'daily',
    isForToday: false
  }
]);

// Filtered habits
const todayHabits = computed(() => {
  return habits.value.filter(habit => habit.isForToday);
});

const otherHabits = computed(() => {
  return habits.value.filter(habit => !habit.isForToday);
});

// Habit actions
const toggleHabitCompletion = (habitId, isCompleted) => {
  const habit = habits.value.find(h => h.id === habitId);
  if (habit) {
    const today = '周三'; // In a real app, would get current day
    
    if (isCompleted) {
      if (!habit.daysCompleted.includes(today)) {
        habit.daysCompleted.push(today);
      }
    } else {
      const index = habit.daysCompleted.indexOf(today);
      if (index !== -1) {
        habit.daysCompleted.splice(index, 1);
      }
    }
  }
};

// Modal state
const showAddHabitModal = ref(false);
const newHabit = ref({
  name: '',
  icon: 'book',
  color: '#007AFF',
  frequency: 'daily',
  weekDays: ['周一', '周三', '周五']
});

// Available icons and colors
const availableIcons = [
  'book', 'running', 'spa', 'pencil-alt', 'apple-alt', 'code', 'language', 
  'guitar', 'brain', 'bed', 'glass-water', 'dumbbell'
];

const availableColors = [
  '#007AFF', '#5AC8FA', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', 
  '#FF2D55', '#00C7BE', '#30B0C7'
];

const openAddHabitModal = () => {
  newHabit.value = {
    name: '',
    icon: 'book',
    color: '#007AFF',
    frequency: 'daily',
    weekDays: ['周一', '周三', '周五']
  };
  showAddHabitModal.value = true;
};

const addHabit = () => {
  if (!newHabit.value.name.trim()) {
    return; // TODO: Show validation message
  }
  
  const newId = Math.max(...habits.value.map(h => h.id), 0) + 1;
  
  habits.value.push({
    id: newId,
    name: newHabit.value.name,
    icon: newHabit.value.icon,
    color: newHabit.value.color,
    streak: 0,
    daysCompleted: [],
    frequency: newHabit.value.frequency,
    weekDays: newHabit.value.weekDays || [],
    isForToday: true // For demo purposes, new habits are for today
  });
  
  showAddHabitModal.value = false;
};
</script>

<style scoped>
.habit-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 17px;
  color: var(--app-gray);
  font-weight: 600;
  margin-bottom: 16px;
  padding-left: 4px;
}

.habit-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 32px;
  color: var(--app-gray);
  background-color: white;
  border-radius: 16px;
  box-shadow: var(--app-shadow);
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* Icon and color selectors */
.icon-selector, .color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.icon-option {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option.active {
  transform: scale(1.1);
  box-shadow: 0 0 0 2px white, 0 0 0 4px var(--app-primary);
}

.color-option {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option.active {
  transform: scale(1.2);
  box-shadow: 0 0 0 2px white, 0 0 0 4px var(--app-dark);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .empty-state {
    background-color: #2C2C2E;
  }
  
  .icon-option.active {
    box-shadow: 0 0 0 2px #2C2C2E, 0 0 0 4px var(--app-primary);
  }
  
  .color-option.active {
    box-shadow: 0 0 0 2px #2C2C2E, 0 0 0 4px var(--app-light);
  }
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .habit-cards {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
</style> 