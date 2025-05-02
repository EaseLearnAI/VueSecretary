/**
 * CosyVoice API测试脚本
 * 此脚本用于测试语音克隆和合成相关的API功能
 */

import { cosyVoiceApi, authApi } from '../index';
import { API_BASE_URL, BACKEND_DEV_SERVER } from '@/env';

// 彩色日志辅助函数
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  step: (step, message) => console.log(`${colors.bright}${colors.cyan}[步骤 ${step}]${colors.reset} ${message}`),
  success: (message, data) => {
    console.log(`${colors.green}[成功]${colors.reset} ${message}`);
    if (data) console.log(`${colors.yellow}[数据]${colors.reset}`, JSON.stringify(data, null, 2));
  },
  error: (message, error) => {
    console.error(`${colors.red}[错误]${colors.reset} ${message}`);
    if (error?.response?.data) console.error(`${colors.red}[响应]${colors.reset}`, error.response.data);
    else if (error) console.error(error);
  },
  info: (message) => console.log(`${colors.blue}[信息]${colors.reset} ${message}`),
  waiting: (message) => console.log(`${colors.yellow}[等待]${colors.reset} ${message}`)
};

// 等待函数
const wait = async (ms) => {
  log.waiting(`等待${ms/1000}秒...`);
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 测试配置
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'password123'
};

// 主测试函数
async function runCosyVoiceApiTests() {
  log.info(`开始CosyVoice API测试 - 后端URL: ${BACKEND_DEV_SERVER}${API_BASE_URL}`);
  
  try {
    // 步骤1: 检查API连接
    log.step(1, '检查API连接');
    const isConnected = await authApi.checkConnection();
    
    if (!isConnected) {
      throw new Error('无法连接到API服务器，请确保后端服务正在运行');
    }
    
    log.success('成功连接到API服务器');
    
    // 步骤2: 用户登录
    log.step(2, '用户登录');
    await authApi.login(TEST_USER.email, TEST_USER.password);
    
    const currentUser = await authApi.getCurrentUser();
    log.success('用户登录成功', { userId: currentUser?._id, email: currentUser?.email });
    
    // 步骤3: 准备测试文件
    log.step(3, '准备测试音频文件');
    // 创建一个模拟的音频文件
    const testAudioBlob = await createTestAudioBlob();
    const testAudioFile = new File([testAudioBlob], 'test-voice.wav', { type: 'audio/wav' });
    
    log.success('测试音频文件准备完成', { 
      name: testAudioFile.name, 
      size: `${(testAudioFile.size / 1024).toFixed(2)} KB`, 
      type: testAudioFile.type 
    });
    
    // 步骤4: 上传音频文件
    log.step(4, '上传音频文件');
    const feedbackId = '60f7e5d3a2d8b32f4c123456'; // 使用测试反馈ID
    
    const uploadResponse = await cosyVoiceApi.uploadVoiceFile(testAudioFile, feedbackId);
    log.success('音频文件上传成功', uploadResponse.data);
    
    const uploadedFileId = uploadResponse.data.fileId;
    const responseVoiceId = uploadResponse.data.voice_id;
    
    // 如果响应中没有voice_id，则手动触发克隆
    if (!responseVoiceId) {
      log.step(5, '手动触发语音克隆');
      const cloneResponse = await cosyVoiceApi.cloneVoice(uploadedFileId, feedbackId);
      log.success('语音克隆请求成功', cloneResponse.data);
      
      const voiceId = cloneResponse.data.voice_id;
      
      // 步骤6: 监控语音处理状态
      log.step(6, '监控语音处理状态');
      
      let cosyVoice = null;
      try {
        cosyVoice = await cosyVoiceApi.monitorVoiceProcessing(
          voiceId,
          (status) => {
            log.info(`处理状态: ${status.status}`);
          },
          3000, // 每3秒检查一次
          60000  // 最多等待60秒
        );
        
        log.success('语音处理完成', cosyVoice);
      } catch (monitorError) {
        log.error('语音处理监控超时', monitorError);
        
        // 尝试手动触发合成
        log.step('6.1', '手动触发语音合成');
        try {
          const synthesizeResponse = await cosyVoiceApi.synthesizeVoice(voiceId, feedbackId);
          log.success('语音合成请求成功', synthesizeResponse.data);
          
          // 等待10秒后检查合成状态
          await wait(10000);
          
          const finalStatusResponse = await cosyVoiceApi.getCosyVoiceByVoiceId(voiceId);
          log.success('最终语音合成状态', finalStatusResponse);
        } catch (synthesizeError) {
          log.error('手动语音合成失败', synthesizeError);
        }
      }
    } else {
      // 自动克隆过程已启动，直接监控状态
      const voiceId = responseVoiceId;
      log.step(5, '监控自动语音处理状态');
      
      try {
        const cosyVoice = await cosyVoiceApi.monitorVoiceProcessing(
          voiceId,
          (status) => {
            log.info(`处理状态: ${status.status}`);
          },
          3000, // 每3秒检查一次
          60000  // 最多等待60秒
        );
        
        log.success('语音处理完成', cosyVoice);
      } catch (monitorError) {
        log.error('语音处理监控超时', monitorError);
      }
    }
    
    // 步骤7: 根据反馈ID获取所有相关的CosyVoice记录
    log.step(7, '获取与反馈相关的所有语音记录');
    const feedbackVoicesResponse = await cosyVoiceApi.getCosyVoicesByFeedbackId(feedbackId);
    
    log.success(`成功获取${feedbackVoicesResponse.length}条相关的CosyVoice记录`);
    
    // 展示前2条记录
    feedbackVoicesResponse.slice(0, 2).forEach((voice, index) => {
      log.info(`记录 ${index + 1}: voice_id: ${voice.voice_id}, status: ${voice.status}`);
    });
    
    log.info('测试完成');
    
  } catch (error) {
    log.error('测试过程中发生错误', error);
  }
}

// 创建测试音频Blob
async function createTestAudioBlob() {
  try {
    // 尝试从网络获取一个测试音频文件
    const response = await fetch('https://file-examples.com/wp-content/uploads/2017/11/file_example_WAV_1MG.wav');
    return await response.blob();
  } catch (error) {
    log.error('获取测试音频文件失败，创建空白音频', error);
    
    // 创建一个空白的音频文件作为替代
    return new Blob([new Uint8Array(1000)], { type: 'audio/wav' });
  }
}

// 导出测试函数
export default runCosyVoiceApiTests; 