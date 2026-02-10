import { api, hasBackend } from './httpClient';

export interface LearningProgramme {
  id: string;
  code: string;
  name: string;
  description?: string;
  total_days: number;
  modules?: LearningModule[];
}

export interface LearningModule {
  id: string;
  programme_id: string;
  name: string;
  day_start: number;
  day_end: number;
  sort_order: number;
  lessons?: LearningLesson[];
}

export interface LearningLesson {
  id: string;
  module_id: string;
  day_number: number;
  title: string;
  overview?: string;
  video_url?: string;
  duration_sec?: number;
  has_quiz: boolean;
  sort_order: number;
  resources?: LearningResource[];
  quiz?: LearningQuiz;
}

export interface LearningResource {
  id: string;
  lesson_id: string;
  name: string;
  file_url: string;
  format?: string;
  file_size?: number;
}

export interface LearningQuiz {
  id: string;
  lesson_id: string;
  passing_score: number;
  time_limit_sec: number;
  questions?: LearningQuizQuestion[];
}

export interface LearningQuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'single' | 'multiple' | 'truefalse';
  sort_order: number;
  options?: LearningQuizOption[];
}

export interface LearningQuizOption {
  id: string;
  question_id: string;
  option_key: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
}

export interface LearningProgress {
  currentDay: number;
  totalDays: number;
  completionPercentage: number;
  lessonsCompleted: number;
  averageScore: number;
  progress: Array<{
    user_id: string;
    lesson_id: string;
    status: 'not_started' | 'in_progress' | 'completed';
    video_progress_sec: number;
  }>;
  quizAttempts: Array<{
    id: string;
    quiz_id: string;
    score_percent: number;
    passed: boolean;
  }>;
  certificates: Array<{
    id: string;
    title: string;
    issued_at: string;
    pdf_url?: string;
  }>;
}

/**
 * Get 100-day programme with modules and lessons
 */
export async function getProgramme(code: string = '100DAY_SME'): Promise<LearningProgramme | null> {
  if (!hasBackend()) {
    return null;
  }

  try {
    const response = await api.get<LearningProgramme>(`/learning/programmes/${code}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch programme:', error);
    return null;
  }
}

/**
 * Get lesson details with resources and quiz
 */
export async function getLesson(lessonId: string): Promise<LearningLesson | null> {
  if (!hasBackend()) {
    return null;
  }

  try {
    const response = await api.get<LearningLesson>(`/learning/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch lesson:', error);
    return null;
  }
}

/**
 * Get current user's learning progress
 */
export async function getLearningProgress(): Promise<LearningProgress | null> {
  if (!hasBackend()) {
    return null;
  }

  try {
    const response = await api.get<LearningProgress>('/learning/progress/me');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch learning progress:', error);
    return null;
  }
}

/**
 * Record lesson view event
 */
export async function recordLessonView(lessonId: string): Promise<void> {
  if (!hasBackend()) {
    return;
  }

  try {
    await api.post(`/learning/lessons/${lessonId}/view`);
  } catch (error) {
    console.error('Failed to record lesson view:', error);
  }
}

/**
 * Record video progress
 */
export async function recordVideoProgress(
  lessonId: string,
  watchedSeconds: number,
  durationSeconds: number
): Promise<void> {
  if (!hasBackend()) {
    return;
  }

  try {
    await api.post(`/learning/lessons/${lessonId}/video-progress`, {
      watchedSeconds,
      durationSeconds,
    });
  } catch (error) {
    console.error('Failed to record video progress:', error);
  }
}

/**
 * Submit quiz attempt
 */
export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>,
  timeSpent: number
): Promise<{ attemptId: string; score: number; passed: boolean; correctAnswers: number; totalQuestions: number } | null> {
  if (!hasBackend()) {
    return null;
  }

  try {
    const response = await api.post(`/learning/quizzes/${quizId}/attempt`, {
      answers,
      timeSpent,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to submit quiz attempt:', error);
    return null;
  }
}
