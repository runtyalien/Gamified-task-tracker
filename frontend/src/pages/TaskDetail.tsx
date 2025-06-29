import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Star, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { User, Task, TaskProgress, apiService } from '../services/api';
import ImageUploader from '../components/ImageUploader';
import { getCurrentDateIST } from '../utils/dateUtils';

interface TaskDetailProps {
  currentUser: User | null;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ currentUser }) => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  
  // Debug: Log taskId changes
  useEffect(() => {
    console.log('TaskDetail component mounted/updated with taskId:', taskId);
  }, [taskId]);
  
  const [task, setTask] = useState<Task | null>(null);
  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [selectedSubtask, setSelectedSubtask] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [submittingTask, setSubmittingTask] = useState<string | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [selectedImagePreview]);

  const loadTaskDetails = async () => {
    try {
      setIsLoading(true);
      
      if (!currentUser || !taskId) {
        console.log('Missing currentUser or taskId:', { currentUser: !!currentUser, taskId });
        return;
      }
      
      console.log('Loading task details for taskId:', taskId);
      
      // Fetch real task data from API
      const [taskData, progressData] = await Promise.all([
        apiService.getTask(taskId),
        apiService.getProgress(currentUser.id, getCurrentDateIST())
      ]);
      
      console.log('Fetched task data:', { taskId, taskName: taskData.name, taskDataId: taskData.id });
      console.log('Progress data for task:', progressData.find(p => p.task_id === taskId));
      
      // Find progress for this specific task
      const taskProgress = progressData.find(p => p.task_id === taskId);
      
      if (!taskProgress) {
        // If no progress found, create initial progress structure
        const initialProgress: TaskProgress = {
          task_id: taskId,
          task_name: taskData.name,
          task_key: taskData.key,
          description: taskData.description,
          reward_rs: taskData.reward_rs,
          reward_xp: taskData.reward_xp,
          subtasks: taskData.subtasks.map(st => ({
            key: st.key,
            name: st.name,
            time_limit: st.time_limit,
            completed: false,
            submission: null
          })),
          progress: { completed: 0, total: taskData.subtasks.length, percentage: 0 },
          is_completed: false
        };
        setProgress(initialProgress);
      } else {
        setProgress(taskProgress);
      }
      
      setTask(taskData);
    } catch (error) {
      console.error('Error loading task details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId && currentUser) {
      // Reset state when taskId changes
      setTask(null);
      setProgress(null);
      setSelectedSubtask(null);
      setUploadingImage(null);
      setSubmittingTask(null);
      setSelectedImagePreview(null);
      
      loadTaskDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, currentUser]);

  const handleImageSelect = async (file: File, subtaskKey: string) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setSelectedImagePreview(previewUrl);
    
    // Automatically start upload
    handleImageUpload(file, subtaskKey);
  };

  const handleImageUpload = async (file: File, subtaskKey: string) => {
    if (!currentUser) return;

    try {
      setUploadingImage(subtaskKey);
      
      // Use the comprehensive upload method with fallback
      const uploadResult = await apiService.uploadImage(file, currentUser.id);
      
      // Submit subtask immediately after upload
      setSubmittingTask(subtaskKey);
      await apiService.submitSubtask(
        taskId!, 
        subtaskKey, 
        uploadResult.publicUrl, 
        currentUser.id,
        uploadResult.presignedUrl,
        (uploadResult as any).key // S3 key from upload result
      );
      
      // Reload progress to show the updated task with image
      await loadTaskDetails();
      setSelectedSubtask(null);
      
      // Clean up preview
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
        setSelectedImagePreview(null);
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(null);
      setSubmittingTask(null);
    }
  };

  // Helper function to format time limit
  const formatTimeLimit = (timeLimitMinutes: number) => {
    if (timeLimitMinutes === 0 || timeLimitMinutes >= 1440) {
      return 'Anytime during the day';
    }
    
    const hours = Math.floor(timeLimitMinutes / 60);
    const minutes = timeLimitMinutes % 60;
    
    let timeString = '';
    if (hours === 0) {
      timeString = '12';
    } else if (hours <= 12) {
      timeString = hours.toString();
    } else {
      timeString = (hours - 12).toString();
    }
    
    if (minutes > 0) {
      timeString += `:${minutes.toString().padStart(2, '0')}`;
    } else {
      timeString += ':00';
    }
    
    const period = hours < 12 ? 'AM' : 'PM';
    return `Before ${timeString} ${period}`;
  };

  // Helper function to check if current time is past deadline
  const isDeadlinePassed = (timeLimitMinutes: number) => {
    if (timeLimitMinutes === 0 || timeLimitMinutes >= 1440) {
      return false; // No deadline
    }
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadline = new Date(todayStart.getTime() + (timeLimitMinutes * 60 * 1000));
    
    return now > deadline;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
          <p className="text-primary-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task || !progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Task not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-primary-100">
        <div className="flex items-center justify-between px-6 py-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-primary-600 hover:text-primary-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-display font-semibold text-primary-800 text-center flex-1 mx-4">
            {task.name}
          </h1>
          <div className="w-8"></div> {/* Spacer for balance */}
        </div>
      </header>

      {/* Task Overview */}
      <section className="px-6 py-6">
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-display font-bold text-primary-800 mb-2">
                {task.name}
              </h2>
              <p className="text-primary-600 leading-relaxed">
                {task.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-white">
              <Star className="w-5 h-5 mx-auto mb-1" />
              <div className="text-lg font-bold">₹{task.reward_rs}</div>
              <div className="text-xs opacity-90">Rewards</div>
            </div>
            <div className="text-center py-3 bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl text-white">
              <CheckCircle className="w-5 h-5 mx-auto mb-1" />
              <div className="text-lg font-bold">{task.reward_xp}XP</div>
              <div className="text-xs opacity-90">Experience</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-primary-600">
                Progress: {progress.progress.completed}/{progress.progress.total} subtasks
              </span>
              <span className="text-primary-500 font-medium">
                {progress.progress.percentage}%
              </span>
            </div>
            <div className="w-full bg-primary-100 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.progress.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Subtasks */}
      <section className="px-6 pb-8">
        <h3 className="text-lg font-display font-semibold text-primary-800 mb-4">
          Subtasks ({progress.progress.completed}/{progress.progress.total})
        </h3>

        <div className="space-y-4">
          {progress.subtasks.map((subtask, index) => (
            <div key={subtask.key} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    subtask.completed 
                      ? 'bg-green-500 text-white' 
                      : selectedSubtask === subtask.key
                        ? 'bg-primary-500 text-white'
                        : 'bg-primary-100 text-primary-600'
                  }`}>
                    {subtask.completed ? <CheckCircle size={16} /> : index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-800">{subtask.name}</h4>
                    <div className="flex items-center text-sm space-x-2">
                      <Clock size={14} className={isDeadlinePassed(subtask.time_limit) ? 'text-red-500' : 'text-primary-500'} />
                      <span className={isDeadlinePassed(subtask.time_limit) ? 'text-red-600 font-medium' : 'text-primary-500'}>
                        {formatTimeLimit(subtask.time_limit)}
                      </span>
                      {isDeadlinePassed(subtask.time_limit) && !subtask.completed && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          Deadline Passed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {subtask.completed ? (
                  <div className="space-y-2">
                    <div className="badge-success">
                      <CheckCircle size={14} className="mr-1" />
                      Completed
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedSubtask(
                      selectedSubtask === subtask.key ? null : subtask.key
                    )}
                    className="btn-secondary text-sm py-2 px-4"
                    disabled={uploadingImage === subtask.key || submittingTask === subtask.key}
                  >
                    {uploadingImage === subtask.key || submittingTask === subtask.key ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : selectedSubtask === subtask.key ? (
                      'Cancel'
                    ) : (
                      <>
                        <Upload size={14} className="mr-1" />
                        Submit Proof
                      </>
                    )}
                  </button>
                )}
              </div>

              {selectedSubtask === subtask.key && !subtask.completed && (
                <div className="mt-4 pt-4 border-t border-primary-100">
                  {isDeadlinePassed(subtask.time_limit) && subtask.time_limit > 0 && subtask.time_limit < 1440 && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Deadline has passed</p>
                          <p className="text-xs text-orange-600 mt-1">
                            You can still upload proof for tracking, but this submission won't count towards rewards or XP.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-primary-600 mb-4">
                    Upload a photo as proof of completion for "{subtask.name}"
                  </p>
                  
                  {/* Show image preview if available */}
                  {selectedImagePreview && uploadingImage === subtask.key && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-primary-700 mb-2">Selected Image:</div>
                      <img 
                        src={selectedImagePreview} 
                        alt="Selected for upload"
                        className="w-full max-w-md h-32 object-cover rounded-lg shadow-md border-2 border-primary-200"
                      />
                    </div>
                  )}
                  
                  <ImageUploader
                    onImageSelect={(file) => handleImageSelect(file, subtask.key)}
                    isUploading={uploadingImage === subtask.key || submittingTask === subtask.key}
                    currentImage={selectedImagePreview && uploadingImage === subtask.key ? selectedImagePreview : undefined}
                  />
                </div>
              )}

              {/* Show submitted image for completed subtasks */}
              {subtask.completed && subtask.submission && (
                <div className={`mt-4 pt-4 border-t rounded-lg p-4 ${
                  subtask.submission.is_valid 
                    ? 'border-green-100 bg-green-50' 
                    : 'border-orange-100 bg-orange-50'
                }`}>
                  <div className={`text-sm font-medium mb-3 flex items-center ${
                    subtask.submission.is_valid ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    <CheckCircle size={16} className="mr-2" />
                    Submitted Proof:
                  </div>
                  <div className="relative">
                    <img 
                      src={subtask.submission.presigned_url || subtask.submission.image_url} 
                      alt={`Proof for ${subtask.name}`}
                      className={`w-full max-w-md h-48 object-cover rounded-lg shadow-lg border-2 ${
                        subtask.submission.is_valid ? 'border-green-300' : 'border-orange-300'
                      }`}
                      onError={(e) => {
                        // Fallback to public URL if presigned URL fails
                        if (subtask.submission?.image_url && e.currentTarget.src !== subtask.submission.image_url) {
                          e.currentTarget.src = subtask.submission.image_url;
                        }
                      }}
                    />
                    <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium shadow-lg text-white ${
                      subtask.submission.is_valid 
                        ? 'bg-green-500' 
                        : 'bg-orange-500'
                    }`}>
                      {subtask.submission.is_valid ? '✓ Verified' : '⚠ Deadline Passed'}
                    </div>
                  </div>
                  <div className={`text-xs mt-2 flex items-center ${
                    subtask.submission.is_valid ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    <Clock size={12} className="mr-1" />
                    Submitted on {new Date(subtask.submission.submitted_at).toLocaleDateString()} at{' '}
                    {new Date(subtask.submission.submitted_at).toLocaleTimeString()}
                  </div>
                  {!subtask.submission.is_valid && subtask.submission.validation_message && (
                    <div className="text-xs text-orange-600 mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {subtask.submission.validation_message}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {progress.is_completed && (
          <div className={`card mt-6 text-white ${
            progress.is_reward_eligible !== false 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-orange-500 to-amber-600'
          }`}>
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">
                Task Completed! {progress.is_reward_eligible !== false ? '🎉' : '⚠️'}
              </h3>
              {progress.is_reward_eligible !== false ? (
                <p className="opacity-90 mb-4">
                  You've earned ₹{task.reward_rs} and {task.reward_xp}XP!
                </p>
              ) : (
                <p className="opacity-90 mb-4">
                  Task completed but some submissions were past deadline. No rewards earned.
                </p>
              )}
              <button 
                onClick={() => navigate('/rewards')}
                className={`font-semibold py-2 px-6 rounded-2xl transition-colors ${
                  progress.is_reward_eligible !== false
                    ? 'bg-white text-green-600 hover:bg-green-50'
                    : 'bg-white text-orange-600 hover:bg-orange-50'
                }`}
              >
                View {progress.is_reward_eligible !== false ? 'Rewards' : 'Progress'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TaskDetail;
