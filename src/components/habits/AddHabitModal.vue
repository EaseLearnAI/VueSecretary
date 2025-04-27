<template>
  <div class="modal-container" v-if="visible" @click.self="$emit('close')">
    <div class="modal-overlay"></div>
    
    <div class="modal-content" ref="modalContent">
      <div class="modal-header">
        <h3 class="modal-title">添加新习惯</h3>
        <button class="close-button" @click="$emit('close')">
          <font-awesome-icon icon="times" />
        </button>
      </div>
      
      <form @submit.prevent="submitForm" class="form-container">
        <!-- Habit Name -->
        <div class="form-group">
          <label for="habitName" class="form-label">习惯名称</label>
          <input 
            type="text" 
            id="habitName" 
            v-model="habitName" 
            class="form-input" 
            placeholder="输入习惯名称"
            required
          />
        </div>
        
        <!-- Icon Selection -->
        <div class="form-group">
          <label class="form-label">选择图标</label>
          <div class="icon-grid">
            <div 
              v-for="(icon, index) in icons" 
              :key="index"
              :class="['icon-option', { 'selected': selectedIcon === icon.url }]"
              @click="selectedIcon = icon.url"
            >
              <img :src="icon.url" :alt="icon.alt">
            </div>
          </div>
        </div>
        
        <!-- Tag Selection -->
        <div class="form-group">
          <label class="form-label">选择标签 (可多选)</label>
          <div class="tag-options">
            <label 
              v-for="tag in availableTags" 
              :key="tag.value"
              :class="['tag-option', getTagClass(tag.value)]"
              @click="toggleTag(tag.value)"
            >
              <input 
                type="checkbox" 
                :value="tag.value" 
                v-model="selectedTags"
              >
              <span>{{ tag.label }}</span>
            </label>
          </div>
          
          <!-- Custom Tag Input -->
          <div class="custom-tag-container">
            <div class="custom-tag-input-wrapper">
              <input 
                type="text" 
                v-model="newTagName" 
                class="custom-tag-input" 
                placeholder="添加自定义标签"
                @keyup.enter="addCustomTag"
              />
              <button 
                type="button" 
                class="add-tag-button" 
                @click="addCustomTag"
                :disabled="!newTagName.trim()"
              >
                <font-awesome-icon icon="plus" />
              </button>
            </div>
            
            <!-- Custom Tags Display -->
            <div v-if="customTags.length > 0" class="custom-tags-display">
              <label 
                v-for="(tag, index) in customTags" 
                :key="tag.value"
                :class="['tag-option', getTagClass(tag.value)]"
                @click="toggleTag(tag.value)"
              >
                <input 
                  type="checkbox" 
                  :value="tag.value" 
                  v-model="selectedTags"
                >
                <span>{{ tag.label }}</span>
                <button 
                  type="button" 
                  class="remove-tag-button"
                  @click.stop="removeCustomTag(index)"
                >
                  <font-awesome-icon icon="times" size="xs" />
                </button>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Dark Mode Option -->
        <div class="checkbox-group">
          <input type="checkbox" id="darkMode" v-model="isDarkMode">
          <label for="darkMode" class="checkbox-label">使用暗色风格</label>
        </div>
        
        <!-- Form Buttons -->
        <div class="button-container">
          <button type="button" class="cancel-button" @click="$emit('close')">取消</button>
          <button type="submit" class="submit-button" :disabled="!isFormValid">添加习惯</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'add-habit']);

const habitName = ref('');
const selectedIcon = ref('');
const selectedTags = ref([]);
const isDarkMode = ref(false);
const modalContent = ref(null);
const newTagName = ref('');
const customTags = ref([]);

// Available icons
const icons = [
  { url: 'https://cdn-icons-png.flaticon.com/512/2503/2503381.png', alt: '羽毛球' },
  { url: 'https://cdn-icons-png.flaticon.com/512/2965/2965358.png', alt: '笔记本' },
  { url: 'https://cdn-icons-png.flaticon.com/512/3094/3094837.png', alt: '枕头' },
  { url: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png', alt: '视频' },
  { url: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png', alt: '铅笔' },
  { url: 'https://cdn-icons-png.flaticon.com/512/1046/1046857.png', alt: '食物' },
  { url: 'https://cdn-icons-png.flaticon.com/512/1940/1940922.png', alt: '口红' },
  { url: 'https://cdn-icons-png.flaticon.com/512/2548/2548537.png', alt: '跑步' },
  { url: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png', alt: '奶茶' },
  { url: 'https://cdn-icons-png.flaticon.com/512/2553/2553627.png', alt: '沐浴' }
];

// Available tags
const availableTags = [
  { value: 'health', label: '健康' },
  { value: 'study', label: '学习' },
  { value: 'entertainment', label: '娱乐' },
  { value: 'bad', label: '坏习惯' },
  { value: 'pinned', label: '置顶' }
];

// Check if form is valid
const isFormValid = computed(() => {
  return habitName.value.trim() !== '' && selectedIcon.value !== '';
});

// Handle touch events for swipe closing
let startY = 0;

onMounted(() => {
  if (modalContent.value) {
    modalContent.value.addEventListener('touchstart', handleTouchStart);
    modalContent.value.addEventListener('touchmove', handleTouchMove);
    modalContent.value.addEventListener('touchend', handleTouchEnd);
  }
});

const handleTouchStart = (e) => {
  startY = e.touches[0].clientY;
};

const handleTouchMove = (e) => {
  const currentY = e.touches[0].clientY;
  const diff = currentY - startY;
  
  if (diff > 0) {
    modalContent.value.style.transform = `translateY(${diff}px)`;
  }
};

const handleTouchEnd = (e) => {
  const currentY = e.changedTouches[0].clientY;
  const diff = currentY - startY;
  
  if (diff > 100) {
    emit('close');
  } else {
    modalContent.value.style.transform = '';
  }
};

// Add a custom tag
const addCustomTag = () => {
  if (!newTagName.value.trim()) return;
  
  // Create a value based on the tag name
  const tagValue = `custom-${Date.now()}`;
  const tagLabel = newTagName.value.trim();
  
  // Add to custom tags
  customTags.value.push({
    value: tagValue,
    label: tagLabel
  });
  
  // Auto-select the new tag
  selectedTags.value.push(tagValue);
  
  // Clear the input
  newTagName.value = '';
};

// Remove a custom tag
const removeCustomTag = (index) => {
  const tagToRemove = customTags.value[index];
  
  // Remove from selected tags if it's selected
  const selectedIndex = selectedTags.value.indexOf(tagToRemove.value);
  if (selectedIndex !== -1) {
    selectedTags.value.splice(selectedIndex, 1);
  }
  
  // Remove from custom tags
  customTags.value.splice(index, 1);
};

// Toggle tag selection
const toggleTag = (tagValue) => {
  const index = selectedTags.value.indexOf(tagValue);
  if (index === -1) {
    selectedTags.value.push(tagValue);
  } else {
    selectedTags.value.splice(index, 1);
  }
};

// Get CSS class for tag option
const getTagClass = (tagValue) => {
  if (!selectedTags.value.includes(tagValue)) {
    return '';
  }
  
  if (tagValue.startsWith('custom-')) {
    return 'selected-blue';
  }
  
  switch (tagValue) {
    case 'health':
    case 'study':
      return 'selected-green';
    case 'bad':
      return 'selected-red';
    case 'pinned':
    case 'entertainment':
      return 'selected-orange';
    default:
      return '';
  }
};

// Submit the form
const submitForm = () => {
  if (!isFormValid.value) return;
  
  // Combine built-in and custom tags
  const allTags = [...availableTags, ...customTags.value];
  
  const newHabit = {
    id: Date.now().toString(),
    title: habitName.value,
    count: 0,
    isDark: isDarkMode.value,
    isCompleted: false,
    iconUrl: selectedIcon.value,
    iconType: 'plus',
    tags: selectedTags.value.map(tag => {
      const foundTag = allTags.find(t => t.value === tag);
      return {
        value: tag,
        label: foundTag ? foundTag.label : tag,
        type: getTagType(tag)
      };
    })
  };
  
  emit('add-habit', newHabit);
  resetForm();
};

// Reset form after submission
const resetForm = () => {
  habitName.value = '';
  selectedIcon.value = '';
  selectedTags.value = [];
  isDarkMode.value = false;
  newTagName.value = '';
  // Don't reset custom tags between sessions - they're reusable
};

// Get tag type for styling
const getTagType = (tagValue) => {
  if (tagValue.startsWith('custom-')) {
    return 'blue';
  }
  
  switch (tagValue) {
    case 'health':
    case 'study':
      return 'green';
    case 'bad':
      return 'red';
    case 'pinned':
    case 'entertainment':
      return 'orange';
    default:
      return 'blue';
  }
};

// Reset form when modal closes
watch(() => props.visible, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});
</script>

<style scoped>
.modal-container {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: -1;
}

.modal-content {
  background-color: white;
  width: 100%;
  max-width: 480px;
  border-radius: 16px 16px 0 0;
  padding: 20px;
  transform: translateY(0);
  transition: all 0.2s cubic-bezier(0.25, 1.25, 0.5, 1);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  margin-bottom: 4px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  outline: none;
  transition: all 0.2s cubic-bezier(0.25, 1.25, 0.5, 1);
  font-size: 16px;
}

.form-input:focus {
  border-color: #48BB78;
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.2);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.icon-option {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #f9fafb;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s cubic-bezier(0.25, 1.25, 0.5, 1);
}

.icon-option:hover {
  border-color: #48BB78;
}

.icon-option.selected {
  border-color: #48BB78;
}

.icon-option img {
  width: 32px;
  height: 32px;
}

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-option {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  background-color: #f3f4f6;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 1.25, 0.5, 1);
  position: relative;
}

.tag-option:hover {
  background-color: #e5e7eb;
}

.tag-option input[type="checkbox"] {
  display: none;
}

.tag-option.selected-green {
  background-color: #f0fdf4;
  color: #16a34a;
  box-shadow: 0 0 0 2px #dcfce7;
}

.tag-option.selected-red {
  background-color: #fef2f2;
  color: #dc2626;
  box-shadow: 0 0 0 2px #fee2e2;
}

.tag-option.selected-orange {
  background-color: #fff7ed;
  color: #f97316;
  box-shadow: 0 0 0 2px #ffedd5;
}

.tag-option.selected-blue {
  background-color: #eff6ff;
  color: #2563eb;
  box-shadow: 0 0 0 2px #dbeafe;
}

.custom-tag-container {
  margin-top: 12px;
}

.custom-tag-input-wrapper {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.custom-tag-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 12px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  outline: none;
  transition: all 0.2s cubic-bezier(0.25, 1.25, 0.5, 1);
  font-size: 14px;
}

.custom-tag-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.add-tag-button {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background-color: #3b82f6;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 1.25, 0.5, 1);
}

.add-tag-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.add-tag-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.custom-tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.remove-tag-button {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: currentColor;
  opacity: 0.7;
  cursor: pointer;
  margin-left: 4px;
  padding: 0;
}

.remove-tag-button:hover {
  opacity: 1;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-label {
  font-size: 14px;
  color: #374151;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.cancel-button {
  padding: 8px 16px;
  border-radius: 12px;
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 1.25, 0.5, 1);
}

.cancel-button:hover {
  background-color: #e5e7eb;
}

.submit-button {
  padding: 8px 16px;
  border-radius: 12px;
  background-color: #48BB78;
  color: white;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 1.25, 0.5, 1);
}

.submit-button:hover {
  background-color: #38A169;
}

.submit-button:disabled {
  background-color: #9CA3AF;
  cursor: not-allowed;
}

.submit-button:active,
.cancel-button:active {
  transform: scale(0.95);
}
</style> 