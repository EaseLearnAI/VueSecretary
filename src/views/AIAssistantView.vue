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
          <MessageItem 
            :message="message"
            @update:event="updateEvent"
            @update:task="updateTask"
            @update:habit="updateHabit"
          />
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
              :disabled="!userInput.trim() || isAnalyzing" 
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
import MessageItem from '../components/AIAssistant/MessageItem.vue';
import { analyzeInput } from '../services/aiService';

// Messages state
const messages = ref([]);
const userInput = ref('');
const messagesContainer = ref(null);
const isAnalyzing = ref(false);

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
      content: '你好！我是你的AI秘书，可以帮助你管理日程、创建任务，以及设置提醒。你可以直接告诉我你需要什么帮助，或者点击右上角的设置来个性化我的语音。',
      timestamp: new Date()
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
const sendMessage = async () => {
  if (!userInput.value.trim() || isAnalyzing.value) return;
  
  // Add user message
  addMessage({
    type: 'user',
    content: userInput.value,
    timestamp: new Date()
  });
  
  // Clear input
  const input = userInput.value;
  userInput.value = '';
  
  // Set analyzing state
  isAnalyzing.value = true;
  
  // Add AI analyzing indicator
  addMessage({
    type: 'ai',
    isAnalyzing: true,
    timestamp: new Date()
  });
  
  try {
    // Call AI service to analyze input
    const analysisResult = await analyzeInput(input);
    
    // Remove analyzing message
    messages.value.pop();
    
    // Check if analysis was successful
    if (analysisResult.success) {
      // Create a structured message with the analysis results
      const aiMessage = {
        type: 'ai',
        content: '我已分析完成：',
        timestamp: new Date(),
        cards: {
          events: analysisResult.data.events || [],
          tasks: analysisResult.data.tasks || [],
          habits: analysisResult.data.habits || []
        }
      };
      
      // Customize message based on analysis
      if (analysisResult.data.events.length > 0 && analysisResult.data.tasks.length === 0 && analysisResult.data.habits.length === 0) {
        aiMessage.content = '我已整理出您的事件安排：';
      } else if (analysisResult.data.tasks.length > 0 && analysisResult.data.events.length === 0 && analysisResult.data.habits.length === 0) {
        aiMessage.content = '我已为您拆解任务：';
      } else if (analysisResult.data.habits.length > 0 && analysisResult.data.events.length === 0 && analysisResult.data.tasks.length === 0) {
        aiMessage.content = '我已为您制定习惯养成计划：';
      } else if (analysisResult.data.events.length === 0 && analysisResult.data.tasks.length === 0 && analysisResult.data.habits.length === 0) {
        aiMessage.content = '我没有识别出任何事件、任务或习惯。您可以尝试更具体地描述，例如："明天上午10点开会"或"我想开始每天健身"。';
        delete aiMessage.cards;
      }
      
      addMessage(aiMessage);
    } else {
      // Handle analysis failure
      addMessage({
        type: 'ai',
        content: '抱歉，我在分析您的输入时遇到了问题。请您尝试重新描述一下，或者换一种表达方式。',
        timestamp: new Date()
      });
      console.error('Analysis error:', analysisResult.error);
    }
  } catch (error) {
    // Handle API errors
    console.error('API error:', error);
    addMessage({
      type: 'ai',
      content: '抱歉，服务暂时不可用。请稍后再试。',
      timestamp: new Date()
    });
  } finally {
    // Reset analyzing state
    isAnalyzing.value = false;
  }
};

// Event and task update handlers
const updateEvent = (eventData) => {
  console.log('Event update:', eventData);
  
  if (eventData.action === 'delete') {
    // Show confirmation message
    addMessage({
      type: 'ai',
      content: `已删除事件「${eventData.title}」`,
      timestamp: new Date()
    });
  } else if (eventData.action === 'edit') {
    // In a real app, this would open an edit form or redirect to event edit page
    console.log('Editing event:', eventData);
  } else {
    // Import event
    addMessage({
      type: 'ai',
      content: `✓ 已将事件「${eventData.title}」添加到您的日程安排！`,
      timestamp: new Date()
    });
  }
};

const updateTask = (taskData) => {
  console.log('Task update:', taskData);
  
  if (taskData.action === 'delete') {
    // Show confirmation message
    addMessage({
      type: 'ai',
      content: `已删除任务「${taskData.title}」`,
      timestamp: new Date()
    });
  } else if (taskData.action === 'edit') {
    // In a real app, this would open an edit form or redirect to task edit page
    console.log('Editing task:', taskData);
  } else if (taskData.action === 'complete') {
    // Mark task as complete
    addMessage({
      type: 'ai',
      content: `✓ 已将任务「${taskData.title}」标记为完成！`,
      timestamp: new Date()
    });
  } else {
    // Import task
    addMessage({
      type: 'ai',
      content: `✓ 已将任务「${taskData.title}」添加到您的待办事项！`,
      timestamp: new Date()
    });
  }
};

const updateHabit = (habitData) => {
  console.log('Habit update:', habitData);
  
  if (habitData.action === 'delete') {
    // Show confirmation message
    addMessage({
      type: 'ai',
      content: `已删除习惯「${habitData.title}」`,
      timestamp: new Date()
    });
  } else if (habitData.action === 'edit') {
    // In a real app, this would open an edit form or redirect to habit edit page
    console.log('Editing habit:', habitData);
  } else {
    // Import habit
    addMessage({
      type: 'ai',
      content: `✓ 已将习惯「${habitData.title}」添加到您的习惯追踪！从今天开始，我会帮您记录这个习惯的养成进度。`,
      timestamp: new Date()
    });
  }
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
    content: '正在处理你的语音样本...',
    timestamp: new Date()
  };
  addMessage(processingMessage);
  
  // Simulate processing delay
  setTimeout(() => {
    // Update the message
    const index = messages.value.indexOf(processingMessage);
    messages.value[index] = {
      type: 'ai',
      content: `✓ 成功创建个性化语音「${voiceName.value}」！从现在起，我会用这个声音与你交流。`,
      timestamp: new Date()
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