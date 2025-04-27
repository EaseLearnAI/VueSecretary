const axios = require('axios');
const readline = require('readline');

// 配置参数
const ARK_API_KEY = "6edbe8d5-7584-4c69-b062-6ef8c4d367f4";
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const MODEL_NAME = "ep-20250427122528-dvmvp";

// 创建readline接口用于获取用户输入
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 优化后的提示词模板 - 强调只输出JSON并增加任务拆解说明
const SYSTEM_PROMPT = `你是一个专业的事件和任务分析助手。你需要分析用户输入的自然语言，提取出"具体事件"和"任务"，并进行结构化输出。

分析规则：
1. 识别输入中的"具体事件"和"任务"
   - 事件：通常有明确的时间点，如"明天9点开会"
   - 任务：需要完成的事项，可能没有具体时间点，如"准备演讲"

2. 对于任务，必须进行智能拆解为3-5个具体子任务
   - 例如："准备演讲"应拆解为"收集资料"、"撰写提纲"、"制作幻灯片"、"练习演讲"等
   - 为每个任务和子任务分配合理的优先级和预估完成时间

3. 严格按照以下JSON格式输出结果：
   {
     "events": [
       {
         "time": "事件时间（尽量具体到日期和时刻）",
         "content": "事件内容",
         "location": "事件地点（如有）",
         "priority": "优先级评估（高/中/低）"
       }
     ],
     "tasks": [
       {
         "title": "任务标题",
         "subtasks": ["子任务1", "子任务2", "子任务3"],
         "priority": "优先级建议（高/中/低）",
         "estimatedDuration": "预估完成时间（如：30分钟、2小时等）"
       }
     ]
   }

4. 按照时间先后顺序输出事件

重要说明：
- 你必须只返回有效的JSON格式，不要包含任何其他解释或文本
- 如果没有识别到任何事件，events数组应为空数组，而不是null
- 如果没有识别到任何任务，tasks数组应为空数组，而不是null
- 对于未明确提及的信息，地点可以为空字符串，其他必须合理推断
- 当用户提到"准备"、"完成"、"做"等词语时，应当识别为任务并进行任务拆解
- 确保每个任务都有合理的子任务拆解`;

/**
 * 调用AI模型处理用户输入
 * @param {string} userInput - 用户输入的文本
 * @returns {Promise<object>} - 解析后的结构化数据
 */
async function analyzeInput(userInput) {
  console.log("正在分析...");
  
  // 请求数据
  const payload = {
    model: MODEL_NAME,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userInput }
    ],
    temperature: 0.3  // 降低随机性，使输出更加确定性
  };

  // 记录开始时间
  const startTime = Date.now();
  
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

    // 计算响应时间（毫秒）
    const responseTime = Date.now() - startTime;
    
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
      
      // 确保events和tasks至少是空数组
      if (!parsedResult.events) parsedResult.events = [];
      if (!parsedResult.tasks) parsedResult.tasks = [];
      
    } catch (error) {
      console.log("AI返回的不是有效JSON格式，原始输出：");
      console.log(assistantMessage);
      // 构造一个默认的空结果
      parsedResult = { 
        events: [],
        tasks: [],
        error: "解析失败",
        raw: assistantMessage
      };
    }
    
    return {
      data: parsedResult,
      responseTime,
      tokenUsage: result.usage
    };
  } catch (error) {
    console.error("请求失败:", error.message);
    if (error.response) {
      console.error("错误状态码:", error.response.status);
      console.error("错误详情:", error.response.data);
    } else if (error.request) {
      console.error("未收到响应，可能是网络问题或超时");
    }
    throw error;
  }
}

/**
 * 运行一次测试用例
 */
async function runTest(testInput) {
  console.log(`\n测试输入: "${testInput}"\n`);
  
  try {
    const result = await analyzeInput(testInput);
    
    console.log("分析结果：");
    console.log(JSON.stringify(result.data, null, 2));
    console.log(`\n响应时间: ${result.responseTime}ms`);
    console.log(`Token使用: 输入=${result.tokenUsage.prompt_tokens}, 输出=${result.tokenUsage.completion_tokens}, 总计=${result.tokenUsage.total_tokens}`);
    
    return result;
  } catch (error) {
    console.error("测试失败:", error);
    return null;
  }
}

/**
 * 主函数 - 交互模式
 */
async function interactiveMode() {
  console.log("欢迎使用事件和任务分析器！");
  console.log("请输入您的日程或任务描述，或输入以下命令：");
  console.log("- test1: 测试事件场景");
  console.log("- test2: 测试任务场景");
  console.log("- exit: 退出程序");
  console.log("---------------------------------------------");
  
  rl.on('line', async (input) => {
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log("感谢使用，再见！");
      rl.close();
      return;
    }
    
    // 预设测试用例
    if (input.toLowerCase() === 'test1') {
      await runTest("早上十一点有会议，十二点想打电话给妈妈，晚上七点面试");
    } 
    else if (input.toLowerCase() === 'test2') {
      await runTest("我要准备明天的演讲，拆分下任务吧");
    }
    else {
      try {
        await runTest(input);
      } catch (error) {
        console.error("处理失败，请重试。");
      }
    }
    
    console.log("\n请输入新的描述，或输入'exit'退出：");
  });
}

/**
 * 一次性处理多个测试用例
 */
async function batchTest() {
  const testCases = [
    "早上十一点有会议，十二点想打电话给妈妈，晚上七点面试",
    "明天上午9点开会，中午12点吃饭，下午3点去健身房，还有需要准备周报，晚上还想打一个游戏",
    "下周一下午3点要去医院复诊，周三晚上要参加同学聚会",
    "需要完成项目报告，周五之前交给经理"
  ];
  
  console.log("开始批量测试...\n");
  
  for (const testCase of testCases) {
    await runTest(testCase);
    console.log("---------------------------------------------");
  }
  
  console.log("\n批量测试完成");
  process.exit(0);
}

// 根据命令行参数决定运行模式
if (process.argv.includes('--batch') || process.argv.includes('-b')) {
  batchTest();
} else {
  interactiveMode();
} 