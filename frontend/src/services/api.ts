import axios from 'axios';
import { getCurrentDateIST, formatDateForAPI } from '../utils/dateUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  name: string;
  xp: number;
  rs_earned: number;
  level: number;
  streak_count: number;
  next_level_xp: number;
  created_at: string;
}

export interface Task {
  id: string;
  name: string;
  key: string;
  description?: string;
  subtasks: Subtask[];
  reward_rs: number;
  reward_xp: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  name: string;
  key: string;
  time_limit: number;
}

export interface TaskProgress {
  task_id: string;
  task_name: string;
  task_key: string;
  description?: string;
  reward_rs: number;
  reward_xp: number;
  subtasks: SubtaskProgress[];
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  is_completed: boolean;
  is_reward_eligible?: boolean;
}

export interface SubtaskProgress {
  key: string;
  name: string;
  time_limit: number;
  completed: boolean;
  submission: TaskSubmission | null;
}

export interface TaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  subtask_key: string;
  image_url: string;
  presigned_url?: string;
  s3_key?: string;
  submitted_at: string;
  date: string;
  is_valid: boolean;
  validation_message?: string;
}

export interface Reward {
  reward_id: string;
  task_id: string;
  task_name: string;
  task_key: string;
  reward_rs: number;
  reward_xp: number;
  total_reward_rs: number;
  total_reward_xp: number;
  bonus_multiplier: number;
  bonus_reason?: string;
  awarded_at: string;
}

export interface S3PresignResponse {
  presignedUrl: string;
  key: string;
  publicUrl: string;
}

// API Functions
export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },

  // Users
  async getUser(userId: string): Promise<User> {
    const response = await api.get(`/api/users/${userId}`);
    return response.data.data;
  },

  async createUser(name: string): Promise<User> {
    const response = await api.post('/api/users', { name });
    return response.data.data;
  },

  async getLeaderboard(limit: number = 10, type: string = 'xp') {
    const response = await api.get(`/api/users/leaderboard?limit=${limit}&type=${type}`);
    return response.data.data;
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    const response = await api.get('/api/tasks?active=true');
    return response.data.data;
  },

  async getTask(taskId: string): Promise<Task> {
    const response = await api.get(`/api/tasks/${taskId}`);
    return response.data.data;
  },

  // Progress
  async getProgress(userId: string, date: string): Promise<TaskProgress[]> {
    const response = await api.get(`/api/progress/${date}?user_id=${userId}`);
    return response.data.data.tasks;
  },

  async getProgressSummary(userId: string, date: string) {
    const response = await api.get(`/api/progress/${date}?user_id=${userId}`);
    return response.data.data.summary;
  },

  // Rewards
  async getRewards(userId: string, date: string) {
    const response = await api.get(`/api/rewards/${date}?user_id=${userId}`);
    return response.data.data;
  },

  async getRewardStats(userId: string, period: 'today' | 'week' | 'month') {
    const response = await api.get(`/api/rewards/stats/${period}?user_id=${userId}`);
    return response.data.data;
  },

  // S3 Operations
  async getS3PresignedUrl(fileName: string, fileType: string, userId: string): Promise<S3PresignResponse> {
    const response = await api.post('/api/s3/presign', {
      fileName,
      fileType,
      userId
    });
    return response.data.data;
  },

  async uploadImageToS3(presignedUrl: string, file: File): Promise<void> {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  },

  // Primary upload method - Backend handles S3 upload
  async uploadImageDirect(file: File, userId: string): Promise<{ key: string; publicUrl: string; presignedUrl?: string }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);

    const response = await api.post('/api/s3/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout for uploads
    });
    return response.data.data;
  },

  // Main upload method with fallback
  async uploadImage(file: File, userId: string): Promise<{ publicUrl: string; presignedUrl?: string }> {
    try {
      // Primary method: Backend handles S3 upload (no CORS issues)
      console.log('Uploading image through backend...');
      const result = await this.uploadImageDirect(file, userId);
      console.log('Upload successful:', result.publicUrl);
      return {
        publicUrl: result.publicUrl,
        presignedUrl: result.presignedUrl
      };
    } catch (directError) {
      console.warn('Backend upload failed, trying presigned URL method:', directError);
      
      try {
        // Fallback: Use presigned URL method (may have CORS issues)
        const presignResponse = await this.getS3PresignedUrl(file.name, file.type, userId);
        await this.uploadImageToS3(presignResponse.presignedUrl, file);
        return {
          publicUrl: presignResponse.publicUrl,
          presignedUrl: undefined // Presigned URL only available in primary method
        };
      } catch (presignError) {
        console.error('All upload methods failed:', presignError);
        throw new Error(
          (directError as any)?.response?.data?.error || 
          'Failed to upload image. Please check your connection and try again.'
        );
      }
    }
  },

  // Task Submissions
  async submitSubtask(
    taskId: string,
    subtaskKey: string,
    imageUrl: string,
    userId: string,
    presignedUrl?: string,
    s3Key?: string
  ) {
    const response = await api.post(
      `/api/tasks/${taskId}/subtasks/${subtaskKey}/submit`,
      {
        image_url: imageUrl,
        presigned_url: presignedUrl,
        s3_key: s3Key,
        submitted_at: new Date().toISOString(),
        user_id: userId
      }
    );
    return response.data.data;
  },

  // Bonus Activity Submission
  async submitBonusActivity(
    taskId: string,
    subtaskKey: string,
    imageUrl: string,
    userId: string,
    bonusType: string = 'additional_video',
    rewardRs: number = 20,
    presignedUrl?: string,
    s3Key?: string
  ) {
    const response = await api.post(
      `/api/tasks/${taskId}/subtasks/${subtaskKey}/bonus`,
      {
        image_url: imageUrl,
        presigned_url: presignedUrl,
        s3_key: s3Key,
        submitted_at: new Date().toISOString(),
        user_id: userId,
        bonus_type: bonusType,
        reward_rs: rewardRs
      }
    );
    return response.data.data;
  }
};

// Offline support
export const offlineService = {
  saveOfflineTask(taskData: any) {
    const offlineTasks = JSON.parse(localStorage.getItem('offlineTasks') || '[]');
    offlineTasks.push({
      ...taskData,
      timestamp: new Date().toISOString(),
      synced: false
    });
    localStorage.setItem('offlineTasks', JSON.stringify(offlineTasks));
  },

  getOfflineTasks() {
    return JSON.parse(localStorage.getItem('offlineTasks') || '[]');
  },

  clearOfflineTasks() {
    localStorage.removeItem('offlineTasks');
  }
};

export default api;
