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

/**
 * Get audio URL for a specific feedback ID and type
 * @param {string} feedbackId - The feedback ID
 * @param {string} type - The audio type ('encourage' or 'criticize')
 * @returns {Promise<string|null>} - Audio URL if available, null otherwise
 */
export const getAudioUrlByFeedbackId = async (feedbackId, type) => {
  try {
    if (!feedbackId) {
      logger.error('No feedback ID provided for audio retrieval');
      return null;
    }
    
    const validTypes = ['encourage', 'criticize'];
    if (!validTypes.includes(type)) {
      logger.error(`Invalid audio type: ${type}. Must be 'encourage' or 'criticize'`);
      return null;
    }
    
    logger.info(`Fetching ${type} audio for feedback ID: ${feedbackId}`);
    
    // This endpoint directly returns the audio URL for the specified type (encourage/criticize)
    const response = await axios.get(
      `${getApiUrl()}${API_BASE_URL}/cosyvoice/feedback/${feedbackId}/audio?type=${type}`,
      { headers: getAuthHeaders() }
    );
    
    if (response.data && response.data.success && response.data.data && response.data.data.audioUrl) {
      const audioUrl = response.data.data.audioUrl;
      logger.info(`Successfully retrieved ${type} audio URL: ${audioUrl}`);
      return audioUrl;
    } else {
      logger.warn(`No ${type} audio URL found for feedback ID: ${feedbackId}`, response.data);
      return null;
    }
  } catch (err) {
    logger.error(`Error fetching ${type} audio:`, err);
    return null;
  }
};

/**
 * Play audio automatically in the background
 * @param {string} audioUrl - The URL of the audio to play
 * @param {number} volume - Volume level (0-1), default 0.7
 * @returns {Promise<HTMLAudioElement|null>} - The audio element if successful
 */
export const playAudioInBackground = (audioUrl, volume = 0.7) => {
  if (!audioUrl) {
    logger.error('Cannot play audio: No URL provided');
    return null;
  }
  
  logger.info(`Playing audio from URL: ${audioUrl}`);
  
  try {
    // Create an audio element
    const audioElement = new Audio();
    
    // Add event listeners for debugging
    audioElement.addEventListener('canplay', () => {
      logger.info('Audio is ready to play');
    });
    
    audioElement.addEventListener('play', () => {
      logger.info('Audio playback started');
    });
    
    audioElement.addEventListener('ended', () => {
      logger.info('Audio playback completed');
    });
    
    audioElement.addEventListener('error', (e) => {
      logger.error(`Audio error (${e.target.error ? e.target.error.code : 'unknown'}):`, e);
    });
    
    // Set properties
    audioElement.crossOrigin = "anonymous"; // Try to allow cross-origin playback
    audioElement.volume = volume;
    audioElement.src = audioUrl;
    audioElement.preload = "auto";
    
    // Ensure audio plays by handling promise rejection carefully
    audioElement.play()
      .then(() => {
        logger.info('Audio playback started successfully');
      })
      .catch(error => {
        logger.error('Error playing audio (likely autoplay restriction):', error);
        // Create user interaction to bypass autoplay restrictions
        try {
          // Create a button that will be clicked programmatically
          const button = document.createElement('button');
          button.innerHTML = 'Play Audio';
          button.style.cssText = 'position: fixed; z-index: 9999; bottom: 20px; right: 20px; background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;';
          button.onclick = async () => {
            try {
              await audioElement.play();
              logger.info('Audio playback started through user interaction');
              document.body.removeChild(button);
            } catch (e) {
              logger.error('Audio playback failed even with user interaction:', e);
              document.body.removeChild(button);
            }
          };
          
          // Add the button to the DOM and simulate a click
          document.body.appendChild(button);
          setTimeout(() => button.click(), 100);
        } catch (btnError) {
          logger.error('Failed to create interactive playback button:', btnError);
        }
      });
    
    return audioElement;
  } catch (error) {
    logger.error('Error creating audio element:', error);
    return null;
  }
};

/**
 * Play task completion audio based on success status
 * Uses localStorage for saved voice data or falls back to default test feedbackId
 * @param {boolean} isSuccess - Whether the task was successfully completed
 * @returns {Promise<HTMLAudioElement|null>} - The audio element if successful
 */
export const playTaskFeedbackAudio = async (isSuccess) => {
  try {
    logger.info(`Attempting to play ${isSuccess ? 'encouraging' : 'criticism'} audio`);
    
    // First try to get the feedbackId from localStorage
    let feedbackId = null;
    const savedVoiceData = localStorage.getItem('savedVoiceData');
    
    if (savedVoiceData) {
      try {
        const parsedData = JSON.parse(savedVoiceData);
        logger.info('Found voice data in localStorage:', parsedData);
        feedbackId = parsedData.feedbackId;
      } catch (parseError) {
        logger.error('Failed to parse saved voice data:', parseError);
      }
    }
    
    // If no feedbackId found in localStorage, use a default one for testing
    if (!feedbackId) {
      logger.warn('No feedback ID found in localStorage, using default test ID');
      feedbackId = getDefaultFeedbackId();
      logger.info(`Using default feedback ID: ${feedbackId}`);
    }
    
    // Get the appropriate audio URL based on success status
    const type = isSuccess ? 'encourage' : 'criticize';
    const audioUrl = await getAudioUrlByFeedbackId(feedbackId, type);
    
    if (!audioUrl) {
      logger.warn(`No ${type} audio URL found for feedback ID: ${feedbackId}`);
      return null;
    }
    
    logger.info(`Playing ${type} audio from URL: ${audioUrl}`);
    
    // Play the audio with higher volume for better chance of hearing it
    const audioElement = playAudioInBackground(audioUrl, 0.9);
    
    // Force another play attempt after a short delay if browser policies might be blocking autoplay
    setTimeout(() => {
      if (audioElement) {
        logger.info('Attempting second play in case of autoplay blocking...');
        audioElement.play().catch(error => {
          logger.error('Second play attempt failed:', error);
        });
      }
    }, 300);
    
    return audioElement;
  } catch (error) {
    logger.error('Error playing task feedback audio:', error);
    return null;
  }
};

/**
 * Play a test sound to verify audio playback works
 * @param {number} frequency - Sound frequency in Hz (default: 440)
 * @param {number} duration - Sound duration in ms (default: 1000)
 * @param {number} volume - Sound volume from 0 to 1 (default: 0.5)
 * @returns {Promise<boolean>} - True if sound played successfully
 */
export const playTestSound = (frequency = 440, duration = 1000, volume = 0.5) => {
  try {
    logger.info('Playing test sound...');
    
    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    
    // Create oscillator
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // Create gain node for volume control
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volume;
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Start and stop oscillator
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      logger.info('Test sound completed');
    }, duration);
    
    return true;
  } catch (error) {
    logger.error('Failed to play test sound:', error);
    return false;
  }
};

/**
 * Play task feedback audio directly using feedbackId without relying on localStorage
 * @param {string} feedbackId - The feedback ID to use for audio retrieval
 * @param {boolean} isSuccess - Whether the task was successfully completed (true for encourage, false for criticize)
 * @returns {Promise<HTMLAudioElement|null>} - The audio element if successful
 */
export const playDirectFeedbackAudio = async (feedbackId, isSuccess) => {
  try {
    if (!feedbackId) {
      logger.error('No feedback ID provided for direct audio playback');
      return null;
    }
    
    logger.info(`Attempting to play ${isSuccess ? 'encouraging' : 'criticism'} audio for feedback ID: ${feedbackId}`);
    
    // Get the appropriate audio URL based on success status
    const type = isSuccess ? 'encourage' : 'criticize';
    const audioUrl = await getAudioUrlByFeedbackId(feedbackId, type);
    
    if (!audioUrl) {
      logger.warn(`No ${type} audio URL found for feedback ID: ${feedbackId}`);
      return null;
    }
    
    logger.info(`Successfully retrieved ${type} audio URL: ${audioUrl}`);
    
    // Play the audio
    return playAudioInBackground(audioUrl);
  } catch (error) {
    logger.error('Error playing direct feedback audio:', error);
    return null;
  }
};

/**
 * Get a known valid feedback ID for testing
 * This is useful when no user-specific feedback ID is available
 * @returns {string} A valid feedback ID from the database
 */
export const getDefaultFeedbackId = () => {
  // These feedback IDs are known to exist in the database
  // They will be used as fallbacks if no specific feedback ID is provided
  const knownFeedbackIds = [
    "6814bb3ba19fa35164e6293a",  // Recent feedback with multiple voices
    "68121dd0b2b965fc7ddc96a7"   // Older feedback with test voice
  ];
  
  // Return the first one as the default
  return knownFeedbackIds[0];
}; 