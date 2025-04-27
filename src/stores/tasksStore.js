import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTasksStore = defineStore('tasks', () => {
  // State
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
  
  // Computed properties
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
  
  // Generate next task ID
  function getNextTaskId() {
    return Math.max(...flatTasks.value.map(t => t.id), 0) + 1;
  }
  
  // Generate next group ID
  function getNextGroupId() {
    return Math.max(...taskGroups.value.map(g => g.id), 0) + 1;
  }
  
  // Actions
  function addTask(taskData) {
    if (!taskData.name.trim()) {
      return false;
    }
    
    let groupId = taskData.groupId;
    
    // Create new group if needed
    if (groupId === 'new') {
      if (!taskData.newGroupName.trim()) {
        return false;
      }
      
      const newGroupId = getNextGroupId();
      taskGroups.value.push({
        id: newGroupId,
        name: taskData.newGroupName,
        tasks: []
      });
      
      groupId = newGroupId;
    }
    
    // Add new task to the group
    const taskId = getNextTaskId();
    const targetGroup = taskGroups.value.find(g => g.id === groupId);
    
    if (!targetGroup) {
      return false;
    }
    
    targetGroup.tasks.push({
      id: taskId,
      name: taskData.name,
      completed: false,
      priority: taskData.priority,
      dueDate: taskData.dueDate
    });
    
    return true;
  }
  
  function updateTask(taskId, updatedData) {
    for (const group of taskGroups.value) {
      const taskIndex = group.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        group.tasks[taskIndex] = { ...group.tasks[taskIndex], ...updatedData };
        return true;
      }
    }
    return false;
  }
  
  function deleteTask(taskId) {
    for (const group of taskGroups.value) {
      const taskIndex = group.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        group.tasks.splice(taskIndex, 1);
        return true;
      }
    }
    return false;
  }
  
  function addGroup(groupName) {
    if (!groupName.trim()) {
      return false;
    }
    
    const newGroupId = getNextGroupId();
    taskGroups.value.push({
      id: newGroupId,
      name: groupName,
      tasks: []
    });
    
    return newGroupId;
  }
  
  function updateGroup(groupId, updatedData) {
    const groupIndex = taskGroups.value.findIndex(g => g.id === groupId);
    if (groupIndex !== -1) {
      taskGroups.value[groupIndex] = { ...taskGroups.value[groupIndex], ...updatedData };
      return true;
    }
    return false;
  }
  
  function deleteGroup(groupId) {
    const groupIndex = taskGroups.value.findIndex(g => g.id === groupId);
    if (groupIndex !== -1) {
      taskGroups.value.splice(groupIndex, 1);
      return true;
    }
    return false;
  }
  
  // Mock API functions (can be replaced with real API calls later)
  async function fetchTasks() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Data is already loaded in the store
    return { success: true };
  }
  
  async function saveTask(taskData) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: addTask(taskData) };
  }
  
  return {
    // State
    taskGroups,
    
    // Getters
    flatTasks,
    
    // Actions
    addTask,
    updateTask,
    deleteTask,
    addGroup,
    updateGroup,
    deleteGroup,
    
    // API Methods
    fetchTasks,
    saveTask
  };
});
