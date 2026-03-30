<?php

/**
 * Addon: remsana-learning-quiz-progress
 *
 * Canonical copy for integration. Deploy by replacing:
 *   remsana-core-api/app/Controllers/Api/Learning.php
 * with this file (or merge the methods: lesson, progressMe, recordQuizAttempt + constant MAX_QUIZ_ATTEMPTS_PER_QUIZ).
 *
 * Behaviour:
 * - Max 3 quiz attempts per user per quiz (recordQuizAttempt).
 * - GET lesson enriches quiz with attempts_used / attempts_remaining / max_attempts.
 * - progressMe: averageScore = mean of highest score per quiz; includes quizHighestScores.
 */

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\LearningProgrammeModel;
use App\Models\LearningLessonModel;
use App\Models\LearningLessonProgressModel;
use App\Models\LearningQuizModel;
use App\Models\LearningQuizAttemptModel;
use App\Models\LearningQuizQuestionModel;
use App\Models\LearningQuizOptionModel;
use App\Models\LearningCertificateModel;
use App\Models\AnalyticsLearningEventModel;
use App\Models\AnalyticsEventModel;

class Learning extends BaseController
{
    protected $format = 'json';

    /** Max submitted quiz attempts per user per quiz (enforced in recordQuizAttempt). */
    public const MAX_QUIZ_ATTEMPTS_PER_QUIZ = 3;

    /**
     * GET /api/v1/learning/programmes/{code}
     * Get programme with modules and lessons
     */
    public function programme(string $code)
    {
        $programmeModel = new LearningProgrammeModel();
        $programme = $programmeModel->getWithModulesAndLessons($code);

        if (!$programme) {
            return $this->failNotFound('Programme not found');
        }

        return $this->respond($programme);
    }

    /**
     * GET /api/v1/learning/lessons/{lessonId}
     * Get lesson details with resources and quiz
     */
    public function lesson(string $lessonId)
    {
        $lessonModel = new LearningLessonModel();
        $lesson = $lessonModel->getWithResources($lessonId);

        if (!$lesson) {
            return $this->failNotFound('Lesson not found');
        }

        // Enrich quiz with attempt counts for the authenticated learner (for "X tries left" UI).
        $userId = $this->request->user['sub'] ?? null;
        if ($userId && !empty($lesson['quiz']['id'])) {
            $attemptModel = new LearningQuizAttemptModel();
            $used = (int) $attemptModel
                ->where('user_id', $userId)
                ->where('quiz_id', $lesson['quiz']['id'])
                ->countAllResults();
            $lesson['quiz']['attempts_used'] = $used;
            $lesson['quiz']['attempts_remaining'] = max(0, self::MAX_QUIZ_ATTEMPTS_PER_QUIZ - $used);
            $lesson['quiz']['max_attempts'] = self::MAX_QUIZ_ATTEMPTS_PER_QUIZ;
        }

        return $this->respond($lesson);
    }

    /**
     * GET /api/v1/learning/progress/me
     * Get current user's learning progress
     */
    public function progressMe()
    {
        $userId = $this->request->user['sub'] ?? null;
        if (!$userId) {
            return $this->fail('Unauthorized', 401);
        }

        $progressModel = new LearningLessonProgressModel();
        $attemptModel = new LearningQuizAttemptModel();
        $certModel = new LearningCertificateModel();

        // Get all progress records
        $progress = $progressModel->where('user_id', $userId)->findAll();
        
        // Get quiz attempts
        $attempts = $attemptModel->where('user_id', $userId)->findAll();
        
        // Get certificates
        $certificates = $certModel->where('user_id', $userId)->findAll();

        // Calculate stats
        $completedLessons = array_filter($progress, fn($p) => $p['status'] === 'completed');
        $totalLessons = count($progress);
        $completionPercentage = $totalLessons > 0 ? round((count($completedLessons) / $totalLessons) * 100) : 0;

        // Average score: highest score per quiz, then mean across quizzes (not mean of every attempt).
        $highestPerQuiz = [];
        foreach ($attempts as $a) {
            $qid = $a['quiz_id'];
            $score = (int) $a['score_percent'];
            if (!isset($highestPerQuiz[$qid]) || $score > $highestPerQuiz[$qid]) {
                $highestPerQuiz[$qid] = $score;
            }
        }
        $avgScore = count($highestPerQuiz) > 0
            ? (int) round(array_sum($highestPerQuiz) / count($highestPerQuiz))
            : 0;

        return $this->respond([
            'currentDay' => count($completedLessons),
            'totalDays' => 100, // This should come from programme
            'completionPercentage' => $completionPercentage,
            'lessonsCompleted' => count($completedLessons),
            'averageScore' => $avgScore,
            /** Per-quiz best scores (same basis as averageScore). */
            'quizHighestScores' => $highestPerQuiz,
            'progress' => $progress,
            'quizAttempts' => $attempts,
            'certificates' => $certificates,
        ]);
    }

    /**
     * POST /api/v1/learning/lessons/{lessonId}/view
     * Record lesson view event (xAPI + analytics)
     */
    public function recordLessonView(string $lessonId)
    {
        $userId = $this->request->user['sub'] ?? null;
        if (!$userId) {
            return $this->fail('Unauthorized', 401);
        }

        $lessonModel = new LearningLessonModel();
        $lesson = $lessonModel->find($lessonId);
        if (!$lesson) {
            return $this->failNotFound('Lesson not found');
        }

        // Update or create progress
        $progressModel = new LearningLessonProgressModel();
        $existing = $progressModel
            ->where('user_id', $userId)
            ->where('lesson_id', $lessonId)
            ->first();

        if ($existing) {
            if ($existing['status'] === 'not_started') {
                $progressModel->update(
                    ['user_id' => $userId, 'lesson_id' => $lessonId],
                    [
                        'status' => 'in_progress',
                        'first_started_at' => date('Y-m-d H:i:s'),
                        'last_event_at' => date('Y-m-d H:i:s'),
                    ]
                );
            } else {
                $progressModel->update(
                    ['user_id' => $userId, 'lesson_id' => $lessonId],
                    ['last_event_at' => date('Y-m-d H:i:s')]
                );
            }
        } else {
            $progressModel->insert([
                'user_id' => $userId,
                'lesson_id' => $lessonId,
                'status' => 'in_progress',
                'first_started_at' => date('Y-m-d H:i:s'),
                'last_event_at' => date('Y-m-d H:i:s'),
            ]);
        }

        // Record xAPI statement
        $this->recordXapiStatement($userId, 'experienced', [
            'id' => 'https://remsana.com/learning/lessons/' . $lessonId,
            'definition' => [
                'type' => 'http://adlnet.gov/expapi/activities/lesson',
                'name' => ['en-US' => $lesson['title']],
            ],
        ]);

        // Record analytics event
        $learningEventModel = new AnalyticsLearningEventModel();
        $learningEventModel->insert([
            'user_id' => $userId,
            'lesson_id' => $lessonId,
            'event_type' => 'lesson',
            'event_name' => 'lesson.viewed',
            'event_data' => json_encode([
                'xapi_verb' => 'experienced',
                'lesson_title' => $lesson['title'],
            ]),
        ]);

        return $this->respond(['status' => 'ok', 'message' => 'Lesson view recorded']);
    }

    /**
     * POST /api/v1/learning/lessons/{lessonId}/video-progress
     * Record video progress
     */
    public function recordVideoProgress(string $lessonId)
    {
        $userId = $this->request->user['sub'] ?? null;
        if (!$userId) {
            return $this->fail('Unauthorized', 401);
        }

        $request = $this->request->getJSON(true);
        $watchedSeconds = $request['watchedSeconds'] ?? 0;
        $durationSeconds = $request['durationSeconds'] ?? 0;

        $progressModel = new LearningLessonProgressModel();
        $progress = $progressModel
            ->where('user_id', $userId)
            ->where('lesson_id', $lessonId)
            ->first();

        if ($progress) {
            $progressModel->update(
                ['user_id' => $userId, 'lesson_id' => $lessonId],
                [
                    'video_progress_sec' => $watchedSeconds,
                    'last_event_at' => date('Y-m-d H:i:s'),
                ]
            );
        } else {
            $progressModel->insert([
                'user_id' => $userId,
                'lesson_id' => $lessonId,
                'status' => 'in_progress',
                'video_progress_sec' => $watchedSeconds,
                'first_started_at' => date('Y-m-d H:i:s'),
                'last_event_at' => date('Y-m-d H:i:s'),
            ]);
        }

        // Record xAPI if video completed
        if ($durationSeconds > 0 && $watchedSeconds >= $durationSeconds * 0.9) {
            $lessonModel = new LearningLessonModel();
            $lesson = $lessonModel->find($lessonId);
            
            $this->recordXapiStatement($userId, 'experienced', [
                'id' => 'https://remsana.com/learning/videos/' . $lessonId . '-main',
                'definition' => [
                    'type' => 'https://w3id.org/xapi/video/activity-type/video',
                ],
            ], [
                'duration' => 'PT' . round($durationSeconds) . 'S',
                'completion' => true,
            ]);
        }

        return $this->respond(['status' => 'ok']);
    }

    /**
     * POST /api/v1/learning/lessons/{lessonId}/complete
     * Mark lesson as completed (e.g. after passing quiz)
     */
    public function markLessonComplete(string $lessonId)
    {
        $userId = $this->request->user['sub'] ?? null;
        if (!$userId) {
            return $this->fail('Unauthorized', 401);
        }

        $lessonModel = new LearningLessonModel();
        $lesson = $lessonModel->find($lessonId);
        if (!$lesson) {
            return $this->failNotFound('Lesson not found');
        }

        $progressModel = new LearningLessonProgressModel();
        $existing = $progressModel
            ->where('user_id', $userId)
            ->where('lesson_id', $lessonId)
            ->first();

        if ($existing) {
            $progressModel->where('user_id', $userId)->where('lesson_id', $lessonId)
                ->set([
                    'status' => 'completed',
                    'completed_at' => date('Y-m-d H:i:s'),
                    'last_event_at' => date('Y-m-d H:i:s'),
                ])->update();
        } else {
            $progressModel->insert([
                'user_id' => $userId,
                'lesson_id' => $lessonId,
                'status' => 'completed',
                'first_started_at' => date('Y-m-d H:i:s'),
                'completed_at' => date('Y-m-d H:i:s'),
                'last_event_at' => date('Y-m-d H:i:s'),
            ]);
        }

        return $this->respond(['status' => 'ok', 'message' => 'Lesson marked complete']);
    }

    /**
     * POST /api/v1/learning/quizzes/{quizId}/attempt
     * Submit quiz attempt
     */
    public function recordQuizAttempt(string $quizId)
    {
        $userId = $this->request->user['sub'] ?? null;
        if (!$userId) {
            return $this->fail('Unauthorized', 401);
        }

        $request = $this->request->getJSON(true);
        $answers = $request['answers'] ?? [];
        $timeSpent = $request['timeSpent'] ?? 0;

        $quizModel = new LearningQuizModel();
        $quiz = $quizModel->find($quizId);
        if (!$quiz) {
            return $this->failNotFound('Quiz not found');
        }

        $attemptModel = new LearningQuizAttemptModel();
        $attemptCountBefore = (int) $attemptModel
            ->where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->countAllResults();

        if ($attemptCountBefore >= self::MAX_QUIZ_ATTEMPTS_PER_QUIZ) {
            return $this->fail([
                'message' => 'Maximum attempts reached (3/3)',
                'attempts_used' => $attemptCountBefore,
                'attempts_remaining' => 0,
                'max_attempts' => self::MAX_QUIZ_ATTEMPTS_PER_QUIZ,
            ], 403, 'MAX_QUIZ_ATTEMPTS');
        }

        // Get questions and correct answers
        $questionModel = new LearningQuizQuestionModel();
        $questions = $questionModel->where('quiz_id', $quizId)->findAll();
        
        $optionModel = new LearningQuizOptionModel();
        $correct = 0;
        $total = count($questions);

        foreach ($questions as $question) {
            $options = $optionModel->where('question_id', $question['id'])->findAll();
            $correctOption = array_filter($options, fn($opt) => $opt['is_correct'] == 1);
            
            $userAnswer = $answers[$question['id']] ?? null;
            if ($userAnswer && isset($correctOption[0]) && $userAnswer === $correctOption[0]['option_key']) {
                $correct++;
            }
        }

        $scorePercent = $total > 0 ? round(($correct / $total) * 100) : 0;
        $passed = $scorePercent >= $quiz['passing_score'];

        // Save attempt
        $attemptId = $attemptModel->insert([
            'user_id' => $userId,
            'quiz_id' => $quizId,
            'score_percent' => $scorePercent,
            'passed' => $passed,
            'started_at' => date('Y-m-d H:i:s', time() - $timeSpent),
            'completed_at' => date('Y-m-d H:i:s'),
            'raw_answers' => json_encode($answers),
        ]);

        // Record xAPI statement
        $this->recordXapiStatement($userId, 'completed', [
            'id' => 'https://remsana.com/learning/quizzes/' . $quizId,
            'definition' => [
                'type' => 'http://adlnet.gov/expapi/activities/assessment',
            ],
        ], [
            'score' => [
                'scaled' => $scorePercent / 100,
                'raw' => $scorePercent,
                'min' => 0,
                'max' => 100,
            ],
            'success' => $passed,
            'completion' => true,
            'duration' => 'PT' . round($timeSpent) . 'S',
        ]);

        // Record analytics event
        $learningEventModel = new AnalyticsLearningEventModel();
        $learningEventModel->insert([
            'user_id' => $userId,
            'quiz_id' => $quizId,
            'event_type' => 'quiz',
            'event_name' => 'quiz.completed',
            'event_data' => json_encode([
                'xapi_verb' => 'completed',
                'score_raw' => $scorePercent,
                'score_scaled' => $scorePercent / 100,
                'success' => $passed,
                'duration_iso8601' => 'PT' . round($timeSpent) . 'S',
            ]),
        ]);

        $attemptsAfter = $attemptCountBefore + 1;
        $attemptsRemaining = max(0, self::MAX_QUIZ_ATTEMPTS_PER_QUIZ - $attemptsAfter);

        return $this->respond([
            'attemptId' => $attemptId,
            'score' => $scorePercent,
            'passed' => $passed,
            'correctAnswers' => $correct,
            'totalQuestions' => $total,
            'attempts_used' => $attemptsAfter,
            'attempts_remaining' => $attemptsRemaining,
            'max_attempts' => self::MAX_QUIZ_ATTEMPTS_PER_QUIZ,
        ]);
    }

    /**
     * GET /api/v1/learning/certificates
     * Get user's certificates
     */
    public function getCertificates()
    {
        $userId = $this->request->user['sub'] ?? null;
        if (!$userId) {
            return $this->fail('Unauthorized', 401);
        }

        $certModel = new LearningCertificateModel();
        $certificates = $certModel->where('user_id', $userId)->findAll();

        return $this->respond($certificates);
    }

    /**
     * POST /api/v1/learning/certificates
     * Issue certificate when criteria met
     */
    public function issueCertificate()
    {
        $userId = $this->request->user['sub'] ?? null;
        if (!$userId) {
            return $this->fail('Unauthorized', 401);
        }

        $request = $this->request->getJSON(true);
        $programmeId = $request['programme_id'] ?? null;
        $title = $request['title'] ?? 'Completion Certificate';

        if (!$programmeId) {
            return $this->fail('Programme ID required', 400);
        }

        // Check if certificate already issued
        $certModel = new LearningCertificateModel();
        $existing = $certModel
            ->where('user_id', $userId)
            ->where('programme_id', $programmeId)
            ->first();

        if ($existing) {
            return $this->respond($existing);
        }

        // Issue certificate
        $certId = $certModel->insert([
            'user_id' => $userId,
            'programme_id' => $programmeId,
            'title' => $title,
            'issued_at' => date('Y-m-d H:i:s'),
            'criteria_json' => json_encode($request['criteria'] ?? []),
        ]);

        // Record xAPI statement
        $this->recordXapiStatement($userId, 'earned', [
            'id' => 'https://remsana.com/learning/certificates/' . $certId,
            'definition' => [
                'type' => 'https://remsana.com/xapi/activity-types/certificate',
                'name' => ['en-US' => $title],
            ],
        ], [
            'completion' => true,
            'success' => true,
        ]);

        $certificate = $certModel->find($certId);
        return $this->respondCreated($certificate);
    }

    /**
     * Record xAPI statement (stores in learning_xapi_statements)
     */
    private function recordXapiStatement(string $userId, string $verb, array $object, array $result = null)
    {
        $xapiModel = new \App\Models\LearningXapiStatementModel();
        
        $actor = [
            'mbox' => 'mailto:' . ($this->request->user['email'] ?? 'user@remsana.com'),
            'name' => $this->request->user['full_name'] ?? 'User',
        ];

        $verbMap = [
            'experienced' => [
                'id' => 'https://w3id.org/xapi/adl/verbs/experienced',
                'display' => ['en-US' => 'experienced'],
            ],
            'completed' => [
                'id' => 'https://w3id.org/xapi/adl/verbs/completed',
                'display' => ['en-US' => 'completed'],
            ],
            'earned' => [
                'id' => 'https://remsana.com/xapi/verbs/earned',
                'display' => ['en-US' => 'earned'],
            ],
        ];

        $xapiModel->insert([
            'user_id' => $userId,
            'actor_json' => json_encode($actor),
            'verb_json' => json_encode($verbMap[$verb] ?? $verbMap['experienced']),
            'object_json' => json_encode($object),
            'result_json' => $result ? json_encode($result) : null,
            'timestamp' => date('Y-m-d H:i:s'),
            'received_at' => date('Y-m-d H:i:s'),
        ]);
    }
}
