import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Play, CheckCircle2, AlertTriangle, ArrowRight, ChevronDown, ChevronUp, Lock, X, Menu, Clock } from 'lucide-react';
import { Card, CardContent, Button } from '../components/remsana';
import { getLesson, recordLessonView, markLessonComplete, getProgramme, getLearningProgress, getNextLesson } from '../api/learningApi';
import type { LearningLesson, LearningProgramme, LearningModule, LearningProgress } from '../api/learningApi';
import { LessonVideoPlayer, isScreenpalLessonUrl } from '../components/learning/LessonVideoPlayer';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';

function formatDuration(sec?: number): string {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} minute${m !== 1 ? 's' : ''} ${s} second${s !== 1 ? 's' : ''}`;
}

function formatDurationShort(sec?: number): string {
  if (!sec || sec <= 0) return '';
  const n = Number(sec);
  if (n < 60) return `${n}s`;
  return `${Math.floor(n / 60)} min`;
}

type LessonStatus = 'completed' | 'in_progress' | 'not_started' | 'locked';

/**
 * Determine if a lesson is accessible based on sequential completion.
 * Rule: a lesson is unlocked if all previous lessons (in sort order across all modules) are completed.
 * The first lesson is always unlocked. An in-progress lesson is also unlocked.
 */
function buildLessonAccessMap(
  programme: LearningProgramme | null,
  completedIds: Set<string>,
  inProgressIds: Set<string>
): Map<string, LessonStatus> {
  const map = new Map<string, LessonStatus>();
  if (!programme?.modules) return map;

  const sortedModules = [...programme.modules].sort((a, b) => a.sort_order - b.sort_order);
  let allPreviousCompleted = true;

  for (const mod of sortedModules) {
    const sortedLessons = [...(mod.lessons ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    for (const lesson of sortedLessons) {
      if (completedIds.has(lesson.id)) {
        map.set(lesson.id, 'completed');
      } else if (inProgressIds.has(lesson.id)) {
        map.set(lesson.id, 'in_progress');
        allPreviousCompleted = false;
      } else if (allPreviousCompleted) {
        // First not-started lesson after all completed — unlocked
        map.set(lesson.id, 'not_started');
        allPreviousCompleted = false;
      } else {
        map.set(lesson.id, 'locked');
      }
    }
  }
  return map;
}

export default function LessonPlayerPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState<LearningLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [nextLesson, setNextLesson] = useState<LearningLesson | null>(null);

  // Sidebar state
  const [programme, setProgramme] = useState<LearningProgramme | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Progress lookups
  const completedLessonIds = new Set(
    progress?.progress?.filter((p) => p.status === 'completed').map((p) => p.lesson_id) ?? []
  );
  const inProgressLessonIds = new Set(
    progress?.progress?.filter((p) => p.status === 'in_progress').map((p) => p.lesson_id) ?? []
  );

  const lessonAccessMap = buildLessonAccessMap(programme, completedLessonIds, inProgressLessonIds);

  // Count total progress
  const totalLessons = programme?.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0;
  const completedCount = completedLessonIds.size;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  useEffect(() => {
    if (!lessonId) {
      setLoading(false);
      setError('No lesson selected');
      return;
    }
    setVideoPlaying(false);
    setVideoCompleted(false);

    getLesson(lessonId)
      .then((data) => {
        setLesson(data);
        if (data) recordLessonView(lessonId);
      })
      .catch((err) => {
        console.error('Failed to load lesson:', err);
        setError('Failed to load lesson.');
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  // Load programme + progress for sidebar
  useEffect(() => {
    Promise.all([getProgramme('100DAY_SME'), getLearningProgress()])
      .then(([prog, progressData]) => {
        setProgramme(prog);
        setProgress(progressData);
        if (prog && lessonId) {
          const next = getNextLesson(prog, lessonId);
          setNextLesson(next);
          // Auto-expand the module containing the current lesson
          if (prog.modules) {
            const currentModule = prog.modules.find((m) =>
              m.lessons?.some((l) => l.id === lessonId)
            );
            if (currentModule) {
              setExpandedModules(new Set([currentModule.id]));
            }
          }
        }
      })
      .catch((err) => console.error('Failed to load programme/progress:', err));
  }, [lessonId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const handleNextNavigation = async () => {
    if (lessonId && !lesson?.has_quiz) await markLessonComplete(lessonId).catch(() => {});
    if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`);
    } else {
      navigate('/learning');
    }
  };

  const handleVideoComplete = useCallback(() => {
    setVideoCompleted(true);
    if (lessonId && lesson && !lesson.has_quiz) {
      markLessonComplete(lessonId);
    }
    if (lessonId) {
      const flag = sessionStorage.getItem(`remsana_quiz_rewatch_${lessonId}`);
      if (flag === 'required') {
        sessionStorage.setItem(`remsana_quiz_rewatch_${lessonId}`, 'done');
      }
    }
  }, [lessonId, lesson]);

  const quizUnlocked = lessonId && videoCompleted
    && sessionStorage.getItem(`remsana_quiz_rewatch_${lessonId}`) === 'done';

  const overviewLines = lesson?.overview
    ? lesson.overview.split('\n').filter((s) => s.trim())
    : [];

  const navigateToLesson = (targetLessonId: string) => {
    const status = lessonAccessMap.get(targetLessonId);
    if (status === 'locked') return;
    setMobileSidebarOpen(false);
    navigate(`/lesson/${targetLessonId}`);
  };

  // Status icon for sidebar lessons
  const getLessonStatusIcon = (status: LessonStatus, isCurrent: boolean) => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
    if (status === 'locked') return <Lock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />;
    if (isCurrent) return <div className="w-4 h-4 rounded-full border-[3px] border-[#0056D2] flex-shrink-0" />;
    return <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading lesson...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500 mb-4">{error ?? 'Lesson not found.'}</p>
            <Button variant="primary" onClick={() => navigate('/learning')}>
              Back to Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const duration = formatDuration(lesson.duration_sec);
  const screenpalEmbed = lesson.video_url && isScreenpalLessonUrl(lesson.video_url);

  // Find current module name
  const currentModule = programme?.modules?.find((m) => m.lessons?.some((l) => l.id === lessonId));

  // -- Sidebar content (shared between desktop & mobile) --
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-gray-900 truncate">
            {programme?.name ?? '100-Day SME Mastery'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{completedCount}/{totalLessons} lessons completed</p>
        </div>
        <button
          onClick={() => { setSidebarOpen(false); setMobileSidebarOpen(false); }}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors ml-2 flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>{progressPct}% complete</span>
          <span>{completedCount}/{totalLessons}</span>
        </div>
        <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div className="bg-[#0056D2] h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto">
        {programme?.modules
          ?.slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((mod) => {
            const lessons = [...(mod.lessons ?? [])].sort((a, b) => a.sort_order - b.sort_order);
            const isExpanded = expandedModules.has(mod.id);
            const modCompleted = lessons.every((l) => completedLessonIds.has(l.id));
            const modHasProgress = lessons.some((l) => completedLessonIds.has(l.id) || inProgressLessonIds.has(l.id));
            const modLocked = lessons.length > 0 && lessons.every((l) => lessonAccessMap.get(l.id) === 'locked');

            return (
              <div key={mod.id} className="border-b border-gray-100">
                {/* Module header */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-[#0056D2] uppercase tracking-wide">Module {mod.sort_order}</p>
                    <p className="text-sm font-medium text-gray-900 leading-snug">{mod.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {modLocked && <Lock className="w-3.5 h-3.5 text-gray-300" />}
                    {modCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded lessons */}
                {isExpanded && (
                  <div className="pb-1">
                    {lessons.map((l) => {
                      const status = lessonAccessMap.get(l.id) ?? 'locked';
                      const isCurrent = l.id === lessonId;
                      const isLocked = status === 'locked';

                      return (
                        <button
                          key={l.id}
                          onClick={() => navigateToLesson(l.id)}
                          disabled={isLocked}
                          className={`w-full text-left flex items-start gap-3 px-4 py-2.5 transition-colors group ${
                            isCurrent
                              ? 'bg-[#0056D2]/5 border-l-[3px] border-[#0056D2]'
                              : isLocked
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-gray-50 border-l-[3px] border-transparent'
                          }`}
                        >
                          <div className="mt-0.5">
                            {getLessonStatusIcon(status, isCurrent)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] leading-snug ${
                              isCurrent ? 'font-semibold text-[#0056D2]' : 'font-medium text-gray-800'
                            } ${isLocked ? 'text-gray-400' : ''}`}>
                              {l.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                                <Play className="w-2.5 h-2.5" /> Video
                              </span>
                              {l.duration_sec && l.duration_sec > 0 && (
                                <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" /> {formatDurationShort(l.duration_sec)}
                                </span>
                              )}
                              {l.has_quiz && (
                                <span className="text-[11px] text-gray-400">📝 Quiz</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* ─── Top Navbar ─── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            {/* Desktop sidebar toggle (when sidebar is closed) */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <img
              src={remsanaIcon}
              alt="REMSANA"
              className="w-8 h-8 object-contain cursor-pointer"
              onClick={() => navigate('/dashboard')}
            />
            <span className="hidden sm:inline text-sm font-bold text-gray-900">REMSANA</span>
          </div>

          {/* Center: progress indicator */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs text-gray-500">{completedCount}/{totalLessons} learning items</span>
            <div className="w-40 bg-gray-200 rounded-full h-1.5">
              <div className="bg-[#0056D2] h-full rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/learning')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0056D2] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Courses</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Desktop Sidebar ─── */}
        {sidebarOpen && (
          <aside className="hidden lg:flex flex-col w-[340px] xl:w-[380px] bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden">
            {sidebarContent}
          </aside>
        )}

        {/* ─── Mobile Sidebar Drawer ─── */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[320px] max-w-[85vw] bg-white shadow-2xl overflow-hidden">
              {sidebarContent}
            </div>
          </div>
        )}

        {/* ─── Main Content ─── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6">
            {/* Video Player */}
            <div className="rounded-xl overflow-hidden shadow-sm mb-5">
              <div className={`relative bg-black flex items-center justify-center ${
                screenpalEmbed ? 'min-h-[400px]' : 'aspect-video'
              }`}>
                {!videoPlaying ? (
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/70 transition-colors"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-[#0056D2] ml-1" fill="#0056D2" />
                    </div>
                  </button>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    {lesson.video_url ? (
                      <LessonVideoPlayer
                        lessonId={lesson.id}
                        videoUrl={lesson.video_url}
                        durationSec={lesson.duration_sec}
                        onComplete={handleVideoComplete}
                      />
                    ) : (
                      <div className="text-center">
                        <p className="text-sm mb-2">Video Player</p>
                        <p className="text-xs text-white/70">Video URL would play here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Complete Banner */}
            {videoCompleted && !lesson.has_quiz && (
              <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800">Lesson Complete!</p>
                  <p className="text-xs text-green-600">Your progress has been saved.</p>
                </div>
                <Button variant="primary" size="sm" onClick={handleNextNavigation}>
                  Continue Learning
                </Button>
              </div>
            )}

            {/* Quiz Unlocked Banner */}
            {quizUnlocked && lesson.has_quiz && (
              <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800">Quiz Unlocked!</p>
                  <p className="text-xs text-green-600">You're ready to retry the quiz.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => {
                  sessionStorage.removeItem(`remsana_quiz_rewatch_${lessonId}`);
                  navigate(`/quiz/${lessonId}`);
                }}>
                  Retake Quiz
                </Button>
              </div>
            )}

            {/* Lesson Title + Next button row */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {lesson.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentModule && <span className="text-[#0056D2] font-medium">{currentModule.name}</span>}
                  {currentModule && ' · '}
                  Day {lesson.day_number} · {duration}
                </p>
              </div>
              {nextLesson && (
                <button
                  onClick={handleNextNavigation}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#0056D2] border border-[#0056D2] rounded-lg hover:bg-[#0056D2]/5 transition-colors"
                >
                  Go to next item <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Lesson Overview */}
            {overviewLines.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Lesson Overview</h3>
                <ul className="space-y-2">
                  {overviewLines.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#0056D2] mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Downloadable Resources */}
            {lesson.resources && lesson.resources.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3">📥 Downloadable Resources</h3>
                <div className="space-y-2.5">
                  {lesson.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-0.5">{resource.name}</h4>
                        <p className="text-xs text-gray-500">
                          {resource.format ?? 'File'} • {resource.file_size ? `${Math.round(resource.file_size / 1024)} KB` : ''}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => resource.file_url && window.open(resource.file_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-1.5" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz Section */}
            {lesson.has_quiz && lesson.quiz && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Ready for Quiz?</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Test your knowledge on the concepts covered in this lesson.
                </p>
                {lesson.quiz.max_attempts != null && (
                  <p className={`text-[13px] mb-4 ${
                    lesson.quiz.attempts_remaining !== undefined && lesson.quiz.attempts_remaining <= 0
                      ? 'text-red-600 font-medium'
                      : 'text-gray-500'
                  }`}>
                    {lesson.quiz.attempts_remaining !== undefined && lesson.quiz.attempts_remaining <= 0
                      ? `No attempts remaining (${lesson.quiz.attempts_used ?? 0}/${lesson.quiz.max_attempts} used)`
                      : `You have ${lesson.quiz.attempts_remaining ?? lesson.quiz.max_attempts} attempt${(lesson.quiz.attempts_remaining ?? lesson.quiz.max_attempts) !== 1 ? 's' : ''} remaining`
                    }
                  </p>
                )}
                {(!lesson.quiz.max_attempts || !lesson.quiz.attempts_remaining || lesson.quiz.attempts_remaining > 0) ? (
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      onClick={() => navigate(`/quiz/${lesson.id}`)}
                    >
                      ✎ Take Quiz
                    </Button>
                    <Button variant="secondary" size="lg" onClick={() => navigate('/learning')}>
                      Skip for Now
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800 mb-1">All Quiz Attempts Used</p>
                      <p className="text-[13px] text-amber-700 mb-3">
                        You've used all {lesson.quiz.max_attempts} attempts. Rewatch the video to review, then continue.
                      </p>
                      <Button variant="primary" size="sm" onClick={handleNextNavigation}>
                        Continue to Next Lesson
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
