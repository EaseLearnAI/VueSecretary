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
    
    <TaskList v-if="viewMode === 'list'" :tasks="taskGroups" @task-clicked="selectTask" />
    <TaskQuadrant v-else :tasks="flatTasks" @task-clicked="selectTask" />
    
    <!-- Add Task Modal -->
    <ModalContainer v-model="showAddTaskModal" title="新建任务">
      <el-form :model="newTask" label-position="top">
        <el-form-item label="任务名称">
          <el-input v-model="newTask.name" placeholder="输入任务名称" />
        </el-form-item>
        
        <el-form-item label="所属任务集">
          <el-select v-model="newTask.groupId" placeholder="选择任务集" style="width: 100%">
            <el-option
              v-for="group in taskGroups"
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
        <button class="btn btn-primary" @click="addTask">创建</button>
      </template>
    </ModalContainer>
    
    <!-- Pomodoro Modal -->
    <TaskPomodoro v-if="selectedTask" v-model="showPomodoroModal" :task="selectedTask" />
  </BaseLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseLayout from '../components/layout/BaseLayout.vue';
import ModalContainer from '../components/layout/ModalContainer.vue';
import TaskList from '../components/tasks/TaskList.vue';
import TaskQuadrant from '../components/tasks/TaskQuadrant.vue';
import TaskPomodoro from '../components/tasks/TaskPomodoro.vue';

// View mode switching
const viewMode = ref('list');

// Tasks data
const taskGroups = ref([
  {
    id: 1,
    name: '工作项目',
    tasks: [
      { id: 1, name: '完成设计原型', completed: false, priority: 'high', dueDate: new Date('2023-06-10 14:00') },
      { id: 2, name: '前端开发', completed: true, priority: 'medium', dueDate: new Date('2023-06-08 18:00') },
      { id: 3, name: '后端 API 集成', completed: false, priority: 'high', dueDate: new Date('2023-06-15 16:00') }
    ]
  },
  {
    id: 2,
    name: '个人',
    tasks: [
      { id: 4, name: '购物清单', completed: false, priority: 'low', dueDate: new Date('2023-06-12 12:00') },
      { id: 5, name: '家庭聚会', completed: false, priority: 'medium', dueDate: new Date('2023-06-18 19:00') }
    ]
  },
  {
    id: 3,
    name: '学习',
    tasks: [
      { id: 6, name: '学习 Vue 3', completed: true, priority: 'high', dueDate: new Date('2023-06-05 10:00') },
      { id: 7, name: '阅读技术文章', completed: false, priority: 'low', dueDate: new Date('2023-06-20 22:00') }
    ]
  }
]);

// Create flat task list for quadrant view
const flatTasks = computed(() => {
  const tasks = [];
  taskGroups.value.forEach(group => {
    group.tasks.forEach(task => {
      tasks.push({
        ...task,
        groupId: group.id,
        groupName: group.name
      });
    });
  });
  return tasks;
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
    groupId: taskGroups.value.length > 0 ? taskGroups.value[0].id : 'new',
    newGroupName: '',
    priority: 'medium',
    dueDate: null
  };
  showAddTaskModal.value = true;
};

const addTask = () => {
  if (!newTask.value.name.trim()) {
    return; // TODO: Show validation message
  }
  
  let groupId = newTask.value.groupId;
  
  // Create new group if needed
  if (groupId === 'new') {
    if (!newTask.value.newGroupName.trim()) {
      return; // TODO: Show validation message
    }
    
    const newGroupId = taskGroups.value.length + 1;
    taskGroups.value.push({
      id: newGroupId,
      name: newTask.value.newGroupName,
      tasks: []
    });
    
    groupId = newGroupId;
  }
  
  // Add new task to the group
  const taskId = Math.max(...flatTasks.value.map(t => t.id), 0) + 1;
  const targetGroup = taskGroups.value.find(g => g.id === groupId);
  
  targetGroup.tasks.push({
    id: taskId,
    name: newTask.value.name,
    completed: false,
    priority: newTask.value.priority,
    dueDate: newTask.value.dueDate
  });
  
  showAddTaskModal.value = false;
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

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .switch-btn.active {
    background-color: #3A3A3C;
  }
}
</style> 