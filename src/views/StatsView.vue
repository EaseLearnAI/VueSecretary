<template>
  <BaseLayout title="统计">
    <!-- Today's Summary -->
    <div class="stat-card">
      <div class="stat-header">
        <div class="stat-title">今日概览</div>
        <div class="stat-action" @click="showDetailedStats">查看详情</div>
      </div>
      
      <div class="metric-cards">
        <div class="metric-card" style="--index: 0.5;">
          <div class="metric-icon text-primary">
            <font-awesome-icon icon="tasks" />
          </div>
          <div class="metric-value">{{ todayStats.completedTasks }}</div>
          <div class="metric-label">完成任务</div>
        </div>
        
        <div class="metric-card" style="--index: 0.7;">
          <div class="metric-icon text-purple">
            <font-awesome-icon icon="calendar-check" />
          </div>
          <div class="metric-value">{{ todayStats.habitCheckins }}</div>
          <div class="metric-label">习惯打卡</div>
        </div>
        
        <div class="metric-card" style="--index: 0.9;">
          <div class="metric-icon text-orange">
            <font-awesome-icon icon="clock" />
          </div>
          <div class="metric-value">{{ todayStats.focusTime }}h</div>
          <div class="metric-label">专注时间</div>
        </div>
      </div>
    </div>
    
    <!-- Weekly Trends -->
    <div class="stat-card">
      <div class="stat-header">
        <div class="stat-title">趋势</div>
        <div class="time-range">
          <div 
            v-for="option in timeRangeOptions" 
            :key="option.value"
            class="time-option" 
            :class="{ active: timeRange === option.value }"
            @click="timeRange = option.value"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
      
      <div class="chart-container">
        <LineChart :data="trendChartData" :options="trendChartOptions" />
      </div>
      
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-color" style="background-color: var(--app-primary);"></div>
          <div>任务</div>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #AF52DE;"></div>
          <div>习惯</div>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: var(--app-warning);"></div>
          <div>专注</div>
        </div>
      </div>
    </div>
    
    <!-- Monthly Summary -->
    <div class="stat-card">
      <div class="stat-header">
        <div class="stat-title">月度汇总</div>
      </div>
      
      <div class="chart-container">
        <BarChart :data="monthlyChartData" :options="monthlyChartOptions" />
      </div>
    </div>
    
    <!-- Export Button -->
    <button class="export-button" @click="exportReport">
      <font-awesome-icon icon="download" class="btn-icon" />
      导出统计报告
    </button>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { Line as LineChart, Bar as BarChart } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import BaseLayout from '../components/layout/BaseLayout.vue';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Today's statistics
const todayStats = ref({
  completedTasks: 6,
  habitCheckins: 3,
  focusTime: 2.5
});

// Time range selection
const timeRangeOptions = [
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' }
];
const timeRange = ref('week');

// Default data for charts to avoid undefined errors
const defaultChartData = {
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  datasets: [
    {
      label: '任务',
      data: [5, 7, 4, 6, 8, 3, 6],
      borderColor: '#007AFF',
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      tension: 0.3,
      fill: true
    }
  ]
};

// Chart data
const getTimeLabels = computed(() => {
  if (timeRange.value === 'week') {
    return ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  } else if (timeRange.value === 'month') {
    return ['第1周', '第2周', '第3周', '第4周'];
  } else {
    return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  }
});

// Weekly/Monthly/Yearly trends data
const trendChartData = computed(() => {
  // Generate sample data based on time range
  let tasksData, habitsData, focusData;
  
  if (timeRange.value === 'week') {
    tasksData = [5, 7, 4, 6, 8, 3, 6];
    habitsData = [3, 3, 2, 4, 3, 2, 3];
    focusData = [2.5, 3, 1.5, 4, 3.5, 1, 2.5];
  } else if (timeRange.value === 'month') {
    tasksData = [20, 25, 18, 22];
    habitsData = [14, 15, 12, 16];
    focusData = [12, 15, 10, 14];
  } else {
    tasksData = [60, 65, 70, 68, 72, 75, 78, 72, 68, 70, 65, 62];
    habitsData = [40, 42, 45, 44, 48, 50, 52, 48, 46, 44, 42, 40];
    focusData = [35, 38, 42, 40, 45, 48, 50, 45, 42, 40, 38, 36];
  }
  
  return {
    labels: getTimeLabels.value,
    datasets: [
      {
        label: '任务',
        data: tasksData,
        borderColor: '#007AFF',
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: '习惯',
        data: habitsData,
        borderColor: '#AF52DE',
        backgroundColor: 'rgba(175, 82, 222, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: '专注时间(小时)',
        data: focusData,
        borderColor: '#FF9500',
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };
});

// Trend chart options
const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  animation: {
    duration: 1500,
    easing: 'easeOutQuart'
  }
};

// Monthly summary chart data
const monthlyChartData = computed(() => {
  return {
    labels: ['任务完成率', '习惯坚持率', '专注效率'],
    datasets: [
      {
        label: '目标',
        data: [100, 100, 100],
        backgroundColor: 'rgba(142, 142, 147, 0.2)',
        borderRadius: 6
      },
      {
        label: '实际',
        data: [75, 85, 65],
        backgroundColor: [
          '#007AFF',
          '#AF52DE',
          '#FF9500'
        ],
        borderRadius: 6
      }
    ]
  };
});

// Monthly chart options
const monthlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return context.dataset.label + ': ' + context.parsed.x + '%';
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: function(value) {
          return value + '%';
        }
      },
      grid: {
        display: false
      }
    },
    y: {
      grid: {
        display: false
      }
    }
  },
  animation: {
    duration: 1500,
    easing: 'easeOutQuart',
    delay: function(context) {
      return context.dataIndex * 300;
    }
  }
};

// Handle methods
const showDetailedStats = () => {
  // In a real app, this would navigate to a detailed view
  console.log('Show detailed stats');
};

const exportReport = () => {
  // In a real app, this would generate and download a report
  console.log('Export report');
  
  // Show success feedback
  const button = document.querySelector('.export-button');
  if (button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check-circle mr-2"></i> 报告已导出';
    button.style.backgroundColor = 'var(--app-success)';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.backgroundColor = '';
    }, 2000);
  }
};

// Initialize charts when component is mounted
onMounted(() => {
  // Animation would be handled by Chart.js
});
</script>

<style scoped>
.stat-card {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--app-shadow);
  animation: fadeIn 0.6s ease forwards;
  animation-delay: calc(var(--index) * 0.1s);
  opacity: 0;
  --index: 0;
}

.stat-card:nth-child(1) {
  --index: 0;
}

.stat-card:nth-child(2) {
  --index: 1;
}

.stat-card:nth-child(3) {
  --index: 2;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-title {
  font-weight: 600;
  font-size: 18px;
}

.stat-action {
  color: var(--app-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-action:active {
  transform: scale(0.95);
}

.time-range {
  display: flex;
  background-color: var(--app-light);
  border-radius: 8px;
  overflow: hidden;
}

.time-option {
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.time-option.active {
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.metric-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.6s ease forwards;
  animation-delay: calc(var(--index) * 0.1s);
  opacity: 0;
}

.metric-icon {
  margin-bottom: 8px;
  font-size: 24px;
}

.text-primary {
  color: var(--app-primary);
}

.text-purple {
  color: #AF52DE;
}

.text-orange {
  color: var(--app-warning);
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  margin: 8px 0;
}

.metric-label {
  font-size: 12px;
  color: var(--app-gray);
}

.chart-container {
  position: relative;
  margin: 20px 0;
  height: 200px;
  opacity: 0;
  animation: fadeIn 0.8s ease forwards;
  animation-delay: 0.2s;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  opacity: 0;
  animation: fadeIn 0.8s ease forwards;
  animation-delay: 0.4s;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 6px;
}

.export-button {
  width: 100%;
  padding: 16px;
  background-color: var(--app-primary);
  color: white;
  border: none;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  margin-top: 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: fadeIn 0.8s ease forwards;
  animation-delay: 0.6s;
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-button:active {
  transform: scale(0.98);
}

.btn-icon {
  margin-right: 8px;
}

/* Responsive adjustments for small screens */
@media (max-width: 480px) {
  .metric-cards {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .stat-card {
    background-color: #2C2C2E;
  }
  
  .metric-card {
    background-color: #3A3A3C;
  }
  
  .time-option.active {
    background-color: #3A3A3C;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 