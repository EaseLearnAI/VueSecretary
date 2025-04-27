<template>
  <div class="ai-assistant">
    <div class="ai-header">
      <div class="ai-title">
        <font-awesome-icon icon="robot" class="ai-icon" />
        <h2>Vue Secretary</h2>
      </div>
      <div class="ai-actions">
        <button class="action-button" @click="clearMessages">
          <font-awesome-icon icon="trash" />
          <span>清空对话</span>
        </button>
      </div>
    </div>
    
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">
          <font-awesome-icon icon="comment-dots" />
        </div>
        <h3>你的个人AI助手</h3>
        <p>你可以询问我关于日程安排、任务管理或习惯养成的问题</p>
        <div class="suggestion-chips">
          <button 
            v-for="(suggestion, index) in suggestions" 
            :key="index" 
            class="suggestion-chip"
            @click="sendSuggestion(suggestion)">
            {{ suggestion }}
          </button>
        </div>
      </div>
      
      <message-item
        v-for="(message, index) in messages"
        :key="index"
        :message="message"
        @update:event="updateEvent"
        @update:task="updateTask"
        @update:habit="updateHabit"
        @import-data="importData"
      />
    </div>
    
    <div class="input-container">
      <div class="input-wrapper">
        <input 
          type="text" 
          v-model="userInput" 
          placeholder="输入消息..." 
          @keyup.enter="sendMessage"
          :disabled="isProcessing"
        />
        <button 
          class="send-button" 
          @click="sendMessage" 
          :disabled="!userInput.trim() || isProcessing">
          <font-awesome-icon icon="paper-plane" />
        </button>
      </div>
      <div class="input-actions">
        <button class="action-button" @click="uploadFile">
          <font-awesome-icon icon="paperclip" />
        </button>
        <button class="action-button" @click="recordVoice">
          <font-awesome-icon icon="microphone" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue';
import MessageItem from './MessageItem.vue';

// Mock data for suggestions
const suggestions = [
  "帮我安排下周的会议",
  "我需要创建一个健身习惯",
  "提醒我明天完成项目报告",
  "我的日程是什么？"
];

const messages = ref([]);
const userInput = ref('');
const isProcessing = ref(false);
const messagesContainer = ref(null);

// Sample initial welcome message
onMounted(() => {
  scrollToBottom();
  // Uncomment if you want an initial welcome message
  // addAIMessage("你好！我是Vue Secretary，你的个人AI助手。我可以帮你管理日程、任务和习惯，有什么我可以帮你的吗？");
});

// Scroll to bottom when messages change
watch(messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });

const scrollToBottom = () => {
  if (messagesContainer.value) {
    const container = messagesContainer.value;
    container.scrollTop = container.scrollHeight;
  }
};

const addUserMessage = (content) => {
  messages.value.push({
    id: Date.now().toString(),
    type: 'user',
    content,
    timestamp: new Date().toISOString(),
  });
};

const addAIMessage = (content, cards = null) => {
  messages.value.push({
    id: Date.now().toString(),
    type: 'ai',
    content,
    timestamp: new Date().toISOString(),
    cards
  });
};

const sendMessage = async () => {
  const input = userInput.value.trim();
  if (!input || isProcessing.value) return;
  
  // Add user message
  addUserMessage(input);
  userInput.value = '';
  
  // Set processing flag
  isProcessing.value = true;
  
  // Simulate API call to AI service
  try {
    // In a real app, this would be an API call to your backend or AI service
    await simulateAIResponse(input);
  } catch (error) {
    console.error('Error processing message:', error);
    addAIMessage('抱歉，处理您的请求时出现了问题。请稍后再试。');
  } finally {
    isProcessing.value = false;
  }
};

const sendSuggestion = (suggestion) => {
  userInput.value = suggestion;
  sendMessage();
};

const clearMessages = () => {
  // In a real app, you might want to show a confirmation dialog
  messages.value = [];
};

const simulateAIResponse = async (input) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Sample responses based on input keywords
  if (input.includes('会议') || input.includes('安排')) {
    const sampleEvents = [
      {
        id: '1',
        title: '团队周会',
        startTime: '2023-06-15T10:00:00',
        endTime: '2023-06-15T11:00:00',
        location: '会议室A',
        description: '讨论本周项目进展和下周计划'
      },
      {
        id: '2',
        title: '客户演示',
        startTime: '2023-06-16T14:30:00',
        endTime: '2023-06-16T15:30:00',
        location: '线上会议',
        description: '向客户展示产品最新功能'
      }
    ];
    
    addAIMessage(
      '我已为您安排了以下会议。您可以点击编辑按钮进行修改：',
      { events: sampleEvents }
    );
  } else if (input.includes('任务') || input.includes('项目')) {
    const sampleTasks = [
      {
        id: '1',
        title: '完成项目报告',
        dueDate: '2023-06-20',
        priority: 'high',
        description: '准备季度项目总结报告',
        completed: false
      },
      {
        id: '2',
        title: '准备演示文稿',
        dueDate: '2023-06-18',
        priority: 'medium',
        description: '为下周的客户会议准备演示幻灯片',
        completed: false
      }
    ];
    
    addAIMessage(
      '我已为您创建了以下任务。您可以根据需要编辑它们：',
      { tasks: sampleTasks }
    );
  } else if (input.includes('习惯') || input.includes('健身')) {
    const sampleHabits = [
      {
        id: '1',
        title: '晨间锻炼',
        frequency: 'daily',
        timeOfDay: '07:00',
        description: '进行30分钟的有氧运动'
      },
      {
        id: '2',
        title: '冥想',
        frequency: 'daily',
        timeOfDay: '22:00',
        description: '睡前进行15分钟的冥想放松'
      }
    ];
    
    addAIMessage(
      '我已为您创建了以下习惯培养计划。您可以点击编辑按钮进行调整：',
      { habits: sampleHabits }
    );
  } else if (input.includes('日程')) {
    const sampleEvents = [
      {
        id: '1',
        title: '项目会议',
        startTime: '2023-06-14T09:30:00',
        endTime: '2023-06-14T10:30:00',
        location: '会议室B',
        description: '讨论项目进度'
      }
    ];
    
    const sampleTasks = [
      {
        id: '1',
        title: '提交周报',
        dueDate: '2023-06-16',
        priority: 'medium',
        description: '总结本周工作内容并提交周报',
        completed: false
      }
    ];
    
    addAIMessage(
      '以下是您近期的日程安排：',
      { 
        events: sampleEvents,
        tasks: sampleTasks
      }
    );
  } else {
    // Default response for other inputs
    addAIMessage(
      '我理解您的需求。请告诉我您需要安排什么类型的活动，创建什么任务，或是养成什么习惯？'
    );
  }
};

// Handlers for updates
const updateEvent = (updatedEvent) => {
  // In a real app, you would save this to your backend/database
  console.log('Event updated:', updatedEvent);
  addAIMessage(`已更新事件: ${updatedEvent.title}`);
};

const updateTask = (updatedTask) => {
  // In a real app, you would save this to your backend/database
  console.log('Task updated:', updatedTask);
  addAIMessage(`已更新任务: ${updatedTask.title}`);
};

const updateHabit = (updatedHabit) => {
  // In a real app, you would save this to your backend/database
  console.log('Habit updated:', updatedHabit);
  addAIMessage(`已更新习惯: ${updatedHabit.title}`);
};

const importData = (data) => {
  // In a real app, you would process the imported data
  console.log('Importing data:', data);
  addAIMessage('数据导入成功！');
};

// File upload and voice recording (mock implementations)
const uploadFile = () => {
  // In a real app, this would trigger a file upload dialog
  alert('文件上传功能尚未实现');
};

const recordVoice = () => {
  // In a real app, this would trigger voice recording
  alert('语音输入功能尚未实现');
};
</script>

<style scoped>
.ai-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--app-background, #f9f9fb);
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--app-border, #e5e7eb);
  background-color: white;
}

.ai-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-icon {
  color: var(--app-primary, #007bff);
  font-size: 20px;
}

.ai-title h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--app-dark, #343a40);
}

.ai-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background-color: var(--app-light, #f8f9fa);
  color: var(--app-gray, #6c757d);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: var(--app-light-hover, #e9ecef);
  color: var(--app-dark, #343a40);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  margin: auto 0;
}

.empty-icon {
  font-size: 48px;
  color: var(--app-primary, #007bff);
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--app-dark, #343a40);
}

.empty-state p {
  font-size: 16px;
  color: var(--app-gray, #6c757d);
  margin: 0 0 24px 0;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 600px;
}

.suggestion-chip {
  padding: 8px 16px;
  background-color: white;
  border: 1px solid var(--app-border, #e5e7eb);
  border-radius: 20px;
  font-size: 14px;
  color: var(--app-dark, #343a40);
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-chip:hover {
  background-color: var(--app-primary-light, #e6f2ff);
  border-color: var(--app-primary, #007bff);
  color: var(--app-primary, #007bff);
}

.input-container {
  padding: 16px 20px;
  border-top: 1px solid var(--app-border, #e5e7eb);
  background-color: white;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--app-light, #f8f9fa);
  border-radius: 24px;
  padding: 4px 6px 4px 16px;
  margin-bottom: 10px;
}

.input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 0;
  font-size: 16px;
  outline: none;
  color: var(--app-dark, #343a40);
}

.input-wrapper input::placeholder {
  color: var(--app-gray, #6c757d);
}

.send-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--app-primary, #007bff);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-button:hover {
  background-color: var(--app-primary-dark, #0069d9);
}

.send-button:disabled {
  background-color: var(--app-light-gray, #ced4da);
  cursor: not-allowed;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.input-actions .action-button {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}
</style> 