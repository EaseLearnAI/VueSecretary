<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="modelValue" class="pomodoro-overlay">
        <div class="pomodoro-container">
          <div class="pomodoro-header">
            <div class="pomodoro-title">{{ task.name }}</div>
            <div class="pomodoro-subtitle" v-if="task.groupName">{{ task.groupName }}</div>
            <button class="close-button" @click="$emit('update:modelValue', false)">
              <font-awesome-icon icon="times" />
            </button>
          </div>
          
          <div class="pomodoro-timer">
            <div class="timer-circle" :style="{ background: getCircleBackground }">
              <div class="timer-display">{{ formattedTime }}</div>
            </div>
          </div>
          
          <div class="pomodoro-controls">
            <div class="timer-options" v-if="!isActive">
              <button 
                v-for="option in timerOptions" 
                :key="option.value"
                class="time-option-btn"
                :class="{ active: timerDuration === option.value }"
                @click="setTimerDuration(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            
            <div class="timer-buttons">
              <button 
                v-if="!isActive" 
                class="btn btn-primary control-btn"
                @click="startTimer"
              >
                <font-awesome-icon icon="play" class="btn-icon" />
                开始专注
              </button>
              
              <template v-else>
                <button 
                  v-if="!isPaused" 
                  class="btn btn-secondary control-btn"
                  @click="pauseTimer"
                >
                  <font-awesome-icon icon="pause" class="btn-icon" />
                  暂停
                </button>
                
                <button 
                  v-else
                  class="btn btn-primary control-btn"
                  @click="resumeTimer"
                >
                  <font-awesome-icon icon="play" class="btn-icon" />
                  继续
                </button>
                
                <button 
                  class="btn btn-danger control-btn"
                  @click="stopTimer"
                >
                  <font-awesome-icon icon="stop" class="btn-icon" />
                  结束
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  task: {
    type: Object,
    required: true
  }
});

defineEmits(['update:modelValue']);

// Timer options
const timerOptions = [
  { label: '25 分钟', value: 25 * 60 },
  { label: '45 分钟', value: 45 * 60 },
  { label: '60 分钟', value: 60 * 60 }
];

// Timer state
const timerDuration = ref(25 * 60); // Default: 25 minutes
const timeRemaining = ref(timerDuration.value);
const isActive = ref(false);
const isPaused = ref(false);
let timerInterval = null;

// Format time as MM:SS
const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60);
  const seconds = timeRemaining.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Circle progress background
const getCircleBackground = computed(() => {
  const progress = 1 - (timeRemaining.value / timerDuration.value);
  const angle = progress * 360;
  
  if (progress === 0) {
    return 'conic-gradient(#F2F2F7 0deg, #F2F2F7 360deg)';
  }
  
  return `conic-gradient(var(--app-primary) 0deg, var(--app-primary) ${angle}deg, #F2F2F7 ${angle}deg, #F2F2F7 360deg)`;
});

// Timer methods
const setTimerDuration = (duration) => {
  timerDuration.value = duration;
  timeRemaining.value = duration;
};

const startTimer = () => {
  isActive.value = true;
  isPaused.value = false;
  
  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value -= 1;
    } else {
      timerComplete();
    }
  }, 1000);
};

const pauseTimer = () => {
  isPaused.value = true;
  clearInterval(timerInterval);
};

const resumeTimer = () => {
  isPaused.value = false;
  startTimer();
};

const stopTimer = () => {
  isActive.value = false;
  isPaused.value = false;
  clearInterval(timerInterval);
  timeRemaining.value = timerDuration.value;
};

const timerComplete = () => {
  isActive.value = false;
  clearInterval(timerInterval);
  
  // Play sound and show notification
  playTimerCompleteSound();
  showNotification();
};

const playTimerCompleteSound = () => {
  // In a real app, this would play a sound
  console.log('Timer complete! Playing sound...');
};

const showNotification = () => {
  // In a real app, this would show a browser notification
  console.log('Showing notification');
};

// Clean up timer when component unmounts
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

// Reset timer when modal is closed
watch(() => props.modelValue, (newValue) => {
  if (!newValue && isActive.value) {
    stopTimer();
  }
});
</script>

<style scoped>
.pomodoro-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  padding: 24px;
  z-index: 100;
  max-width: 430px;
  margin: 0 auto;
}

.pomodoro-header {
  position: relative;
  text-align: center;
  margin-bottom: 24px;
}

.pomodoro-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.pomodoro-subtitle {
  font-size: 14px;
  color: var(--app-gray);
}

.close-button {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: var(--app-gray);
  font-size: 20px;
  cursor: pointer;
}

.pomodoro-timer {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.timer-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.timer-circle::after {
  content: '';
  position: absolute;
  width: 90%;
  height: 90%;
  border-radius: 50%;
  background-color: white;
}

.timer-display {
  font-size: 40px;
  font-weight: 700;
  z-index: 1;
}

.pomodoro-controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.timer-options {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.time-option-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--app-border);
  background: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-option-btn.active {
  background-color: var(--app-primary);
  color: white;
  border-color: var(--app-primary);
}

.timer-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.control-btn {
  min-width: 120px;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .pomodoro-overlay {
    background-color: #2C2C2E;
    color: white;
  }
  
  .timer-circle::after {
    background-color: #2C2C2E;
  }
  
  .time-option-btn {
    color: white;
    border-color: #3A3A3C;
  }
}

/* Desktop adjustments */
@media (min-width: 768px) {
  .pomodoro-overlay {
    position: fixed;
    bottom: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 24px;
    width: 450px;
    max-width: 90vw;
  }
}
</style> 