# Integration: `remsana-learning-lesson-video-screenpal`

Apply to **remsana-web** (Vite + React). No backend or database changes.

---

## Prerequisites

- `GET /api/v1/learning/lessons/{id}` returns `video_url` and `duration_sec` as today.
- `learningApi.ts` exposes `recordVideoProgress(lessonId, watchedSeconds, durationSeconds)` (already in the reference project).

---

## Step 1 — Add the video component

**Source (addon):**

`addon/remsana-learning-lesson-video-screenpal/remsana-web/src/app/components/learning/LessonVideoPlayer.tsx`

**Target (your project):**

`remsana-web/src/app/components/learning/LessonVideoPlayer.tsx`

**Action:** Create the `learning` folder under `components` if needed, then copy the file.

---

## Step 2 — Wire the lesson page

**Source (addon):**a

`addon/remsana-learning-lesson-video-screenpal/remsana-web/src/app/pages/LessonPlayerPage.tsx`

**Target (your project):**

`remsana-web/src/app/pages/LessonPlayerPage.tsx`

**Action:** Replace your page with the addon copy **or** merge manually:

1. Import `LessonVideoPlayer` and `isScreenpalLessonUrl` from `../components/learning/LessonVideoPlayer`.
2. Remove any direct `<video src={lesson.video_url} ...>` that only used `onEnded` for progress (progress is now inside `LessonVideoPlayer`).
3. Use `isScreenpalLessonUrl` to set the **video container** class: `min-h-[400px]` for Screenpal (matches iframe height), `aspect-video` for MP4.
4. When the user has started playback, render:

   ```tsx
   <LessonVideoPlayer
     lessonId={lesson.id}
     videoUrl={lesson.video_url}
     durationSec={lesson.duration_sec}
   />
   ```

---

## Step 3 — Verify

1. **Screenpal URL** — Set a lesson’s `video_url` to a Screenpal player URL. Open the lesson player: after “play”, you should see the iframe (not a broken `<video>`). Network tab: periodic `POST .../video-progress` while the tab is visible.
2. **MP4 URL** — Use a direct `.mp4` URL: `<video>` controls work; progress updates while playing; `ended` sends full duration.
3. **Duration** — Ensure `duration_sec` is set in the lesson row so the API receives a sensible `durationSeconds` (backend uses 90% rule for completion).

---

## Rollback

Delete `components/learning/LessonVideoPlayer.tsx` and restore `LessonPlayerPage.tsx` from version control.

---

## Customising behaviour

- **Screenpal embed params** — Edit `buildScreenpalIframeSrc()` in `LessonVideoPlayer.tsx`.
- **PostMessage** — Extend `useScreenpalPostMessageListener()` when Screenpal documents a progress API; **always** validate `event.origin`.
- **Throttle intervals** — Adjust `PROGRESS_POST_INTERVAL_MS` and `MP4_PROGRESS_POST_INTERVAL_MS` at the top of the component file.
