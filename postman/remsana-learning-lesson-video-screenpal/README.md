# Addon: `remsana-learning-lesson-video-screenpal`

Frontend-only addon for the **SME lesson player** (`remsana-web`). Lessons store `video_url` in MySQL; **Screenpal** URLs (e.g. `https://go.screenpal.com/player/...`) must be embedded with an **iframe**, not `<video src="...">`.

---

## What it does

| Behaviour | Details |
|-----------|---------|
| **Detect Screenpal** | If `video_url` contains `screenpal.com` (case-insensitive), render Screenpal’s **iframe** embed with the required query parameters. |
| **Direct / MP4 URLs** | Otherwise render a standard **HTML5 `<video>`** with `controls` and `width="100%"`. |
| **Progress API** | Calls existing `POST /api/v1/learning/lessons/{id}/video-progress` via `recordVideoProgress()` from `learningApi.ts`. |
| **MP4 progress** | Tracks `currentTime` (max across seeks), throttled `timeupdate` posts, full completion on `ended`. |
| **Screenpal progress** | Cross-origin iframe cannot expose `currentTime`. Uses **visible time-on-page** while the embed is mounted (1s ticks, tab visible only), capped at `duration_sec`). Includes a **postMessage** listener stub for future Screenpal APIs (see code comments). |

---

## Folder layout

```
addon/remsana-learning-lesson-video-screenpal/
├── README.md
├── INTEGRATION.md
└── remsana-web/
    └── src/
        └── app/
            ├── components/
            │   └── learning/
            │       └── LessonVideoPlayer.tsx   ← new component (canonical copy)
            └── pages/
                └── LessonPlayerPage.tsx      ← example integration
```

The **authoritative implementation** for integrators is the tree under `remsana-web/` inside this addon. Copy the files into your repo’s `remsana-web` (or merge).

---

## Related

- **Core API** `POST .../video-progress` — unchanged; already stores `video_progress_sec` and triggers xAPI completion when `watchedSeconds >= 0.9 * durationSeconds`.
- **Course admin** (`remsana-learning-admin`) — admins paste Screenpal player URLs into lesson `video_url` as today.
