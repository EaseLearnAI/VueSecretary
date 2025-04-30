<template>
  <div class="voice-setting-modal-overlay" @click="closeModal"></div>
  <div class="voice-setting-modal">
    <div class="voice-setting-header">
      <h2 class="voice-setting-title">个性化语音合成</h2>
      <button class="close-button" @click="$emit('close')">
        <font-awesome-icon icon="times" />
      </button>
    </div>
    
    <StepIndicator :currentStep="currentStep" :steps="steps" />
    
    <div class="voice-setting-content">
      <!-- Step 1: Information Form -->
      <InfoStepForm 
        v-if="currentStep === 1" 
        :formData="formData" 
        @update:formData="updateFormData" 
        @next-step="nextStep" 
      />
      
      <!-- Step 2: Audio Upload -->
      <AudioUploadForm 
        v-if="currentStep === 2" 
        :formData="formData" 
        @update:formData="updateFormData" 
        @next-step="nextStep" 
        @prev-step="prevStep" 
      />
      
      <!-- Step 3: Voice Selection -->
      <VoiceSelectionForm 
        v-if="currentStep === 3" 
        :formData="formData" 
        @update:formData="updateFormData" 
        @next-step="nextStep" 
        @prev-step="prevStep" 
      />
      
      <!-- Step 4: Generate and Listen -->
      <GenerateAndListenForm 
        v-if="currentStep === 4" 
        :formData="formData" 
        @update:formData="updateFormData" 
        @prev-step="prevStep" 
        @finish="finishProcess" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import StepIndicator from './StepIndicator.vue';
import InfoStepForm from './InfoStepForm.vue';
import AudioUploadForm from './AudioUploadForm.vue';
import VoiceSelectionForm from './VoiceSelectionForm.vue';
import GenerateAndListenForm from './GenerateAndListenForm.vue';

// Define props and emits
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'update:show']);

// Steps configuration
const steps = [
  { id: 1, name: '填写信息' },
  { id: 2, name: '音频上传' },
  { id: 3, name: '音色选择' },
  { id: 4, name: '生成与试听' }
];

// Current step state
const currentStep = ref(1);

// Form data state
const formData = ref({
  textPrompt: '',
  encouragementStyle: '',
  criticismStyle: '',
  audioFile: null,
  selectedVoice: null,
  generatedAudio: null,
});

// Methods
const closeModal = (event) => {
  // Close only if clicking directly on the overlay
  if (event.target === event.currentTarget) {
    emit('close');
    emit('update:show', false);
  }
};

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const updateFormData = (newData) => {
  formData.value = { ...formData.value, ...newData };
};

const finishProcess = () => {
  // Reset the form and close the modal
  currentStep.value = 1;
  formData.value = {
    textPrompt: '',
    encouragementStyle: '',
    criticismStyle: '',
    audioFile: null,
    selectedVoice: null,
    generatedAudio: null,
  };
  emit('close');
  emit('update:show', false);
};
</script>

<style scoped>
.voice-setting-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.voice-setting-modal {
  width: 90%;
  max-width: 500px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1001;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.voice-setting-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voice-setting-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 5px;
}

.close-button:hover {
  color: #333;
}

.voice-setting-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

/* Dark mode adaptations */
@media (prefers-color-scheme: dark) {
  .voice-setting-modal {
    background-color: #2C2C2E;
    color: white;
  }
  
  .voice-setting-header {
    border-bottom-color: #3A3A3C;
  }
  
  .close-button {
    color: #CCCCCC;
  }
  
  .close-button:hover {
    color: white;
  }
}
</style> 