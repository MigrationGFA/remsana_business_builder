import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, BookOpen, AlertTriangle, Play } from 'lucide-react';
import { Card, CardContent, Button } from '../components/remsana';
import { markLessonComplete, issueCertificate } from '../api/learningApi';

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed?: boolean;
  answers: Record<string, string>;
  questions: Array<{ id: string; question: string; correctAnswer: string }>;
  timeSpent: number;
  attemptsUsed?: number;
  attemptsRemaining?: number;
  maxAttempts?: number;
}

export default function QuizResultsPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const location = useLocation();
  const result = location.state as QuizResult;

  if (!result) {
    return (
      <div className="min-h-screen bg-[#f3f0fa] flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-[14px] text-[#6B7C7C] mb-4">No quiz results found.</p>
            <Button variant="primary" onClick={() => navigate('/learning')}>
              Go to Learning Centre
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { score, totalQuestions, correctAnswers, passed, timeSpent } = result;
  const passedFinal = passed ?? score >= 70;
  const attemptsRemaining = result.attemptsRemaining ?? undefined;
  const attemptsUsed = result.attemptsUsed ?? undefined;
  const maxAttempts = result.maxAttempts ?? undefined;
  const noAttemptsLeft = attemptsRemaining !== undefined && attemptsRemaining <= 0;

  // Auto-mark lesson complete when quiz was passed, so progress updates
  // regardless of which button the user clicks next
  const autoCompleted = useRef(false);
  useEffect(() => {
    if (lessonId && passedFinal && !autoCompleted.current) {
      autoCompleted.current = true;
      markLessonComplete(lessonId).catch(() => {});
    }
  }, [lessonId, passedFinal]);

  // Rewatch-before-retry: when failed with attempts remaining, require video rewatch
  const [showRewatchModal, setShowRewatchModal] = useState(false);
  useEffect(() => {
    if (lessonId && !passedFinal && !noAttemptsLeft) {
      // Flag that user must rewatch before retrying
      sessionStorage.setItem(`remsana_quiz_rewatch_${lessonId}`, 'required');
      setShowRewatchModal(true);
    }
  }, [lessonId, passedFinal, noAttemptsLeft]);
  const performanceLabel =
    score >= 90 ? 'EXCELLENT!' : score >= 80 ? 'GREAT!' : score >= 70 ? 'GOOD!' : 'NEEDS IMPROVEMENT';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const averageTimePerQuestion = totalQuestions > 0 ? Math.round(timeSpent / totalQuestions) : 0;

  const correctQuestions = result.questions.filter((q) => result.answers[q.id] === q.correctAnswer);
  const incorrectQuestions = result.questions.filter((q) => result.answers[q.id] !== q.correctAnswer);

  const handleMarkComplete = async () => {
    if (lessonId && passedFinal) {
      await markLessonComplete(lessonId);
      // Attempt to issue certificate (backend decides if eligible)
      await issueCertificate({
        programme_id: '100DAY_SME',
        title: '100-Day SME Mastery Certificate',
        criteria: `Passed quiz for lesson ${lessonId} with score ${score}%`,
      }).catch(() => {}); // Silently ignore if not eligible yet
    }
    navigate('/learning');
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa]">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[14px] text-[#1C1C8B] hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <h1 className="text-[32px] font-semibold text-[#1F2121] mb-2">✅ Quiz Completed!</h1>
            </div>
            <div className="mb-6">
              <div className="text-[64px] font-bold text-[#1C1C8B] mb-2">⭐ {score}%</div>
              <div className="text-[20px] font-semibold text-[#1F2121] mb-2">{performanceLabel}</div>
              {passedFinal && (
                <div className="text-[14px] text-[#218D8D] font-medium">Congratulations! You passed</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">Breakdown:</h3>
            <div className="space-y-2 text-[14px]">
              <div className="flex justify-between">
                <span className="text-[#6B7C7C]">Questions answered correctly:</span>
                <span className="text-[#1F2121] font-medium">{correctAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7C7C]">Questions answered:</span>
                <span className="text-[#1F2121] font-medium">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7C7C]">Time taken:</span>
                <span className="text-[#1F2121] font-medium">{formatTime(timeSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7C7C]">Average time per question:</span>
                <span className="text-[#1F2121] font-medium">{formatTime(averageTimePerQuestion)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-[16px] font-semibold text-[#1F2121] mb-4">What You Did Well:</h3>
              <div className="space-y-2">
                {correctQuestions.length > 0 ? (
                  correctQuestions.slice(0, 3).map((q) => (
                    <div key={q.id} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#218D8D] flex-shrink-0 mt-0.5" />
                      <span className="text-[14px] text-[#1F2121] line-clamp-2">{q.question}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[14px] text-[#6B7C7C]">Review the lesson to improve.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-[16px] font-semibold text-[#1F2121] mb-4">Areas for Review:</h3>
              <div className="space-y-2">
                {incorrectQuestions.length > 0 ? (
                  incorrectQuestions.map((q) => (
                    <div key={q.id} className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-[#A84B2F] flex-shrink-0 mt-0.5" />
                      <span className="text-[14px] text-[#1F2121] line-clamp-2">{q.question}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[14px] text-[#218D8D]">All correct! Great job.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">Question Reviews:</h3>
            <div className="space-y-4">
              {result.questions.map((q, idx) => {
                const userAnswer = result.answers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;

                return (
                  <div key={q.id} className="pb-4 border-b border-[#6B7C7C]/10 last:border-0">
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-[#218D8D] flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#C01F2F] flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[12px] font-medium ${isCorrect ? 'text-[#218D8D]' : 'text-[#C01F2F]'}`}
                          >
                            {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                          </span>
                          <span className="text-[12px] text-[#6B7C7C]">Question {idx + 1}</span>
                        </div>
                        <p className="text-[14px] text-[#1F2121] mb-2">{q.question}</p>
                        <div className="text-[12px] space-y-1">
                          <p className="text-[#6B7C7C]">
                            Your answer:{' '}
                            <span className="font-medium text-[#1F2121]">{userAnswer?.toUpperCase() ?? '—'}</span>
                            {!isCorrect && <span className="text-[#C01F2F]"> (Wrong)</span>}
                          </p>
                          {!isCorrect && (
                            <p className="text-[#6B7C7C]">
                              Correct answer:{' '}
                              <span className="font-medium text-[#218D8D]">{q.correctAnswer.toUpperCase()}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {passedFinal && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleMarkComplete}
            >
              ✅ Mark Lesson Complete
            </Button>
          )}

          {/* Attempts exhausted without passing */}
          {!passedFinal && noAttemptsLeft && (
            <Card className="border-amber-200 bg-amber-50 mb-3">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[15px] font-semibold text-amber-800 mb-1">All {maxAttempts} Attempts Used</h3>
                    <p className="text-[13px] text-amber-700 mb-3">
                      You've used all your quiz attempts for this lesson. Don't worry — you can rewatch the lesson video to strengthen your understanding, then continue with the next lesson.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/lesson/${lessonId}`)}
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                        Rewatch Lesson
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/learning')}
                      >
                        Continue Learning
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attempts info when some remain */}
          {!passedFinal && !noAttemptsLeft && attemptsRemaining !== undefined && (
            <Card className="border-[#1C1C8B]/20 bg-[#f3f0fa] mb-1">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Play className="w-5 h-5 text-[#1C1C8B] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-semibold text-[#1F2121] mb-1">
                      Rewatch the lesson video before retrying
                    </p>
                    <p className="text-[13px] text-[#6B7C7C]">
                      You have <span className="font-semibold text-[#1C1C8B]">{attemptsRemaining}</span> attempt{attemptsRemaining !== 1 ? 's' : ''} remaining. Watch the video again to review the material, then the quiz will unlock.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {!passedFinal && !noAttemptsLeft && (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate(`/lesson/${lessonId}`)}
              >
                <Play className="w-4 h-4 mr-2" />
                Rewatch Lesson Video
              </Button>
            )}
            {!noAttemptsLeft && passedFinal && (
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => navigate(`/quiz/${lessonId}`)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              className={noAttemptsLeft && !passedFinal ? 'w-full md:col-span-2' : 'w-full'}
              onClick={async () => {
                if (lessonId && passedFinal) await markLessonComplete(lessonId).catch(() => {});
                navigate('/learning');
              }}
            >
              Continue to Next Lesson
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>

      {/* Rewatch modal overlay */}
      {showRewatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#f3f0fa] flex items-center justify-center mx-auto mb-5">
                <Play className="w-8 h-8 text-[#1C1C8B]" />
              </div>
              <h2 className="text-[20px] font-semibold text-[#1F2121] mb-2">Almost There!</h2>
              <p className="text-[14px] text-[#6B7C7C] mb-2">
                You scored <span className="font-semibold text-[#1C1C8B]">{score}%</span> — you need 70% to pass.
              </p>
              <p className="text-[14px] text-[#6B7C7C] mb-6">
                Rewatch the lesson video to review the material, then you'll be able to retake the quiz. You have{' '}
                <span className="font-semibold text-[#1C1C8B]">{attemptsRemaining}</span>{' '}
                attempt{attemptsRemaining !== 1 ? 's' : ''} remaining.
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => { setShowRewatchModal(false); navigate(`/lesson/${lessonId}`); }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Rewatch Lesson Video
                </Button>
                <button
                  onClick={() => setShowRewatchModal(false)}
                  className="text-[13px] text-[#6B7C7C] hover:text-[#1F2121] transition-colors"
                >
                  Review my answers first
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
