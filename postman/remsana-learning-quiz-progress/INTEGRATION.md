# Integration: `remsana-learning-quiz-progress`

Apply this addon to a REMSANA **remsana-core-api** project that already has the Learning routes and `learning_quiz_attempts` table.

---

## Step 1 — Install the controller (required)

**Source (addon):**

`addon/remsana-learning-quiz-progress/remsana-core-api/app/Controllers/Api/Learning.php`

**Target (your project):**

`remsana-core-api/app/Controllers/Api/Learning.php`

**Action:**

1. Back up the existing `Learning.php` if you have local changes.
2. **Replace** the target file with the addon copy **or** merge manually:
   - Add `public const MAX_QUIZ_ATTEMPTS_PER_QUIZ = 3;`
   - Update methods: `lesson()`, `progressMe()`, `recordQuizAttempt()` as in the addon file.

No route changes are required if your `Routes.php` already maps the standard Learning endpoints.

---

## Step 2 — Verify

```bash
cd remsana-core-api
php spark routes | grep -i learning
```

**Manual checks:**

1. **Authenticated** `GET /api/v1/learning/lessons/{lessonId}` — response `quiz` includes `attempts_remaining` (and `attempts_used`, `max_attempts`).
2. `POST /api/v1/learning/quizzes/{quizId}/attempt` — fourth submission in a row returns **403** and message **Maximum attempts reached (3/3)**.
3. `GET /api/v1/learning/progress/me` — `averageScore` reflects **mean of best score per quiz**; `quizHighestScores` lists per-quiz bests.

---

## Step 3 — Frontend (optional)

If you use **remsana-web**:

- Ensure `learningApi` types include optional `attempts_used`, `attempts_remaining`, `max_attempts` on the quiz object.
- On quiz submit, handle **403** and show the API message.
- Optionally show “You have X tries left” from `lesson.quiz.attempts_remaining`.

Reference implementation may exist in the main repo under `remsana-web/src/app/api/learningApi.ts` and `QuizPage.tsx`; copy behaviour if your branch differs.

---

## Rollback

Restore the previous `Learning.php` from backup.

---

## Database

Uses existing table **`learning_quiz_attempts`**. No new migrations.
