import axios from 'axios';
import { getAuthHeaders } from './auth';
import { API_BASE_URL, getApiUrl } from '@/env';

// 创建简单日志对象，避免依赖logger.js
const logger = {
  info: (message, data) => {
    console.log(`ℹ️ [CosyVoice] ${message}`, data || '');
  },
  success: (message, data) => {
    console.log(`✅ [CosyVoice] ${message}`, data || '');
  },
  error: (message, error) => {
    console.error(`❌ [CosyVoice] ${message}`, error || '');
  },
  warn: (message, data) => {
    console.warn(`⚠️ [CosyVoice] ${message}`, data || '');
  }
};

/**
 * Upload audio file and optionally trigger voice cloning
 * @param {File} audioFile - The audio file to upload
 * @param {string} feedbackId - Optional feedback message ID to trigger automatic cloning
 * @returns {Promise<Object>} - Upload response data
 */
export const uploadVoiceFile = async (audioFile, feedbackId = null) => {
  logger.info(`Starting voice file upload: ${audioFile.name}, with feedbackId: ${feedbackId || 'none'}`);
  
  try {
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    
    if (feedbackId) {
      formData.append('feedback_id', feedbackId);
      logger.info('Automatic voice cloning will be triggered after upload');
    }
    
    const response = await axios.post(
      `${getApiUrl()}${API_BASE_URL}/voice/upload`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    logger.success('Voice file upload successful', response.data);
    return response.data;
  } catch (error) {
    logger.error('Voice file upload failed', error);
    throw error;
  }
};

/**
 * Trigger voice cloning process
 * @param {string} voiceId - ID of the uploaded voice file
 * @param {string} feedbackId - Feedback message ID
 * @returns {Promise<Object>} - Cloning process response
 */
export const cloneVoice = async (voiceId, feedbackId) => {
  logger.info(`Triggering voice cloning. voiceId: ${voiceId}, feedbackId: ${feedbackId}`);
  
  try {
    const response = await axios.post(
      `${getApiUrl()}${API_BASE_URL}/cosyvoice/clone`,
      { voiceId, feedbackId },
      { headers: getAuthHeaders() }
    );
    
    logger.success('Voice cloning request successful', response.data);
    return response.data;
  } catch (error) {
    logger.error('Voice cloning request failed', error);
    throw error;
  }
};

/**
 * Manually trigger voice synthesis
 * @param {string} voiceId - The cloned voice ID
 * @param {string} feedbackId - Feedback message ID
 * @returns {Promise<Object>} - Synthesis process response
 */
export const synthesizeVoice = async (voiceId, feedbackId) => {
  logger.info(`Triggering voice synthesis. voiceId: ${voiceId}, feedbackId: ${feedbackId}`);
  
  try {
    const response = await axios.post(
      `${getApiUrl()}${API_BASE_URL}/cosyvoice/synthesize`,
      { voiceId, feedbackId },
      { headers: getAuthHeaders() }
    );
    
    logger.success('Voice synthesis request successful', response.data);
    return response.data;
  } catch (error) {
    logger.error('Voice synthesis request failed', error);
    throw error;
  }
};

/**
 * Get voice by voice_id
 * @param {string} voiceId - The cloned voice ID
 * @returns {Promise<Object>} - CosyVoice details
 */
export const getCosyVoiceByVoiceId = async (voiceId) => {
  logger.info(`Fetching CosyVoice by voice_id: ${voiceId}`);
  
  try {
    const response = await axios.get(
      `${getApiUrl()}${API_BASE_URL}/cosyvoice/voice/${voiceId}`,
      { headers: getAuthHeaders() }
    );
    
    logger.success('CosyVoice retrieval successful', response.data);
    return response.data.data.cosyVoice;
  } catch (error) {
    logger.error('CosyVoice retrieval failed', error);
    throw error;
  }
};

/**
 * Get all CosyVoices by feedback ID
 * @param {string} feedbackId - Feedback message ID
 * @returns {Promise<Array>} - List of CosyVoice objects
 */
export const getCosyVoicesByFeedbackId = async (feedbackId) => {
  logger.info(`Fetching CosyVoices for feedback ID: ${feedbackId}`);
  
  try {
    const response = await axios.get(
      `${getApiUrl()}${API_BASE_URL}/cosyvoice/feedback/${feedbackId}`,
      { headers: getAuthHeaders() }
    );
    
    logger.success('CosyVoices retrieval successful', response.data);
    return response.data.data.cosyVoices;
  } catch (error) {
    logger.error('CosyVoices retrieval failed', error);
    throw error;
  }
};

/**
 * Monitor voice cloning and synthesis status
 * @param {string} voiceId - The cloned voice ID
 * @param {Function} statusCallback - Callback function that receives status updates
 * @param {number} intervalMs - Polling interval in milliseconds
 * @param {number} timeoutMs - Maximum time to wait in milliseconds
 * @returns {Promise<Object>} - Final status
 */
export const monitorVoiceProcessing = async (
  voiceId, 
  statusCallback, 
  intervalMs = 5000, 
  timeoutMs = 120000
) => {
  logger.info(`Starting voice processing monitor for voice_id: ${voiceId}`);
  
  const startTime = Date.now();
  let status = null;
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const cosyVoice = await getCosyVoiceByVoiceId(voiceId);
      status = cosyVoice.status;
      
      statusCallback(cosyVoice);
      
      if (status === 'synthesized' || status === 'error') {
        return cosyVoice;
      }
      
      // Wait for the next check
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      logger.error('Error while monitoring voice processing', error);
      throw error;
    }
  }
  
  throw new Error(`Voice processing monitoring timed out after ${timeoutMs/1000} seconds`);
}; 