<template>
  <div class="task-list">
    <div 
      v-for="group in tasks" 
      :key="group.id" 
      class="task-group-card"
    >
      <div class="task-group-header" @click="toggleGroup(group.id)">
        <div class="group-name">{{ group.name }}</div>
        <div class="group-actions">
          <span class="task-count">{{ getCompletedCount(group) }}/{{ group.tasks.length }}</span>
          <font-awesome-icon
            :icon="expandedGroups.includes(group.id) ? 'chevron-up' : 'chevron-down'"
            class="toggle-icon"
          />
        </div>
      </div>
      
      <div v-if="expandedGroups.includes(group.id)" class="task-items">
        <div 
          v-for="task in group.tasks" 
          :key="task.id" 
          class="task-item"
          :class="{ completed: task.completed }"
        >
          <el-checkbox 
            v-model="task.completed" 
            @change="updateTaskStatus(task)"
            class="task-checkbox"
          />
          <div class="task-info" @click="$emit('task-clicked', { ...task, groupId: group.id, groupName: group.name })">
            <div class="task-name">{{ task.name }}</div>
            <div class="task-details">
              <div class="task-due-date" v-if="task.dueDate">
                <font-awesome-icon icon="clock" class="detail-icon" />
                {{ formatDate(task.dueDate) }}
              </div>
              <div :class="`task-priority priority-${task.priority}`">
                <div class="priority-dot"></div>
                {{ getPriorityText(task.priority) }}
              </div>
            </div>
          </div>
          <div class="task-actions">
            <el-dropdown trigger="click" @command="handleTaskAction($event, group.id, task.id)">
              <font-awesome-icon icon="ellipsis-vertical" class="more-icon" role="button" focusable="true" aria-label="任务操作" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete" class="danger-item">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <div v-if="group.tasks.length === 0" class="no-tasks">
          暂无任务
        </div>
      </div>
    </div>
  </div>
  
  <!-- Edit Task Modal (would be implemented in a real app) -->
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['task-clicked', 'edit-task']);

// Group expansion handling
const expandedGroups = ref([1]); // Initially expand the first group

const toggleGroup = (groupId) => {
  const index = expandedGroups.value.indexOf(groupId);
  if (index > -1) {
    expandedGroups.value.splice(index, 1);
  } else {
    expandedGroups.value.push(groupId);
  }
};

// Helper functions
const getCompletedCount = (group) => {
  return group.tasks.filter(task => task.completed).length;
};

const formatDate = (date) => {
  const now = new Date();
  const taskDate = new Date(date);
  
  // Same day formatting
  if (taskDate.toDateString() === now.toDateString()) {
    return `今天 ${taskDate.getHours().toString().padStart(2, '0')}:${taskDate.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Tomorrow formatting
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (taskDate.toDateString() === tomorrow.toDateString()) {
    return `明天 ${taskDate.getHours().toString().padStart(2, '0')}:${taskDate.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Other dates
  return `${taskDate.getMonth() + 1}月${taskDate.getDate()}日 ${taskDate.getHours().toString().padStart(2, '0')}:${taskDate.getMinutes().toString().padStart(2, '0')}`;
};

const getPriorityText = (priority) => {
  const map = {
    high: '高',
    medium: '中',
    low: '低'
  };
  return map[priority] || '';
};

// Task operations
const updateTaskStatus = (task) => {
  // In a real app, this would update the backend
  console.log(`Task ${task.id} ${task.completed ? 'completed' : 'uncompleted'}`);
};

const handleTaskAction = (action, groupId, taskId) => {
  if (action === 'edit') {
    // Find the task and emit edit event with the task data
    const groupIndex = props.tasks.findIndex(g => g._id === groupId || g.id === groupId);
    if (groupIndex !== -1) {
      const taskIndex = props.tasks[groupIndex].tasks.findIndex(t => t._id === taskId || t.id === taskId);
      if (taskIndex !== -1) {
        const task = props.tasks[groupIndex].tasks[taskIndex];
        console.log(`Edit task ${taskId} in group ${groupId}`);
        emit('edit-task', { 
          ...task, 
          groupId: props.tasks[groupIndex]._id || props.tasks[groupIndex].id,
          groupName: props.tasks[groupIndex].name
        });
      }
    }
  } else if (action === 'delete') {
    // Confirm and delete (would have a confirmation in a real app)
    const groupIndex = props.tasks.findIndex(g => g._id === groupId || g.id === groupId);
    if (groupIndex !== -1) {
      const taskIndex = props.tasks[groupIndex].tasks.findIndex(t => t._id === taskId || t.id === taskId);
      if (taskIndex !== -1) {
        props.tasks[groupIndex].tasks.splice(taskIndex, 1);
      }
    }
  }
};
</script>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-group-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--app-shadow);
  animation: fadeIn 0.3s ease forwards;
}

.task-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.task-group-header:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.group-name {
  font-weight: 600;
  font-size: 17px;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-count {
  color: var(--app-gray);
  font-size: 14px;
}

.toggle-icon {
  color: var(--app-gray);
  transition: transform 0.3s ease;
}

.task-items {
  border-top: 1px solid var(--app-border);
}

.task-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--app-border);
  animation: fadeIn 0.3s ease forwards;
  transition: background-color 0.2s ease;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.task-item.completed .task-name {
  text-decoration: line-through;
  color: var(--app-gray);
}

.task-checkbox {
  margin-right: 12px;
}

.task-info {
  flex: 1;
  cursor: pointer;
}

.task-name {
  font-size: 16px;
  margin-bottom: 4px;
}

.task-details {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--app-gray);
}

.detail-icon {
  margin-right: 4px;
}

.task-due-date {
  display: flex;
  align-items: center;
}

.task-priority {
  display: flex;
  align-items: center;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.priority-high .priority-dot {
  background-color: var(--app-danger);
}

.priority-medium .priority-dot {
  background-color: var(--app-warning);
}

.priority-low .priority-dot {
  background-color: var(--app-success);
}

.task-actions {
  margin-left: 12px;
}

.more-icon {
  color: var(--app-gray);
  padding: 8px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.more-icon:hover {
  color: var(--app-dark);
}

.no-tasks {
  padding: 16px;
  text-align: center;
  color: var(--app-gray);
  font-style: italic;
}

.danger-item {
  color: var(--app-danger);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .task-group-card {
    background-color: #2C2C2E;
  }
  
  .task-group-header:hover,
  .task-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .task-items,
  .task-item {
    border-color: var(--app-border);
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 