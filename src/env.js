/**
 * 环境配置管理
 * 
 * 用于管理不同环境下的API配置
 */

// API基础路径
export const API_BASE_URL = '/api/v1';

// 反馈API端点
export const FEEDBACK_ENDPOINT = `${API_BASE_URL}/feedback`;

// 是否为开发环境
export const isDevelopment = import.meta.env.DEV;

// 开发环境的后端服务器地址
export const BACKEND_DEV_SERVER = 'http://localhost:3000'; 