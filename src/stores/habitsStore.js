import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useHabitsStore = defineStore('habits', () => {
  // State
  const habits = ref([
    {
      id: '1',
      title: '打羽毛球',
      count: 1,
      isDark: false,
      isCompleted: true,
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2503/2503381.png',
      iconType: 'check',
      tags: []
    },
    {
      id: '2',
      title: '发一篇小红书',
      count: 3,
      isDark: false,
      isCompleted: true,
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2965/2965358.png',
      iconType: 'check',
      tags: []
    },
    {
      id: '3',
      title: '晚睡！！！',
      count: 4,
      isDark: true,
      isCompleted: false,
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3094/3094837.png',
      iconType: 'plus',
      tags: [{ value: 'bad', label: '坏习惯', type: 'red' }]
    },
    {
      id: '4',
      title: '刷视频',
      count: 2,
      isDark: true,
      isCompleted: true,
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
      iconType: 'check',
      tags: [{ value: 'entertainment', label: '娱乐', type: 'orange' }]
    },
    {
      id: '5',
      title: '学习打卡记录~',
      count: 44,
      isDark: false,
      isCompleted: false,
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png',
      iconType: 'plus',
      tags: [{ value: 'study', label: '学习', type: 'green' }]
    },
    {
      id: '6',
      title: '看剧',
      count: 27,
      isDark: false,
      isCompleted: false,
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
      iconType: 'plus',
      tags: [{ value: 'entertainment', label: '娱乐', type: 'orange' }]
    },
    {
      id: '7',
      title: '做饭',
      count: 8,
      isDark: false,
      isCompleted: false,
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/1046/1046857.png',
      iconType: 'camera',
      tags: [{ value: 'health', label: '健康', type: 'green' }]
    },
    {
      id: '8',
      title: '化一次妆吧 ~',
      count: 23,
      isDark: false,
      isCompleted: false,
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/1940/1940922.png',
      iconType: 'camera',
      tags: []
    },
    {
      id: '9',
      title: '坚持跑步',
      count: 20,
      isDark: false,
      isCompleted: false,
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2548/2548537.png',
      iconType: 'plus',
      tags: [{ value: 'health', label: '健康', type: 'green' }]
    },
    {
      id: '10',
      title: '喝奶茶',
      count: 28,
      isDark: true,
      isCompleted: false,
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png',
      iconType: 'plus',
      tags: [{ value: 'bad', label: '坏习惯', type: 'red' }]
    },
    {
      id: '11',
      title: '坚持吃轻食',
      count: 0,
      isDark: false,
      isCompleted: false,
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2454/2454297.png',
      iconType: 'camera',
      tags: [{ value: 'health', label: '健康', type: 'green' }]
    },
    {
      id: '12',
      title: '洗的香香的',
      count: 20,
      isDark: false,
      isCompleted: false,
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2553/2553627.png',
      iconType: 'plus',
      tags: []
    }
  ]);
  
  const selectedHabitIndex = ref(-1);
  const totalCount = ref(16);
  const defaultTitle = '健康习惯';
  
  // Getters (computed)
  const selectedHabit = computed(() => {
    if (selectedHabitIndex.value >= 0 && selectedHabitIndex.value < habits.value.length) {
      return habits.value[selectedHabitIndex.value];
    }
    return null;
  });
  
  const headerTitle = computed(() => {
    return selectedHabit.value ? selectedHabit.value.title : defaultTitle;
  });
  
  const headerCount = computed(() => {
    return selectedHabit.value ? selectedHabit.value.count : totalCount.value;
  });
  
  const headerTags = computed(() => {
    if (selectedHabit.value) {
      return selectedHabit.value.tags;
    }
    return [{ value: 'default', label: '无需备注', type: 'green' }];
  });
  
  // Actions
  function selectHabit(index) {
    if (selectedHabitIndex.value === index) {
      selectedHabitIndex.value = -1;
    } else {
      selectedHabitIndex.value = index;
    }
  }
  
  function increaseCount() {
    if (selectedHabit.value) {
      selectedHabit.value.count++;
    } else {
      totalCount.value++;
    }
  }
  
  function decreaseCount() {
    if (selectedHabit.value) {
      if (selectedHabit.value.count > 0) {
        selectedHabit.value.count--;
      }
    } else if (totalCount.value > 0) {
      totalCount.value--;
    }
  }
  
  function toggleComplete(index) {
    if (index >= 0 && index < habits.value.length) {
      habits.value[index].isCompleted = !habits.value[index].isCompleted;
    }
  }
  
  function toggleHabitStyle(index) {
    if (index >= 0 && index < habits.value.length) {
      habits.value[index].isDark = !habits.value[index].isDark;
    }
  }
  
  function addHabit(habit) {
    habits.value.push(habit);
    // Optionally select the new habit
    selectHabit(habits.value.length - 1);
  }
  
  return {
    // State
    habits,
    selectedHabitIndex,
    totalCount,
    
    // Getters
    selectedHabit,
    headerTitle,
    headerCount,
    headerTags,
    
    // Actions
    selectHabit,
    increaseCount,
    decreaseCount,
    toggleComplete,
    toggleHabitStyle,
    addHabit
  };
}); 