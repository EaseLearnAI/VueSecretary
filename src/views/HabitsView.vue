<template>
  <div class="habits-container">
    <!-- Header with title, tags, and count -->
    <HabitHeader
      :title="habitsStore.headerTitle"
      :count="habitsStore.headerCount"
      :tags="habitsStore.headerTags"
      @increase="habitsStore.increaseCount"
      @decrease="habitsStore.decreaseCount"
    />
    
    <!-- Main content with habit grid -->
    <main class="habits-content">
      <HabitGrid
        :habits="habitsStore.habits"
        :selectedHabitIndex="habitsStore.selectedHabitIndex"
        @select-habit="habitsStore.selectHabit"
        @toggle-complete="habitsStore.toggleComplete"
        @toggle-style="habitsStore.toggleHabitStyle"
      />
    </main>
    
    <!-- Floating add button -->
    <FloatingButton
      @click="openAddModal"
    />
    
    <!-- Add habit modal -->
    <AddHabitModal
      :visible="isAddModalVisible"
      @close="closeAddModal"
      @add-habit="habitsStore.addHabit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useHabitsStore } from '@/stores/habitsStore';
import HabitHeader from '@/components/habits/HabitHeader.vue';
import HabitGrid from '@/components/habits/HabitGrid.vue';
import FloatingButton from '@/components/habits/FloatingButton.vue';
import AddHabitModal from '@/components/habits/AddHabitModal.vue';
import '@/components/habits/HabitsGlobalStyles.css';

// Initialize the habits store
const habitsStore = useHabitsStore();

// Add modal visibility
const isAddModalVisible = ref(false);

// Methods for modal control
const openAddModal = () => {
  isAddModalVisible.value = true;
};

const closeAddModal = () => {
  isAddModalVisible.value = false;
};
</script>

<style scoped>
.habits-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-height: 100vh;
  background-color: #f8f7f4;
  padding-bottom: 80px; /* Space for navigation */
  overflow: hidden; /* Prevent overall page scrolling */
}

.habits-content {
  flex: 1;
  padding: 0 16px 16px;
  overflow-y: auto; /* Add vertical scrolling */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  scrollbar-width: thin; /* For Firefox */
  scrollbar-color: #d4d4d8 transparent; /* For Firefox */
}

/* Custom scrollbar styling for WebKit browsers */
.habits-content::-webkit-scrollbar {
  width: 6px;
}

.habits-content::-webkit-scrollbar-track {
  background: transparent;
}

.habits-content::-webkit-scrollbar-thumb {
  background-color: #d4d4d8;
  border-radius: 6px;
}

/* Global transitions for habit count changes */
.count-transition-enter-active,
.count-transition-leave-active {
  transition: all 0.2s cubic-bezier(0.25, 1.25, 0.5, 1);
}

.count-transition-enter-from,
.count-transition-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Media query adjustments for smaller screens */
@media (max-height: 600px) {
  .habits-container {
    padding-bottom: 60px;
  }
  
  .habits-content {
    padding: 0 12px 12px;
  }
}
</style>
