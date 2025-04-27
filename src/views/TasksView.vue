<template>
  <BaseLayout 
    title="任务" 
    :right-action="true" 
    @right-action="openAddTaskModal"
  >
    <div class="view-switcher">
      <button 
        class="switch-btn" 
        :class="{ active: viewMode === 'list' }" 
        @click="viewMode = 'list'"
      >
        任务集
      </button>
      <button 
        class="switch-btn" 
        :class="{ active: viewMode === 'quadrant' }" 
        @click="viewMode = 'quadrant'"
      >
        四象限
      </button>
    </div>
    
    <div v-if="isLoading" class="loading-indicator">
      <i class="el-icon-loading"></i>
      <span>加载中...</span>
    </div>
    
    <template v-else>
      <TaskList v-if="viewMode === 'list'" :tasks="tasksStore.taskGroups" @task-clicked="selectTask" />
      <TaskQuadrant v-else :tasks="tasksStore.flatTasks" @task-clicked="selectTask" />
    </template>
    
    <!-- Add Task Modal -->
    <ModalContainer v-model="showAddTaskModal" title="新建任务">
      <el-form :model="newTask" label-position="top">
        <el-form-item label="任务名称">
          <el-input v-model="newTask.name" placeholder="输入任务名称" />
        </el-form-item>
        
        <el-form-item label="所属任务集">
          <el-select v-model="newTask.groupId" placeholder="选择任务集" style="width: 100%">
            <el-option
              v-for="group in tasksStore.taskGroups"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
            <el-option label="+ 新建任务集" value="new" />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="newTask.groupId === 'new'" label="任务集名称">
          <el-input v-model="newTask.newGroupName" placeholder="输入任务集名称" />
        </el-form-item>
        
        <el-form-item label="优先级">
          <el-select v-model="newTask.priority" placeholder="选择优先级" style="width: 100%">
            <el-option label="高优先级" value="high" />
            <el-option label="中优先级" value="medium" />
            <el-option label="低优先级" value="low" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="newTask.dueDate"
            type="datetime"
            placeholder="选择日期和时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <button class="btn btn-secondary" @click="showAddTaskModal = false">取消</button>
        <button class="btn btn-primary" @click="addTask" :disabled="isAddingTask">
          <span v-if="isAddingTask">创建中...</span>
          <span v-else>创建</span>
        </button>
      </template>
    </ModalContainer>
    
    <!-- Pomodoro Modal -->
    <TaskPomodoro v-if="selectedTask" v-model="showPomodoroModal" :task="selectedTask" />
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTasksStore } from '../stores/tasksStore';
import BaseLayout from '../components/layout/BaseLayout.vue';
import ModalContainer from '../components/layout/ModalContainer.vue';
import TaskList from '../components/tasks/TaskList.vue';
import TaskQuadrant from '../components/tasks/TaskQuadrant.vue';
import TaskPomodoro from '../components/tasks/TaskPomodoro.vue';

// Initialize the tasks store
const tasksStore = useTasksStore();

// View mode switching
const viewMode = ref('list');

// Loading state
const isLoading = ref(true);
const isAddingTask = ref(false);

// Load tasks on component mount
onMounted(async () => {
  try {
    await tasksStore.fetchTasks();
  } catch (error) {
    console.error('Failed to load tasks:', error);
    // TODO: Show error message to user
  } finally {
    isLoading.value = false;
  }
});

// Task modals
const showAddTaskModal = ref(false);
const newTask = ref({
  name: '',
  groupId: '',
  newGroupName: '',
  priority: 'medium',
  dueDate: null
});

const openAddTaskModal = () => {
  newTask.value = {
    name: '',
    groupId: tasksStore.taskGroups.length > 0 ? tasksStore.taskGroups[0].id : 'new',
    newGroupName: '',
    priority: 'medium',
    dueDate: null
  };
  showAddTaskModal.value = true;
};

const addTask = async () => {
  if (!newTask.value.name.trim()) {
    // TODO: Show validation message
    return;
  }
  
  // Set adding state
  isAddingTask.value = true;
  
  try {
    // Save task using store method
    const result = await tasksStore.saveTask(newTask.value);
    
    if (result.success) {
      showAddTaskModal.value = false;
    } else {
      // TODO: Show error message
    }
  } catch (error) {
    console.error('Failed to add task:', error);
    // TODO: Show error message
  } finally {
    isAddingTask.value = false;
  }
};

// Pomodoro handling
const selectedTask = ref(null);
const showPomodoroModal = ref(false);

const selectTask = (task) => {
  selectedTask.value = task;
  showPomodoroModal.value = true;
};
</script>

<style scoped>
.view-switcher {
  display: flex;
  background-color: var(--app-light);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.switch-btn {
  flex: 1;
  border: none;
  background: none;
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.switch-btn.active {
  background-color: white;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: var(--text-secondary);
  gap: 8px;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .switch-btn.active {
    background-color: #3A3A3C;
  }
}
</style> 