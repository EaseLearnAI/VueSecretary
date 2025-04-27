import axios from 'axios';

// API Configuration
const ARK_API_KEY = "6edbe8d5-7584-4c69-b062-6ef8c4d367f4";
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const MODEL_NAME = "ep-20250427122528-dvmvp";

// System prompt template - similar to habit_task_analyzer.js but optimized for Vue app integration
const SYSTEM_PROMPT = `你是一个专业的事件、任务和习惯分析助手。你需要分析用户输入的自然语言，提取出"具体事件"、"任务"和"习惯"，并进行结构化输出。

重要分析规则：
1. 首先准确区分"事件"、"任务"和"习惯"：
   - 事件：指定时间点需要参与的活动，如"开会"、"打电话"、"面试"、"看电影"、"打游戏"等
   - 任务：需要完成的工作项目，通常包含多个步骤，如"准备演讲"、"完成报告"、"策划活动"等
   - 习惯：用户希望长期养成的规律性行为，通常包含"开始做某事"、"每天/每周做某事"等表述，如"开始健身"、"每天读书"等
   - 娱乐类活动如"打游戏"、"看电影"、"听音乐"等应归类为事件，而非任务或习惯
   
2. 对于任务，必须进行智能拆解为3-5个具体子任务
   - 例如："准备演讲"应拆解为"收集资料"、"撰写提纲"、"制作幻灯片"、"练习演讲"等
   - 为每个任务和子任务分配合理的优先级和预估完成时间

3. 对于习惯，必须进行详细分析：
   - 识别用户想要养成的习惯内容
   - 确定习惯的频率（每天、每周几次等）
   - 提供具体的执行计划和追踪方式
   - 对习惯提出合理的建议，如开始时间、持续时长等
   - 如果是"健身"类习惯，需要提供具体的健身方案和计划

4. 时间规划非常重要：
   - 对于明确时间点的事件，保留原始时间
   - 对于有截止日期的任务（如"周五之前完成"），提供合理的时间安排
   - 对于习惯，提供合理的开始时间和执行频率
   - 计算当前日期，并考虑用户提到的时间点进行合理的时间安排
   - 时间安排应尽量具体，包括日期和时间段
   
5. 严格按照以下JSON格式输出结果：
   {
     "events": [
       {
         "id": "自动生成的ID",
         "title": "事件标题",
         "startTime": "事件开始时间（ISO格式）",
         "endTime": "事件结束时间（ISO格式，如果有）",
         "location": "事件地点（如有）",
         "description": "事件描述"
       }
     ],
     "tasks": [
       {
         "id": "自动生成的ID",
         "title": "任务标题",
         "dueDate": "截止日期",
         "description": "任务描述",
         "priority": "优先级评估（high/medium/low）",
         "completed": false,
         "subtasks": [
           {
             "id": "自动生成的子任务ID",
             "title": "子任务标题",
             "description": "子任务描述",
             "scheduledTime": "建议执行时间",
             "estimatedDuration": "预估用时"
           }
         ]
       }
     ],
     "habits": [
       {
         "id": "自动生成的ID",
         "title": "习惯标题",
         "category": "习惯类别（健身、学习、阅读等）",
         "frequency": "执行频率（每天、每周几次等）",
         "timeOfDay": "每天执行时间",
         "description": "习惯描述",
         "plan": {
           "steps": ["具体步骤1", "具体步骤2", "具体步骤3"],
           "milestones": ["第一周目标", "第一个月目标"],
           "tracking": "建议的追踪方式"
         },
         "tips": ["相关建议1", "相关建议2"]
       }
     ]
   }

重要格式要求：
- 你必须只返回有效的JSON格式，不要包含任何其他解释或文本
- 如果没有识别到任何事件，events数组应为空数组，而不是null
- 如果没有识别到任何任务，tasks数组应为空数组，而不是null
- 如果没有识别到任何习惯，habits数组应为空数组，而不是null
- 对于未明确提及的信息，地点可以为空字符串，但时间和优先级必须合理推断
- 结果必须是严格有效的JSON格式，可以被JSON.parse()直接解析`;

/**
 * 获取当前日期和时间的字符串
 * @returns {string} 格式化的当前日期和时间
 */
function getCurrentDateTime() {
  const now = new Date();
  return now.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * 分析用户输入，提取事件、任务和习惯
 * @param {string} userInput - 用户输入的文本
 * @returns {Promise<Object>} - 解析后的结构化数据
 */
export async function analyzeInput(userInput) {
  // 获取当前时间，帮助模型更好地规划
  const currentDateTime = getCurrentDateTime();
  
  // 增强提示，包含当前时间以便于模型做出更好的时间规划
  const enhancedPrompt = `当前时间是${currentDateTime}。请分析以下输入：\n\n${userInput}`;
  
  // 请求数据
  const payload = {
    model: MODEL_NAME,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: enhancedPrompt }
    ],
    temperature: 0.2  // 降低随机性，使输出更加确定性
  };

  try {
    // 发送POST请求
    const response = await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ARK_API_KEY}`,
        "Accept-Charset": "utf-8"
      },
      timeout: 30000 // 30秒超时设置
    });

    // 解析结果
    const result = response.data;
    const assistantMessage = result.choices[0].message.content;
    
    // 尝试将结果解析为JSON
    let parsedResult;
    try {
      // 尝试清理可能存在的非JSON内容（如引号或说明文字）
      let cleanedContent = assistantMessage.trim();
      
      // 如果内容被```包围，则移除这些标记
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.substring(7);
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.substring(3);
      }
      
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.substring(0, cleanedContent.length - 3);
      }
      
      cleanedContent = cleanedContent.trim();
      
      // 解析JSON
      parsedResult = JSON.parse(cleanedContent);
      
      // 确保events、tasks和habits至少是空数组
      if (!parsedResult.events) parsedResult.events = [];
      if (!parsedResult.tasks) parsedResult.tasks = [];
      if (!parsedResult.habits) parsedResult.habits = [];
      
      // 验证JSON格式是否符合预期
      parsedResult = validateJsonStructure(parsedResult);
      
      return {
        success: true,
        data: parsedResult,
        currentTime: currentDateTime
      };
    } catch (error) {
      console.error("解析AI返回结果失败:", error);
      console.log("AI原始返回:", assistantMessage);
      
      // 构造一个默认的空结果
      return {
        success: false,
        error: "解析失败: " + error.message,
        raw: assistantMessage,
        data: { 
          events: [],
          tasks: [],
          habits: []
        }
      };
    }
  } catch (error) {
    console.error("API请求失败:", error.message);
    if (error.response) {
      console.error("错误状态码:", error.response.status);
      console.error("错误详情:", error.response.data);
    } else if (error.request) {
      console.error("未收到响应，可能是网络问题或超时");
    }
    
    return {
      success: false,
      error: "请求失败: " + error.message,
      data: { 
        events: [],
        tasks: [],
        habits: []
      }
    };
  }
}

/**
 * 验证JSON结构是否符合预期格式
 * @param {Object} data - 需要验证的数据
 * @returns {Object} - 验证并修复后的数据
 */
function validateJsonStructure(data) {
  // 检查events数组
  if (data.events && Array.isArray(data.events)) {
    data.events = data.events.map(event => {
      // 确保每个事件都有ID
      if (!event.id) event.id = generateId('event');
      
      // 确保必要字段存在
      if (!event.title) event.title = "未命名事件";
      if (!event.startTime) {
        const date = new Date();
        date.setHours(date.getHours() + 1);
        event.startTime = date.toISOString();
      }
      if (!event.description) event.description = "";
      if (!event.location) event.location = "";
      
      return event;
    });
  }
  
  // 检查tasks数组
  if (data.tasks && Array.isArray(data.tasks)) {
    data.tasks = data.tasks.map(task => {
      // 确保每个任务都有ID
      if (!task.id) task.id = generateId('task');
      
      // 确保必要字段存在
      if (!task.title) task.title = "未命名任务";
      if (!task.description) task.description = "";
      if (!task.priority) task.priority = "medium";
      if (task.completed === undefined) task.completed = false;
      
      // 确保subtasks是数组且每个子任务有必要的字段
      if (!task.subtasks || !Array.isArray(task.subtasks)) {
        task.subtasks = [];
      } else {
        task.subtasks = task.subtasks.map(subtask => {
          // 如果子任务是字符串，转换为对象
          if (typeof subtask === 'string') {
            return {
              id: generateId('subtask'),
              title: subtask,
              description: "",
              estimatedDuration: "未知"
            };
          }
          
          // 确保子任务有ID
          if (!subtask.id) subtask.id = generateId('subtask');
          
          // 确保必要字段存在
          if (!subtask.title) subtask.title = "未命名子任务";
          if (!subtask.description) subtask.description = "";
          if (!subtask.estimatedDuration) subtask.estimatedDuration = "未知";
          
          return subtask;
        });
      }
      
      return task;
    });
  }
  
  // 检查habits数组
  if (data.habits && Array.isArray(data.habits)) {
    data.habits = data.habits.map(habit => {
      // 确保每个习惯都有ID
      if (!habit.id) habit.id = generateId('habit');
      
      // 确保必要字段存在
      if (!habit.title) habit.title = "未命名习惯";
      if (!habit.category) habit.category = "其他";
      if (!habit.frequency) habit.frequency = "daily";
      if (!habit.timeOfDay) habit.timeOfDay = "任意时间";
      if (!habit.description) habit.description = "";
      
      // 确保plan对象存在
      if (!habit.plan) {
        habit.plan = {
          steps: ["开始践行该习惯"],
          milestones: ["坚持一周", "坚持一个月"],
          tracking: "使用习惯追踪App记录"
        };
      } else {
        if (!habit.plan.steps || !Array.isArray(habit.plan.steps)) {
          habit.plan.steps = ["开始践行该习惯"];
        }
        if (!habit.plan.milestones || !Array.isArray(habit.plan.milestones)) {
          habit.plan.milestones = ["坚持一周", "坚持一个月"];
        }
        if (!habit.plan.tracking) {
          habit.plan.tracking = "使用习惯追踪App记录";
        }
      }
      
      // 确保tips数组存在
      if (!habit.tips || !Array.isArray(habit.tips)) {
        habit.tips = ["保持一致性是培养习惯的关键"];
      }
      
      return habit;
    });
  }
  
  return data;
}

/**
 * 生成简单的唯一ID
 * @param {string} prefix - ID前缀
 * @returns {string} - 生成的ID
 */
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export default {
  analyzeInput
}; 