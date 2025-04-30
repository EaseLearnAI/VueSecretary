<template>
  <div class="info-step-form">
    <h3 class="form-section-title">填写语音合成信息</h3>
    
    <div class="form-group">
      <label class="form-label">文本提示词</label>
      <textarea 
        class="form-textarea" 
        v-model="localData.textPrompt" 
        placeholder="请输入您希望模仿的说话风格，如'模仿周杰伦说话'"
        @input="updateData"
        rows="3"
      ></textarea>
    </div>
    
    <div class="form-group">
      <label class="form-label">鼓励风格</label>
      <div class="style-options">
        <div 
          v-for="style in encouragementStyles" 
          :key="style.value"
          class="style-option"
          :class="{ 'selected': localData.encouragementStyle === style.value }"
          @click="selectEncouragementStyle(style.value)"
        >
          <div class="style-name">{{ style.label }}</div>
          <div class="style-example">{{ style.example }}</div>
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label">批评风格</label>
      <div class="style-options">
        <div 
          v-for="style in criticismStyles" 
          :key="style.value"
          class="style-option"
          :class="{ 'selected': localData.criticismStyle === style.value }"
          @click="selectCriticismStyle(style.value)"
        >
          <div class="style-name">{{ style.label }}</div>
          <div class="style-example">{{ style.example }}</div>
        </div>
      </div>
    </div>
    
    <div class="form-actions">
      <button 
        class="btn-next" 
        @click="nextStep"
        :disabled="!isFormValid"
      >
        下一步
        <font-awesome-icon icon="arrow-right" class="btn-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:formData', 'next-step']);

// Create a local copy of the form data
const localData = ref({
  textPrompt: props.formData.textPrompt || '',
  encouragementStyle: props.formData.encouragementStyle || '',
  criticismStyle: props.formData.criticismStyle || ''
});

// Sync with props
watch(() => props.formData, (newData) => {
  localData.value = {
    textPrompt: newData.textPrompt || '',
    encouragementStyle: newData.encouragementStyle || '',
    criticismStyle: newData.criticismStyle || ''
  };
}, { deep: true });

// Encouragement styles
const encouragementStyles = [
  { 
    value: 'gentle', 
    label: '温和鼓励', 
    example: '例如：你做得很好，继续加油！' 
  },
  { 
    value: 'enthusiastic', 
    label: '热情鼓励', 
    example: '例如：太棒了！你的进步令人惊叹！' 
  },
  { 
    value: 'professional', 
    label: '专业鼓励', 
    example: '例如：你的表现符合专业标准，请保持。' 
  },
  { 
    value: 'humorous', 
    label: '幽默鼓励', 
    example: '例如：哇！简直比超人还厉害！' 
  }
];

// Criticism styles
const criticismStyles = [
  { 
    value: 'constructive', 
    label: '建设性批评', 
    example: '例如：这个地方可以改进，试试这样做...' 
  },
  { 
    value: 'direct', 
    label: '直接批评', 
    example: '例如：这里做得不够好，需要重新调整。' 
  },
  { 
    value: 'gentle', 
    label: '委婉批评', 
    example: '例如：或许我们可以尝试另一种方式？' 
  },
  { 
    value: 'coaching', 
    label: '教练式批评', 
    example: '例如：思考一下，这样做的结果会怎样？' 
  }
];

// Select encouragement style
const selectEncouragementStyle = (value) => {
  localData.value.encouragementStyle = value;
  updateData();
};

// Select criticism style
const selectCriticismStyle = (value) => {
  localData.value.criticismStyle = value;
  updateData();
};

// Update parent form data
const updateData = () => {
  emit('update:formData', { ...localData.value });
};

// Form validation
const isFormValid = computed(() => {
  return (
    localData.value.textPrompt.trim() !== '' && 
    localData.value.encouragementStyle !== '' && 
    localData.value.criticismStyle !== ''
  );
});

// Next step handler
const nextStep = () => {
  if (isFormValid.value) {
    emit('next-step');
  }
};
</script>

<style scoped>
.info-step-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px;
  color: var(--app-primary, #0A84FF);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
}

.form-textarea {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--app-primary, #0A84FF);
}

.style-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.style-option {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.style-option:hover {
  border-color: var(--app-primary, #0A84FF);
  background-color: rgba(10, 132, 255, 0.05);
}

.style-option.selected {
  border-color: var(--app-primary, #0A84FF);
  background-color: rgba(10, 132, 255, 0.1);
}

.style-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.style-example {
  font-size: 12px;
  color: #757575;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-next {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--app-primary, #0A84FF);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-next:hover {
  background-color: rgba(10, 132, 255, 0.8);
}

.btn-next:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 12px;
}

/* Dark mode adaptations */
@media (prefers-color-scheme: dark) {
  .form-textarea {
    background-color: #2C2C2E;
    border-color: #3A3A3C;
    color: white;
  }
  
  .style-option {
    background-color: #2C2C2E;
    border-color: #3A3A3C;
    color: white;
  }
  
  .style-example {
    color: #AAAAAA;
  }
  
  .style-option:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .style-option.selected {
    background-color: rgba(10, 132, 255, 0.2);
  }
}
</style> 