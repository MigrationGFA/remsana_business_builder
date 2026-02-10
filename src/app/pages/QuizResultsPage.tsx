import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, Download, RotateCcw, ArrowRight } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../components/remsana';

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: Record<string, string>;
  questions: any[];
  timeSpent: number;
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

  const { score, totalQuestions, correctAnswers, timeSpent } = result;
  const passed = score >= 70;
  const performanceLabel = score >= 90 ? 'EXCELLENT!' : score >= 80 ? 'GREAT!' : score >= 70 ? 'GOOD!' : 'NEEDS IMPROVEMENT';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const averageTimePerQuestion = Math.round(timeSpent / totalQuestions);

  return (
    <div className="min-h-screen bg-[#f3f0fa]">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Score Display */}
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <h1 className="text-[32px] font-semibold text-[#1F2121] mb-2">
                ✅ Quiz Completed!
              </h1>
            </div>
            <div className="mb-6">
              <div className="text-[64px] font-bold text-[#1C1C8B] mb-2">
                ⭐ {score}%
              </div>
              <div className="text-[20px] font-semibold text-[#1F2121] mb-2">
                {performanceLabel}
              </div>
              {passed && (
                <div className="text-[14px] text-[#218D8D] font-medium">
                  Congratulations! You passed
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Breakdown */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">
              Breakdown:
            </h3>
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

        {/* Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-[16px] font-semibold text-[#1F2121] mb-4">
                What You Did Well:
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#218D8D] flex-shrink-0 mt-0.5" />
                  <span className="text-[14px] text-[#1F2121]">Psychological Pricing concepts</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#218D8D] flex-shrink-0 mt-0.5" />
                  <span className="text-[14px] text-[#1F2121]">Market positioning strategies</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#218D8D] flex-shrink-0 mt-0.5" />
                  <span className="text-[14px] text-[#1F2121]">Competitive analysis</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-[16px] font-semibold text-[#1F2121] mb-4">
                Areas for Review:
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-[#A84B2F] flex-shrink-0 mt-0.5" />
                  <span className="text-[14px] text-[#1F2121]">
                    Perceived value techniques (1 question missed)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Reviews */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">
              Question Reviews:
            </h3>
            <div className="space-y-4">
              {result.questions.map((q: any, idx: number) => {
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
                          <span className={`text-[12px] font-medium ${isCorrect ? 'text-[#218D8D]' : 'text-[#C01F2F]'}`}>
                            {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                          </span>
                          <span className="text-[12px] text-[#6B7C7C]">
                            Question {idx + 1}
                          </span>
                        </div>
                        <p className="text-[14px] text-[#1F2121] mb-2">{q.question}</p>
                        <div className="text-[12px] space-y-1">
                          <p className="text-[#6B7C7C]">
                            Your answer: <span className="font-medium text-[#1F2121]">{userAnswer?.toUpperCase()}</span>
                            {!isCorrect && (
                              <span className="text-[#C01F2F]"> (Wrong)</span>
                            )}
                          </p>
                          {!isCorrect && (
                            <p className="text-[#6B7C7C]">
                              Correct answer: <span className="font-medium text-[#218D8D]">{q.correctAnswer.toUpperCase()}</span>
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

        {/* Recommended Review */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">
              📚 Recommended Review:
            </h3>
            <div className="space-y-2 text-[14px] text-[#6B7C7C] mb-4">
              <p>• Re-watch: 5:30-7:15 of lesson</p>
              <p>• Resource: "Building Value Guide"</p>
            </div>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {passed && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/learning')}
            >
              ✅ Mark Lesson Complete
            </Button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => navigate(`/quiz/${lessonId}`)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/learning')}
            >
              Continue to Next Lesson
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
