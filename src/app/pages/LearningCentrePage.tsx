import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, LinearProgress, Badge } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { getProgramme, getLearningProgress } from '../api/learningApi';
import type { LearningProgramme, LearningModule, LearningLesson, LearningProgress } from '../api/learningApi';

type ModuleStatus = 'completed' | 'in_progress' | 'locked' | 'coming_soon';

interface ModuleDisplay {
  id: string;
  title: string;
  days: string;
  lessonsCompleted: number;
  totalLessons: number;
  status: ModuleStatus;
  unlockDate?: string;
  firstLessonId: string | null;
  nextLessonId: string | null;
}

export default function LearningCentrePage() {
  const navigate = useNavigate();
  const [programme, setProgramme] = useState<LearningProgramme | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProgramme('100DAY_SME'), getLearningProgress()])
      .then(([progData, progressData]) => {
        setProgramme(progData);
        setProgress(progressData);
      })
      .catch((err) => {
        console.error('Failed to load learning data:', err);
        setError('Failed to load courses. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const completedLessonIds = new Set(
    progress?.progress?.filter((p) => p.status === 'completed').map((p) => p.lesson_id) ?? []
  );

  const modulesDisplay: ModuleDisplay[] = React.useMemo(() => {
    if (!programme?.modules) return [];
    return programme.modules.map((mod: LearningModule) => {
      const lessons = mod.lessons ?? [];
      const totalLessons = lessons.length;
      const lessonsCompleted = lessons.filter((l: LearningLesson) => completedLessonIds.has(l.id)).length;
      const firstLesson = lessons[0] ?? null;
      const nextIncomplete = lessons.find((l: LearningLesson) => !completedLessonIds.has(l.id));
      const allComplete = totalLessons > 0 && lessonsCompleted >= totalLessons;
      const someComplete = lessonsCompleted > 0;
      let status: ModuleStatus = 'locked';
      if (allComplete) status = 'completed';
      else if (someComplete || (firstLesson && completedLessonIds.size === 0)) status = 'in_progress';
      return {
        id: mod.id,
        title: mod.name,
        days: `Day ${mod.day_start}-${mod.day_end}`,
        lessonsCompleted,
        totalLessons,
        status,
        firstLessonId: firstLesson?.id ?? null,
        nextLessonId: (nextIncomplete ?? firstLesson)?.id ?? null,
      };
    });
  }, [programme, completedLessonIds]);

  const currentDay = progress?.currentDay ?? 0;
  const totalDays = programme?.total_days ?? progress?.totalDays ?? 100;
  const completionPercentage = progress?.completionPercentage ?? 0;

  const getStatusBadge = (status: ModuleStatus) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">✓ Completed</Badge>;
      case 'in_progress':
        return <Badge variant="primary">▶ In Progress</Badge>;
      case 'locked':
        return <Badge variant="neutral">🔒 Locked</Badge>;
      case 'coming_soon':
        return <Badge variant="neutral">🔜 Coming Soon</Badge>;
    }
  };

  const handleModuleClick = (mod: ModuleDisplay) => {
    if (mod.status === 'locked') return;
    const targetId = mod.status === 'completed' ? mod.firstLessonId : mod.nextLessonId;
    if (targetId) {
      navigate(`/lesson/${targetId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f0fa] flex items-center justify-center">
        <p className="text-[14px] text-[#6B7C7C]">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f3f0fa] flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-[14px] text-[#6B7C7C] mb-4">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f0fa]">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain" />
            <h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[14px] text-[#1C1C8B] hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-[28px] font-semibold text-[#1F2121] mb-2">📚 Learning Centre</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[14px] text-[#6B7C7C]">
              Your Progress: Day {currentDay} of {totalDays} | {completionPercentage}% Complete
            </span>
          </div>
          <LinearProgress value={completionPercentage} className="mb-4" />
          <div className="flex gap-2">
            <Button variant="primary" size="sm">All Courses</Button>
            <Button variant="secondary" size="sm">In Progress</Button>
            <Button variant="secondary" size="sm">New</Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-[20px] font-semibold text-[#1F2121] mb-2">
              📖 {programme?.name ?? '100-Day SME Mastery Programme'}
            </h3>
            <p className="text-[14px] text-[#6B7C7C]">
              {programme?.description ?? 'Phase 1: Business Fundamentals'}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {modulesDisplay.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-[14px] text-[#6B7C7C]">No modules available. Content will appear here once loaded.</p>
              </CardContent>
            </Card>
          ) : (
            modulesDisplay.map((mod) => {
              const progressPct = mod.totalLessons > 0 ? (mod.lessonsCompleted / mod.totalLessons) * 100 : 0;
              const isClickable = mod.status !== 'locked' && mod.status !== 'coming_soon';

              return (
                <Card
                  key={mod.id}
                  variant={isClickable ? 'hoverable' : 'basic'}
                  className={isClickable ? 'cursor-pointer' : 'opacity-75'}
                  onClick={() => handleModuleClick(mod)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">📹</span>
                          <div>
                            <h4 className="text-[16px] font-semibold text-[#1F2121]">
                              {mod.days}: {mod.title}
                            </h4>
                            <p className="text-[12px] text-[#6B7C7C]">
                              {mod.lessonsCompleted}/{mod.totalLessons} lessons completed
                            </p>
                          </div>
                        </div>
                        {mod.status === 'in_progress' && (
                          <div className="ml-11 mb-2">
                            <LinearProgress value={progressPct} className="mb-1" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(mod.status)}
                        {isClickable && (
                          <Button
                            variant={mod.status === 'in_progress' ? 'primary' : 'secondary'}
                            size="sm"
                          >
                            {mod.status === 'completed' ? 'Review' : 'Continue'} ➜
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
