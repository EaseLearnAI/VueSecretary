<template>
  <div class="habit-grid">
    <HabitCard
      v-for="(habit, index) in habits"
      :key="habit.id"
      :title="habit.title"
      :count="habit.count"
      :isDark="habit.isDark"
      :isCompleted="habit.isCompleted"
      :isSelected="selectedHabitIndex === index"
      :iconUrl="habit.iconUrl"
      :iconType="habit.iconType"
      @select="selectHabit(index)"
      @toggle-complete="toggleComplete(index)"
      @toggle-style="toggleStyle(index)"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import HabitCard from './HabitCard.vue';

const props = defineProps({
  habits: {
    type: Array,
    required: true
  },
  selectedHabitIndex: {
    type: Number,
    default: -1
  }
});

const emit = defineEmits(['select-habit', 'toggle-complete', 'toggle-style']);

const selectHabit = (index) => {
  emit('select-habit', index);
};

const toggleComplete = (index) => {
  emit('toggle-complete', index);
};

const toggleStyle = (index) => {
  emit('toggle-style', index);
};
</script>

<style scoped>
.habit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  padding: 4px 0;
}

@media (min-width: 640px) {
  .habit-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .habit-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style> 