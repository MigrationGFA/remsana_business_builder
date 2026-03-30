# Addon: `remsana-learning-quiz-progress`

Self-contained addon for **quiz attempt limits** and **progress scoring** on the PHP Core API. No database migrations.

---

## What it does

| # | Requirement | Implementation |
|---|-------------|----------------|
| **1** | Max **3 attempts** per user per quiz | `Learning::recordQuizAttempt()` counts existing rows in `learning_quiz_attempts` **before** scoring. If ≥ 3 → **403** with `message: "Maximum attempts reached (3/3)"`. Success response includes `attempts_used`, `attempts_remaining`, `max_attempts`. |
| **1b** | **`attempts_remaining` in quiz response** | `Learning::lesson()` (GET `/api/v1/learning/lessons/{id}`) adds to `quiz`: `attempts_used`, `attempts_remaining`, `max_attempts` when the SME user is authenticated (so the app can show “You have 2 tries left”). |
| **2** | **`averageScore` = highest per quiz, then average** | `Learning::progressMe()` builds the max `score_percent` per `quiz_id`, then sets `averageScore` to the mean of those maxima. Also returns `quizHighestScores` (`quiz_id` → best score). |

**Constant:** `Learning::MAX_QUIZ_ATTEMPTS_PER_QUIZ = 3` — change in one place if policy changes.

---

## Folder layout (this addon)

```
addon/remsana-learning-quiz-progress/
├── README.md                 ← You are here
├── INTEGRATION.md            ← Step-by-step install
└── remsana-core-api/
    └── app/
        └── Controllers/
            └── Api/
                └── Learning.php   ← Canonical controller (copy into project)
```

The **authoritative implementation file** is:

`remsana-core-api/app/Controllers/Api/Learning.php` **inside this addon folder**.

Your deployed app should use the same path **under** `remsana-core-api/` (not under `addon/`).

---

## Related

- **Web UI** (optional): `remsana-web` may consume `attempts_remaining` on the quiz object and handle 403 on submit — see `INTEGRATION.md`.
- **Course admin** (separate addon): `addon/remsana-learning-admin/` for CRUD/upload of courses.
