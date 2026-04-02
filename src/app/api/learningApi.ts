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
  attempts_used?: number;
  attempts_remaining?: number;
  max_attempts?: number;
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
  is_correct: boolean | string | number;
  sort_order: number;
}

export interface LearningProgress {
  programmeCode?: string;
  currentDay: number;
  totalDays: number;
  totalLessons?: number;
  completionPercentage: number;
  lessonsCompleted: number;
  averageScore: number;
  quizHighestScores?: Array<{
    quiz_id: string;
    lesson_id?: string;
    highest_score: number;
    passed: boolean;
  }>;
  progress: Array<{
    user_id: string;
    lesson_id: string;
    status: 'not_started' | 'in_progress' | 'completed';
    video_progress_sec: number;
    first_started_at?: string;
    completed_at?: string;
    last_event_at?: string;
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
    console.log('[Learning] ➡️ GET /learning/programmes/' + code);
    const response = await api.get<LearningProgramme>(`/learning/programmes/${code}`);
    console.log('[Learning] ⬅️ GET /learning/programmes/' + code + ' response:', response.data);
    // Normalize has_quiz from string "0"/"1" to boolean for all nested lessons
    const data = response.data;
    if (data?.modules) {
      for (const mod of data.modules) {
        for (const lesson of mod.lessons ?? []) {
          (lesson as any).has_quiz = String(lesson.has_quiz) === '1' || lesson.has_quiz === true;
        }
      }
    }
    return data;
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
    console.log('[Learning] ➡️ GET /learning/lessons/' + lessonId);
    const response = await api.get<LearningLesson>(`/learning/lessons/${lessonId}`);
    console.log('[Learning] ⬅️ GET /learning/lessons/' + lessonId + ' response:', response.data, '| video_url:', response.data?.video_url);
    // Normalize has_quiz from string "0"/"1" to boolean
    const data = response.data;
    if (data) {
      (data as any).has_quiz = String(data.has_quiz) === '1' || data.has_quiz === true;
    }
    return data;
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
    console.log('[Learning] ➡️ GET /learning/progress/me');
    const response = await api.get<LearningProgress>('/learning/progress/me');
    console.log('[Learning] ⬅️ GET /learning/progress/me response:', response.data);
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
    console.log('[Learning] ➡️ POST /learning/lessons/' + lessonId + '/view');
    await api.post(`/learning/lessons/${lessonId}/view`);
    console.log('[Learning] ⬅️ POST /learning/lessons/' + lessonId + '/view success');
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
    console.log('[Learning] ➡️ POST /learning/lessons/' + lessonId + '/video-progress', { watchedSeconds, durationSeconds });
    await api.post(`/learning/lessons/${lessonId}/video-progress`, {
      watchedSeconds,
      durationSeconds,
    });
    console.log('[Learning] ⬅️ POST /learning/lessons/' + lessonId + '/video-progress success');
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
): Promise<{ attemptId: string; score: number; passed: boolean; correctAnswers: number; totalQuestions: number; attempts_used?: number; attempts_remaining?: number; max_attempts?: number } | null> {
  if (!hasBackend()) {
    return null;
  }

  try {
    console.log('[Learning] ➡️ POST /learning/quizzes/' + quizId + '/attempt', { answerCount: Object.keys(answers).length, timeSpent });
    const response = await api.post(`/learning/quizzes/${quizId}/attempt`, {
      answers,
      timeSpent,
    });
    console.log('[Learning] ⬅️ POST /learning/quizzes/' + quizId + '/attempt response:', response.data);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 403) {
      const msg = error.response?.data?.message || 'Maximum attempts reached';
      throw new Error(msg);
    }
    console.error('Failed to submit quiz attempt:', error);
    return null;
  }
}

/**
 * Mark lesson as completed (e.g. after passing quiz)
 */
export async function markLessonComplete(lessonId: string): Promise<void> {
  if (!hasBackend()) return;

  try {
    console.log('[Learning] ➡️ POST /learning/lessons/' + lessonId + '/complete');
    await api.post(`/learning/lessons/${lessonId}/complete`);
    console.log('[Learning] ⬅️ POST /learning/lessons/' + lessonId + '/complete success');
  } catch (error) {
    console.error('Failed to mark lesson complete:', error);
  }
}

/**
 * Get user's certificates (standalone list)
 */
export async function getCertificates(): Promise<Array<{
  id: string;
  title: string;
  issued_at: string;
  pdf_url?: string;
  programme_id?: string;
}>> {
  if (!hasBackend()) return [];
  try {
    console.log('[Learning] ➡️ GET /learning/certificates');
    const { data } = await api.get('/learning/certificates');
    console.log('[Learning] ⬅️ GET /learning/certificates response:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch certificates:', error);
    return [];
  }
}

/**
 * Issue a certificate (e.g. after completing a programme)
 */
export async function issueCertificate(params: {
  programme_id: string;
  title: string;
  criteria?: string;
}): Promise<{ id: string; title: string; issued_at: string; pdf_url?: string } | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[Learning] ➡️ POST /learning/certificates', params);
    const { data } = await api.post('/learning/certificates', params);
    console.log('[Learning] ⬅️ POST /learning/certificates response:', data);
    return data;
  } catch (error) {
    console.error('Failed to issue certificate:', error);
    return null;
  }
}
