<template>
  <div class="generate-listen-form">
    <h3 class="form-section-title">语音生成与试听</h3>
    <p class="form-description">生成个性化语音并试听效果</p>
    
    <div class="summary-section">
      <h4 class="summary-title">配置信息</h4>
      
      <div class="summary-item">
        <div class="summary-label">文本提示词</div>
        <div class="summary-value">{{ formData.textPrompt }}</div>
      </div>
      
      <div class="summary-item">
        <div class="summary-label">鼓励风格</div>
        <div class="summary-value">{{ getEncouragementLabel(formData.encouragementStyle) }}</div>
      </div>
      
      <div class="summary-item">
        <div class="summary-label">批评风格</div>
        <div class="summary-value">{{ getCriticismLabel(formData.criticismStyle) }}</div>
      </div>
      
      <div class="summary-item">
        <div class="summary-label">音色</div>
        <div class="summary-value">{{ getVoiceName() }}</div>
      </div>
    </div>
    
    <div class="generate-section" v-if="!isGenerated">
      <div class="generate-info" v-if="!isGenerating">
        <font-awesome-icon icon="info-circle" class="info-icon" />
        <span>点击下方按钮开始生成您的个性化语音合成</span>
      </div>
      
      <div class="progress-indicator" v-else>
        <div class="progress-steps">
          <div 
            class="progress-step" 
            :class="{ 
              'active': currentProgress >= 1,
              'completed': currentProgress > 1
            }"
          >
            <div class="progress-icon">
              <font-awesome-icon v-if="currentProgress > 1" icon="check" />
              <span v-else>1</span>
            </div>
            <div class="progress-label">音色克隆</div>
          </div>
          
          <div class="progress-step-line"></div>
          
          <div 
            class="progress-step" 
            :class="{ 
              'active': currentProgress >= 2,
              'completed': currentProgress > 2
            }"
          >
            <div class="progress-icon">
              <font-awesome-icon v-if="currentProgress > 2" icon="check" />
              <span v-else>2</span>
            </div>
            <div class="progress-label">文本生成</div>
          </div>
          
          <div class="progress-step-line"></div>
          
          <div 
            class="progress-step" 
            :class="{ 
              'active': currentProgress >= 3,
              'completed': currentProgress > 3
            }"
          >
            <div class="progress-icon">
              <font-awesome-icon v-if="currentProgress > 3" icon="check" />
              <span v-else>3</span>
            </div>
            <div class="progress-label">语音合成</div>
          </div>
        </div>
        
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        
        <div class="progress-status">{{ progressStatus }}</div>
      </div>
      
      <button 
        class="generate-btn" 
        @click="startGeneration"
        :disabled="isGenerating"
      >
        <font-awesome-icon icon="magic" class="btn-icon" />
        {{ isGenerating ? '生成中...' : '开始生成' }}
      </button>
    </div>
    
    <div class="listen-section" v-else>
      <div class="generation-success">
        <font-awesome-icon icon="check-circle" class="success-icon" />
        <span>个性化语音生成成功！</span>
      </div>
      
      <div class="audio-player">
        <div class="player-row">
          <button class="play-btn" @click="togglePlayback">
            <font-awesome-icon :icon="isPlaying ? 'pause' : 'play'" />
          </button>
          
          <div class="player-timeline">
            <div class="timeline-progress" :style="{ width: playbackPercentage + '%' }"></div>
          </div>
          
          <div class="player-time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>
        </div>
        
        <audio 
          ref="audioPlayer" 
          @timeupdate="updatePlaybackTime"
          @loadedmetadata="onAudioLoaded"
          @ended="onAudioEnded"
        >
          <source :src="generatedAudioUrl" type="audio/mpeg">
          您的浏览器不支持音频播放器
        </audio>
      </div>
      
      <div class="download-section">
        <button class="download-btn" @click="downloadAudio">
          <font-awesome-icon icon="download" class="btn-icon" />
          下载音频
        </button>
      </div>
      
      <div class="save-voice-section">
        <h4 class="save-title">保存此音色</h4>
        <p class="save-info">将此音色保存到您的账户中，以便将来使用</p>
        
        <div class="form-group">
          <label class="form-label">音色名称</label>
          <input 
            type="text" 
            class="form-input" 
            v-model="saveVoiceName" 
            placeholder="给此音色起一个名字"
          />
        </div>
        
        <button 
          class="save-btn" 
          @click="saveVoice"
          :disabled="!saveVoiceName.trim() || isSaving"
        >
          <font-awesome-icon icon="save" class="btn-icon" />
          {{ isSaving ? '保存中...' : '保存音色' }}
        </button>
      </div>
    </div>
    
    <div class="form-actions">
      <button class="btn-back" @click="$emit('prev-step')">
        <font-awesome-icon icon="arrow-left" class="btn-icon" />
        上一步
      </button>
      
      <button 
        class="btn-done" 
        @click="finishProcess"
        v-if="isGenerated"
      >
        完成
        <font-awesome-icon icon="check" class="btn-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:formData', 'prev-step', 'finish']);

// Audio player references
const audioPlayer = ref(null);

// Generation state
const isGenerating = ref(false);
const isGenerated = ref(false);
const currentProgress = ref(0);
const progressStatus = ref('准备中...');
const generatedAudioUrl = ref('');

// Mock generation data
const mockAudioUrl = 'https://example.com/generated-voice.mp3';

// Playback state
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const playbackPercentage = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

// Save state
const saveVoiceName = ref('');
const isSaving = ref(false);

// Progress percentage
const progressPercentage = computed(() => {
  return Math.min((currentProgress.value / 3) * 100, 100);
});

// Audio event handlers
const updatePlaybackTime = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime;
  }
};

const onAudioLoaded = () => {
  if (audioPlayer.value) {
    duration.value = audioPlayer.value.duration;
  }
};

const onAudioEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = 0;
  }
};

// Clean up on component destruction
onBeforeUnmount(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
  }
});

// Format time (mm:ss)
const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Get encouragement style label
const getEncouragementLabel = (value) => {
  const styles = {
    'gentle': '温和鼓励',
    'enthusiastic': '热情鼓励',
    'professional': '专业鼓励',
    'humorous': '幽默鼓励'
  };
  
  return styles[value] || value;
};

// Get criticism style label
const getCriticismLabel = (value) => {
  const styles = {
    'constructive': '建设性批评',
    'direct': '直接批评',
    'gentle': '委婉批评',
    'coaching': '教练式批评'
  };
  
  return styles[value] || value;
};

// Get voice name
const getVoiceName = () => {
  if (!props.formData.selectedVoice) return '';
  
  return props.formData.selectedVoice.name;
};

// Toggle audio playback
const togglePlayback = () => {
  if (!audioPlayer.value) return;
  
  if (isPlaying.value) {
    audioPlayer.value.pause();
    isPlaying.value = false;
  } else {
    audioPlayer.value.play()
      .then(() => {
        isPlaying.value = true;
      })
      .catch(err => {
        console.error('Error playing audio:', err);
      });
  }
};

// Simulate generation process
const startGeneration = async () => {
  isGenerating.value = true;
  currentProgress.value = 0;
  
  // Step 1: Voice cloning
  progressStatus.value = '正在克隆音色...';
  currentProgress.value = 1;
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Text generation
  progressStatus.value = '正在生成文本...';
  currentProgress.value = 2;
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 3: Voice synthesis
  progressStatus.value = '正在合成语音...';
  currentProgress.value = 3;
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Complete
  progressStatus.value = '生成完成！';
  currentProgress.value = 4;
  
  // Set generated state and URL
  generatedAudioUrl.value = mockAudioUrl;
  isGenerated.value = true;
  isGenerating.value = false;
  
  // Update parent data
  emit('update:formData', {
    ...props.formData,
    generatedAudio: mockAudioUrl
  });
};

// Download generated audio
const downloadAudio = () => {
  // In a real app, this would trigger a download of the generated audio
  const link = document.createElement('a');
  link.href = mockAudioUrl;
  link.download = '个性化语音.mp3';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Save voice to account
const saveVoice = async () => {
  if (!saveVoiceName.value.trim()) return;
  
  isSaving.value = true;
  
  // Simulating API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Show success message
  alert(`音色"${saveVoiceName.value}"已保存！`);
  
  isSaving.value = false;
  saveVoiceName.value = '';
};

// Finish process
const finishProcess = () => {
  emit('finish');
};
</script>

<style scoped>
.generate-listen-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px;
  color: var(--app-primary, #0A84FF);
}

.form-description {
  font-size: 14px;
  color: #757575;
  margin: 0 0 10px;
}

.summary-section {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
}

.summary-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
}

.summary-item {
  display: flex;
  margin-bottom: 10px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  width: 80px;
  font-weight: 500;
  font-size: 14px;
  color: #757575;
}

.summary-value {
  flex: 1;
  font-size: 14px;
}

.generate-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.generate-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.info-icon {
  color: var(--app-primary, #0A84FF);
}

.progress-indicator {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 1;
}

.progress-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #757575;
}

.progress-step.active .progress-icon {
  background-color: var(--app-primary, #0A84FF);
  color: white;
}

.progress-step.completed .progress-icon {
  background-color: #4CAF50;
  color: white;
}

.progress-label {
  font-size: 12px;
  color: #757575;
}

.progress-step.active .progress-label {
  color: var(--app-primary, #0A84FF);
  font-weight: 500;
}

.progress-step.completed .progress-label {
  color: #4CAF50;
  font-weight: 500;
}

.progress-step-line {
  flex: 1;
  height: 2px;
  background-color: #e0e0e0;
  position: relative;
  margin: 0 5px;
  top: -13px;
  z-index: 0;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--app-primary, #0A84FF);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-status {
  text-align: center;
  font-size: 14px;
  color: #757575;
}

.generate-btn {
  background-color: var(--app-primary, #0A84FF);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.generate-btn:hover {
  background-color: rgba(10, 132, 255, 0.8);
}

.generate-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.listen-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.generation-success {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(76, 175, 80, 0.1);
  border: 1px solid #4CAF50;
  border-radius: 8px;
  padding: 12px;
}

.success-icon {
  color: #4CAF50;
  font-size: 18px;
}

.audio-player {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
  padding: 16px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--app-primary, #0A84FF);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.play-btn:hover {
  transform: scale(1.05);
  background-color: rgba(10, 132, 255, 0.8);
}

.player-timeline {
  flex: 1;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.timeline-progress {
  height: 100%;
  background-color: var(--app-primary, #0A84FF);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.player-time {
  font-size: 12px;
  color: #757575;
  width: 90px;
  text-align: right;
}

.download-section {
  display: flex;
  justify-content: center;
}

.download-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.download-btn:hover {
  background-color: rgba(76, 175, 80, 0.8);
}

.save-voice-section {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 16px;
}

.save-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px;
}

.save-info {
  font-size: 12px;
  color: #757575;
  margin: 0 0 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
}

.form-input {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: var(--app-primary, #0A84FF);
}

.save-btn {
  width: 100%;
  background-color: #616161;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.save-btn:hover {
  background-color: #424242;
}

.save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.btn-back, .btn-done {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back {
  background-color: #f5f5f5;
  color: #616161;
}

.btn-back:hover {
  background-color: #e0e0e0;
}

.btn-done {
  background-color: #4CAF50;
  color: white;
}

.btn-done:hover {
  background-color: rgba(76, 175, 80, 0.8);
}

.btn-icon {
  font-size: 12px;
}

/* Dark mode adaptations */
@media (prefers-color-scheme: dark) {
  .form-description {
    color: #AAAAAA;
  }
  
  .summary-section {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .summary-label {
    color: #AAAAAA;
  }
  
  .progress-icon {
    background-color: #3A3A3C;
    color: #CCCCCC;
  }
  
  .progress-label {
    color: #AAAAAA;
  }
  
  .progress-step-line {
    background-color: #3A3A3C;
  }
  
  .progress-bar {
    background-color: #3A3A3C;
  }
  
  .progress-status {
    color: #AAAAAA;
  }
  
  .audio-player {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .player-timeline {
    background-color: #3A3A3C;
  }
  
  .player-time {
    color: #AAAAAA;
  }
  
  .save-info {
    color: #AAAAAA;
  }
  
  .form-input {
    background-color: #2C2C2E;
    border-color: #3A3A3C;
    color: white;
  }
  
  .save-voice-section {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .btn-back {
    background-color: #3A3A3C;
    color: #CCCCCC;
  }
  
  .btn-back:hover {
    background-color: #4A4A4C;
  }
}
</style> 