<template>
  <header class="habit-header">
    <!-- Decorative image -->
    <img 
      src="https://cdn-icons-png.flaticon.com/512/590/590685.png" 
      alt="Carrot" 
      class="decoration-img" 
    />
    
    <!-- Header content -->
    <div class="header-content">
      <!-- Title and tags -->
      <div class="title-section">
        <h1>{{ title }}</h1>
        <div class="tag-container">
          <span 
            v-for="(tag, index) in tags" 
            :key="index"
            :class="['tag', `tag-${tag.type}`]"
          >
            {{ tag.label }}
          </span>
          <span v-if="tags.length === 0" class="tag tag-small tag-orange">+1</span>
        </div>
      </div>
      
      <!-- Count card -->
      <div class="count-card">
        <span class="count-number">{{ count }}</span>
        <div class="count-buttons">
          <button 
            class="btn-circle btn-minus"
            @click="$emit('decrease')"
          >
            <span class="btn-text-gray">-</span>
          </button>
          <button 
            class="btn-circle btn-plus" 
            @click="$emit('increase')"
          >
            <span class="btn-text-white">+</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '健康习惯'
  },
  count: {
    type: Number,
    default: 0
  },
  tags: {
    type: Array,
    default: () => []
  }
});

defineEmits(['increase', 'decrease']);
</script>

<style scoped>
.habit-header {
  position: relative;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-image: linear-gradient(135deg, #fafafa, #f0f0f0);
  padding: 24px 20px 16px;
  margin-bottom: 16px;
  overflow: hidden;
}

.decoration-img {
  position: absolute;
  top: 12px;
  right: 20px;
  width: 80px;
  height: 80px;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04)) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1));
  z-index: 2;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 10;
}

.title-section {
  margin-bottom: 4px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  color: #F56565;
  margin: 0 0 8px 0;
}

.tag-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 14px;
  display: inline-block;
}

.tag-small {
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
}

.tag-orange {
  background-color: #fff7ed;
  color: #fb923c;
}

.tag-green {
  background-color: #f0fdf4;
  color: #16a34a;
}

.tag-red {
  background-color: #fef2f2;
  color: #dc2626;
}

.tag-blue {
  background-color: #eff6ff;
  color: #2563eb;
}

.count-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(2px);
}

.count-number {
  font-size: 32px;
  font-weight: 700;
  color: #F56565;
  transition: all 0.2s cubic-bezier(0.25, 1.25, 0.5, 1);
}

.count-buttons {
  display: flex;
  gap: 12px;
}

.btn-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 1.25, 0.5, 1);
}

.btn-circle:active {
  transform: scale(0.95);
}

.btn-minus {
  background-color: #f3f4f6;
}

.btn-plus {
  background-color: #48BB78;
}

.btn-text-white {
  color: white;
  font-size: 20px;
}

.btn-text-gray {
  color: #9ca3af;
  font-size: 20px;
}
</style> 