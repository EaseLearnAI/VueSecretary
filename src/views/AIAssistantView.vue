<template>
  <BaseLayout title="AI 秘书">
    <div class="ai-assistant-container">
      <!-- Chat messages area -->
      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          :class="['message', message.type]"
        >
          <div class="message-avatar">
            <div v-if="message.type === 'ai'" class="ai-avatar">
              <font-awesome-icon icon="robot" />
            </div>
            <div v-else class="user-avatar">
              <font-awesome-icon icon="user" />
            </div>
          </div>
          <div class="message-content">
            <div v-if="message.type === 'ai' && message.isAnalyzing" class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div v-else-if="message.type === 'ai' && message.taskCard" class="task-card">
              <div class="task-card-header">
                <font-awesome-icon :icon="message.taskCard.icon" class="task-card-icon" />
                <div class="task-card-title">{{ message.taskCard.title }}</div>
              </div>
              <div class="task-card-details">
                <div class="task-card-detail">
                  <font-awesome-icon icon="calendar" class="detail-icon" />
                  <span>{{ message.taskCard.date }}</span>
                </div>
                <div class="task-card-detail">
                  <font-awesome-icon icon="clock" class="detail-icon" />
                  <span>{{ message.taskCard.time }}</span>
                </div>
                <div v-if="message.taskCard.location" class="task-card-detail">
                  <font-awesome-icon icon="location-dot" class="detail-icon" />
                  <span>{{ message.taskCard.location }}</span>
                </div>
              </div>
              <div class="task-card-actions">
                <button class="task-card-btn" @click="editTask(message.taskCard)">
                  <font-awesome-icon icon="pen" class="btn-icon" />
                  编辑
                </button>
                <button class="task-card-btn primary" @click="importTask(message.taskCard)">
                  <font-awesome-icon icon="check" class="btn-icon" />
                  确认导入
                </button>
              </div>
            </div>
            <div v-else class="message-text" v-html="formatMessage(message.text)"></div>
            <div v-if="message.type === 'ai'" class="message-time">{{ message.time }}</div>
          </div>
        </div>
      </div>
      
      <!-- Input area -->
      <div class="input-container">
        <div class="input-area">
          <textarea 
            v-model="userInput" 
            class="message-input" 
            placeholder="发送消息..." 
            @keyup.enter="sendMessage" 
            ref="inputField"
            rows="1"
          ></textarea>
          
          <div class="input-actions">
            <button 
              class="voice-btn"
              :class="{ recording: isRecording }"
              @click="toggleVoiceInput"
            >
              <font-awesome-icon :icon="isRecording ? 'stop' : 'microphone'" />
            </button>
            
            <button 
              class="send-btn"
              :disabled="!userInput.trim()" 
              @click="sendMessage"
            >
              <font-awesome-icon icon="paper-plane" />
            </button>
          </div>
        </div>
        
        <div class="voice-assistant-info" v-if="hasCustomVoice">
          <font-awesome-icon icon="info-circle" class="voice-info-icon" />
          <span>个性化语音已启用</span>
        </div>
      </div>
    </div>
    
    <!-- Voice customization modal -->
    <ModalContainer v-model="showVoiceModal" title="创建个性化语音助手">
      <div class="voice-modal-content">
        <p class="voice-info">上传10-20秒的语音示例，AI将复制声音风格创建个性化助手</p>
        
        <div class="voice-upload-area" @click="triggerFileInput" :class="{ 'has-file': voiceFile }">
          <input 
            type="file" 
            ref="fileInput" 
            accept="audio/*" 
            class="file-input"
            @change="handleFileChange"
          />
          <div v-if="!voiceFile" class="upload-placeholder">
            <font-awesome-icon icon="cloud-arrow-up" class="upload-icon" />
            <div>点击上传语音文件</div>
          </div>
          <div v-else class="file-info">
            <font-awesome-icon icon="file-audio" class="file-icon" />
            <div class="file-name">{{ voiceFile.name }}</div>
            <button class="remove-file-btn" @click.stop="removeFile">
              <font-awesome-icon icon="times" />
            </button>
          </div>
        </div>
        
        <div class="voice-settings">
          <div class="voice-setting-item">
            <label>音色名称</label>
            <input 
              type="text" 
              v-model="voiceName" 
              class="voice-input" 
              placeholder="例如：我的语音助手"
            />
          </div>
          
          <div class="voice-setting-item">
            <label>提示词风格</label>
            <el-select v-model="voiceStyle" placeholder="选择提示词风格" class="voice-select">
              <el-option label="亲切友好" value="friendly" />
              <el-option label="简洁专业" value="professional" />
              <el-option label="幽默活泼" value="humorous" />
              <el-option label="温柔关怀" value="caring" />
            </el-select>
          </div>
        </div>
      </div>
      
      <template #footer>
        <button class="btn btn-secondary" @click="closeVoiceModal">取消</button>
        <button 
          class="btn btn-primary" 
          :disabled="!voiceFile || !voiceName" 
          @click="createCustomVoice"
        >
          创建
        </button>
      </template>
    </ModalContainer>
  </BaseLayout>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import BaseLayout from '../components/layout/BaseLayout.vue';
import ModalContainer from '../components/layout/ModalContainer.vue';

// Messages state
const messages = ref([]);
const userInput = ref('');
const messagesContainer = ref(null);

// Voice input state
const isRecording = ref(false);
const hasCustomVoice = ref(false);

// Voice customization
const showVoiceModal = ref(false);
const voiceFile = ref(null);
const voiceName = ref('');
const voiceStyle = ref('friendly');
const fileInput = ref(null);

// Welcome message
onMounted(() => {
  // Add welcome message with a small delay
  setTimeout(() => {
    addMessage({
      type: 'ai',
      text: '你好！我是你的AI秘书，可以帮助你管理日程、创建任务，以及设置提醒。你可以直接告诉我你需要什么帮助，或者点击右上角的设置来个性化我的语音。',
      time: formatTime(new Date())
    });
  }, 500);
  
  // Check if there's already a custom voice
  // In a real app, this would come from an API or local storage
  const hasVoice = localStorage.getItem('hasCustomVoice');
  if (hasVoice) {
    hasCustomVoice.value = true;
  } else {
    // Show customization modal after a delay
    setTimeout(() => {
      showVoiceModal.value = true;
    }, 1500);
  }
});

// Auto-scroll to bottom when messages change
watch(messages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
});

// Helper function to add a message
const addMessage = (message) => {
  messages.value.push(message);
};

// Send a user message
const sendMessage = () => {
  if (!userInput.value.trim()) return;
  
  // Add user message
  addMessage({
    type: 'user',
    text: userInput.value
  });
  
  // Clear input
  const input = userInput.value;
  userInput.value = '';
  
  // Add AI analyzing indicator
  addMessage({
    type: 'ai',
    isAnalyzing: true
  });
  
  // Simulate AI processing
  setTimeout(() => {
    // Remove analyzing message
    messages.value.pop();
    
    // Check if input looks like a task
    if (input.includes('提醒') || input.includes('安排') || input.includes('会议') || input.includes('任务')) {
      // Add task card
      addMessage({
        type: 'ai',
        text: '我已经为你解析了任务信息：',
        time: formatTime(new Date()),
        taskCard: createTaskFromInput(input)
      });
    } else {
      // Regular response
      addMessage({
        type: 'ai',
        text: getAIResponse(input),
        time: formatTime(new Date())
      });
    }
  }, 1500);
};

// Generate AI response based on user input
const getAIResponse = (input) => {
  // Simple response logic for demo
  if (input.includes('你好') || input.includes('嗨') || input.includes('hi')) {
    return '你好！有什么我可以帮你的吗？';
  } else if (input.includes('天气')) {
    return '今天天气晴朗，温度25°C，是个适合外出的好日子。';
  } else if (input.includes('谢谢')) {
    return '不客气，随时为你服务！';
  } else {
    return '我理解了。你可以尝试告诉我需要创建的任务，例如："提醒我明天下午3点参加项目会议"，我会帮你设置。';
  }
};

// Create a task object from user input
const createTaskFromInput = (input) => {
  // In a real app, this would use NLP to extract task details
  // For demo purposes, we'll use a simple example
  
  let title, date, time, location, icon;
  
  if (input.includes('会议')) {
    title = '项目会议';
    date = '明天';
    time = '15:00 - 16:30';
    location = '会议室A';
    icon = 'users';
  } else if (input.includes('提醒')) {
    title = '重要提醒';
    date = '今天';
    time = '18:00';
    location = '';
    icon = 'bell';
  } else {
    title = '新任务';
    date = '今天';
    time = '12:00';
    location = '';
    icon = 'check-circle';
  }
  
  return { title, date, time, location, icon };
};

// Voice input toggling
const toggleVoiceInput = () => {
  isRecording.value = !isRecording.value;
  
  if (isRecording.value) {
    // Start recording
    // In a real app, this would use the Web Audio API
    console.log('Started recording');
    
    // For demo, automatically stop after 3 seconds
    setTimeout(() => {
      isRecording.value = false;
      
      // Simulate voice input
      userInput.value = '提醒我明天下午三点参加项目会议';
    }, 3000);
  } else {
    // Stop recording
    console.log('Stopped recording');
  }
};

// Voice customization modal
const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    voiceFile.value = file;
  }
};

const removeFile = () => {
  voiceFile.value = null;
  fileInput.value.value = ''; // Reset file input
};

const closeVoiceModal = () => {
  showVoiceModal.value = false;
  voiceFile.value = null;
  voiceName.value = '';
};

const createCustomVoice = () => {
  // In a real app, this would upload the file to the server
  // and process it with a voice cloning API
  
  // For demo purposes, we'll simulate success
  console.log(`Creating custom voice: ${voiceName.value}`);
  
  // Show loading state
  const processingMessage = {
    type: 'ai',
    text: '正在处理你的语音样本...',
    time: formatTime(new Date())
  };
  addMessage(processingMessage);
  
  // Simulate processing delay
  setTimeout(() => {
    // Update the message
    const index = messages.value.indexOf(processingMessage);
    messages.value[index] = {
      type: 'ai',
      text: `✓ 成功创建个性化语音「${voiceName.value}」！从现在起，我会用这个声音与你交流。`,
      time: formatTime(new Date())
    };
    
    // Set as having custom voice
    hasCustomVoice.value = true;
    localStorage.setItem('hasCustomVoice', 'true');
    
    // Close modal
    showVoiceModal.value = false;
    
    // Reset voice creation form
    voiceFile.value = null;
    voiceName.value = '';
  }, 3000);
};

// Task actions
const editTask = (task) => {
  console.log('Editing task:', task);
  // In a real app, this would open an edit form
};

const importTask = (task) => {
  console.log('Importing task:', task);
  
  // Add confirmation message
  addMessage({
    type: 'ai',
    text: `✓ 已将「${task.title}」添加到你的任务列表！`,
    time: formatTime(new Date())
  });
};

// Helper functions
const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const formatMessage = (text) => {
  // Convert links, etc.
  return text;
};
</script>

<style scoped>
.ai-assistant-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height) - var(--nav-height));
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease forwards;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  margin: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background-color: var(--app-primary);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  background-color: var(--app-secondary);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-content {
  max-width: 70%;
}

.ai .message-content {
  background-color: white;
  border-radius: 18px 18px 18px 4px;
  padding: 12px 16px;
  box-shadow: var(--app-shadow);
}

.user .message-content {
  background-color: var(--app-primary);
  color: white;
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
  margin-right: 8px;
}

.message-text {
  font-size: 15px;
  line-height: 1.4;
}

.message-time {
  text-align: right;
  font-size: 12px;
  color: var(--app-gray);
  margin-top: 4px;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  padding: 8px 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--app-gray);
  margin: 0 2px;
  animation: bounce 1s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}

/* Task card */
.task-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 8px 0;
}

.task-card-header {
  background-color: var(--app-primary);
  color: white;
  padding: 12px;
  display: flex;
  align-items: center;
}

.task-card-icon {
  margin-right: 8px;
}

.task-card-title {
  font-weight: 600;
}

.task-card-details {
  padding: 12px;
}

.task-card-detail {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.task-card-detail:last-child {
  margin-bottom: 0;
}

.detail-icon {
  width: 16px;
  margin-right: 8px;
  color: var(--app-gray);
}

.task-card-actions {
  display: flex;
  border-top: 1px solid var(--app-border);
}

.task-card-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.task-card-btn:first-child {
  border-right: 1px solid var(--app-border);
}

.task-card-btn.primary {
  color: var(--app-primary);
  font-weight: 600;
}

.btn-icon {
  margin-right: 4px;
}

/* Input area */
.input-container {
  padding: 16px;
  background-color: var(--app-light);
  border-top: 1px solid var(--app-border);
}

.input-area {
  display: flex;
  background-color: white;
  border-radius: 24px;
  padding: 8px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.message-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px 0;
  resize: none;
  max-height: 120px;
  font-size: 16px;
  font-family: inherit;
}

.input-actions {
  display: flex;
  align-items: center;
}

.voice-btn, .send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--app-gray);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.voice-btn:hover, .send-btn:hover {
  background-color: var(--app-light);
}

.voice-btn.recording {
  color: var(--app-danger);
  animation: pulse 1s infinite;
}

.send-btn {
  color: var(--app-primary);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.voice-assistant-info {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--app-gray);
  margin-top: 8px;
}

.voice-info-icon {
  margin-right: 4px;
}

/* Voice customization modal content */
.voice-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.voice-info {
  color: var(--app-gray);
  margin: 0;
  font-size: 14px;
}

.voice-upload-area {
  border: 2px dashed var(--app-border);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.voice-upload-area:hover {
  background-color: var(--app-light);
}

.voice-upload-area.has-file {
  border-color: var(--app-primary);
  background-color: rgba(0, 122, 255, 0.05);
}

.file-input {
  display: none;
}

.upload-placeholder {
  color: var(--app-gray);
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon {
  color: var(--app-primary);
  margin-right: 8px;
}

.file-name {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file-btn {
  background: none;
  border: none;
  color: var(--app-danger);
  cursor: pointer;
  padding: 4px;
}

.voice-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.voice-setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.voice-setting-item label {
  font-weight: 500;
  font-size: 14px;
}

.voice-input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--app-border);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.voice-input:focus {
  border-color: var(--app-primary);
}

.voice-select {
  width: 100%;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .ai .message-content {
    background-color: #2C2C2E;
  }
  
  .user .message-content {
    background-color: #0A84FF;
  }
  
  .input-area {
    background-color: #2C2C2E;
  }
  
  .message-input {
    background-color: transparent;
    color: white;
  }
  
  .voice-upload-area:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .voice-upload-area.has-file {
    background-color: rgba(10, 132, 255, 0.1);
  }
  
  .task-card {
    background-color: #2C2C2E;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 