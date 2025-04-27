<template>
  <div 
    :class="['habit-card', { 'dark': isDark, 'selected': isSelected }]"
    @click="$emit('select')"
    v-double-tap="() => $emit('toggle-style')"
  >
    <div class="card-content">
      <div class="card-title" :class="{ 'text-white': isDark }">{{ title }}</div>
      <div :class="['card-count', isDark ? 'card-count-dark' : 'card-count-light']">{{ count }}</div>
    </div>
    <div class="card-icon">
      <img :src="iconUrl" :alt="title">
      <div class="icon-badge-container" @click.stop="$emit('toggle-complete')">
        <div :class="['icon-badge', getIconBadgeClass()]">
          <font-awesome-icon 
            :icon="getIconType()" 
            class="badge-icon" 
            :class="getIconClass()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { vDoubleTap } from './doubleTap';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  isDark: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  iconUrl: {
    type: String,
    required: true
  },
  iconType: {
    type: String,
    default: 'plus',
    validator: (value) => ['plus', 'check', 'camera'].includes(value)
  }
});

defineEmits(['select', 'toggle-complete', 'toggle-style']);

const getIconBadgeClass = () => {
  if (props.isCompleted) {
    return 'icon-badge-green';
  } else if (props.isDark) {
    return 'icon-badge-white';
  } else {
    return 'icon-badge-light';
  }
};

const getIconType = () => {
  if (props.isCompleted) {
    return 'check';
  } else if (props.iconType === 'camera') {
    return 'camera';
  } else {
    return 'plus';
  }
};

const getIconClass = () => {
  if (props.isCompleted) {
    return 'icon-badge-check-white';
  } else if (props.isDark) {
    return 'icon-badge-plus-dark';
  } else {
    return 'icon-badge-plus-green';
  }
};

</script>

<style scoped>
.habit-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 12px;
  position: relative;
  transition: all 0.2s cubic-bezier(0.25, 1.25, 0.5, 1);
  cursor: pointer;
  min-height: 100px;
  display: flex;
  flex-direction: column;
}

.habit-card:active {
  transform: scale(0.98);
}

.habit-card.dark {
  background-color: #1f2937;
}

.habit-card.selected {
  box-shadow: 0 0 0 2px #3b82f6, 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  line-height: 1.2;
}

.text-white {
  color: white;
}

.card-count {
  font-weight: 500;
  font-size: 14px;
}

.card-count-light {
  color: #F56565;
}

.card-count-dark {
  color: #fb923c;
}

.card-icon {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.card-icon img {
  width: 40px;
  height: 40px;
  opacity: 0.7;
}

.icon-badge-container {
  position: absolute;
  bottom: 0;
  right: 0;
}

.icon-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-badge-green {
  background-color: #48BB78;
}

.icon-badge-white {
  background-color: white;
}

.icon-badge-light {
  background-color: #dcfce7;
}

.badge-icon {
  font-size: 10px;
}

.icon-badge-check-white {
  color: white;
}

.icon-badge-plus-dark {
  color: #1f2937;
}

.icon-badge-plus-green {
  color: #16a34a;
}
</style> 