import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent, Button, LinearProgress } from '../components/remsana';
import { getLesson, submitQuizAttempt } from '../api/learningApi';
import type { LearningLesson, LearningQuizOption } from '../api/learningApi';

export default function QuizPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState<LearningLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime] = useState(Date.now());

  const questions = lesson?.quiz?.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const timeLimitSec = lesson?.quiz?.time_limit_sec ?? 600;

  const [timeRemaining, setTimeRemaining] = useState(timeLimitSec);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!lessonId) {
      setLoading(false);
      setError('No lesson selected');
      return;
    }
    getLesson(lessonId)
      .then((data) => {
        setLesson(data);
        if (data?.quiz?.time_limit_sec) {
          setTimeRemaining(data.quiz.time_limit_sec);
        }
      })
      .catch((err) => {
        console.error('Failed to load quiz:', err);
        setError('Failed to load quiz.');
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
  };

  const handleAnswerSelect = (optionKey: string) => {
    if (currentQuestion) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionKey }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (submitted) return;
    const quizId = lesson?.quiz?.id;
    if (!quizId || !lessonId) return;

    setSubmitted(true);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    const result = await submitQuizAttempt(quizId, answers, timeSpent);

    const questionsForReview = questions.map((q) => {
      const correctOpt = (q.options ?? []).find((o) => o.is_correct);
      return {
        id: q.id,
        question: q.question_text,
        correctAnswer: correctOpt?.option_key ?? '',
      };
    });

    if (result) {
      navigate(`/quiz-results/${lessonId}`, {
        state: {
          score: result.score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          passed: result.passed,
          answers,
          questions: questionsForReview,
          timeSpent,
        },
      });
    } else {
      navigate(`/quiz-results/${lessonId}`, {
        state: {
          score: 0,
          totalQuestions: questions.length,
          correctAnswers: 0,
          passed: false,
          answers,
          questions: questionsForReview,
          timeSpent,
        },
      });
    }
  };

  useEffect(() => {
    if (timeRemaining <= 0 && questions.length > 0 && !submitted) {
      handleSubmit();
    }
  }, [timeRemaining, questions.length, submitted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f0fa] flex items-center justify-center">
        <p className="text-[14px] text-[#6B7C7C]">Loading quiz...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-[#f3f0fa] flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-[14px] text-[#6B7C7C] mb-4">{error ?? 'Quiz not found.'}</p>
            <Button variant="primary" onClick={() => navigate('/learning')}>
              Back to Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lesson.quiz || !lesson.has_quiz) {
    return (
      <div className="min-h-screen bg-[#f3f0fa] flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-[14px] text-[#6B7C7C] mb-4">This lesson has no quiz.</p>
            <Button variant="primary" onClick={() => navigate(`/lesson/${lessonId}`)}>
              Back to Lesson
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f3f0fa] flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-[14px] text-[#6B7C7C] mb-4">No questions in this quiz.</p>
            <Button variant="primary" onClick={() => navigate(`/lesson/${lessonId}`)}>
              Back to Lesson
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const options = currentQuestion.options ?? [];

  return (
    <div className="min-h-screen bg-[#f3f0fa]">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/lesson/${lessonId}`)}
            className="flex items-center gap-2 text-[14px] text-[#1C1C8B] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lesson
          </button>
          <button className="text-[14px] text-[#6B7C7C] hover:text-[#1C1C8B]">Pause Quiz</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-[#1F2121] mb-2">📝 Knowledge Check</h1>
          <p className="text-[14px] text-[#6B7C7C] mb-4">
            Day {lesson.day_number}: {lesson.title}
          </p>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] text-[#6B7C7C]">
                Progress: Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-[14px] text-[#6B7C7C]">{Math.round(progress)}%</span>
            </div>
            <LinearProgress value={progress} />
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-[18px] font-semibold text-[#1F2121] mb-6">
              {currentQuestion.question_text}
            </h2>

            <div className="space-y-3">
              {options.map((option: LearningQuizOption) => (
                <label
                  key={option.id}
                  className={`
                    flex items-center gap-3 p-4 border-2 rounded-[8px] cursor-pointer transition-all
                    ${selectedAnswer === option.option_key
                      ? 'border-[#1C1C8B] bg-[#1C1C8B]/5'
                      : 'border-[#6B7C7C]/30 hover:border-[#1C1C8B]/50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.option_key}
                    checked={selectedAnswer === option.option_key}
                    onChange={() => handleAnswerSelect(option.option_key)}
                    className="sr-only"
                  />
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${selectedAnswer === option.option_key ? 'border-[#1C1C8B]' : 'border-[#6B7C7C]/40'}
                    `}
                  >
                    {selectedAnswer === option.option_key && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1C1C8B]" />
                    )}
                  </div>
                  <span className="text-[14px] text-[#1F2121] flex-1">
                    {option.option_key.toUpperCase()}) {option.option_text}
                  </span>
                </label>
              ))}
            </div>

            {selectedAnswer && (
              <div className="mt-4 p-3 bg-[#f3f0fa] rounded-[8px]">
                <p className="text-[12px] text-[#6B7C7C]">
                  Selected: <span className="font-medium text-[#1C1C8B]">{selectedAnswer.toUpperCase()}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-6">
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2 text-[14px] text-[#6B7C7C]">
            <Clock className="w-4 h-4" />
            <span>Time Remaining: {formatTime(timeRemaining)}</span>
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button variant="primary" size="md" onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleSubmit}>
              Submit Quiz
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-4">
            <p className="text-[12px] text-[#6B7C7C]">
              ℹ You can skip questions and come back later. All answers will be submitted at the end.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
