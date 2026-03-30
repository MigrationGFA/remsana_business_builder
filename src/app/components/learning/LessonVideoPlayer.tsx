import React, { useCallback, useEffect, useRef } from 'react';
import { recordVideoProgress } from '../../api/learningApi';

/**
 * Screenpal / go.screenpal.com embeds must use an iframe — they do not work as <video src="...">.
 * This module detects Screenpal URLs and applies the embed query string expected by their player.
 */

/** True when the lesson stores a Screenpal player URL (e.g. https://go.screenpal.com/player/...) */
export function isScreenpalLessonUrl(videoUrl: string): boolean {
  return videoUrl.toLowerCase().includes('screenpal.com');
}

/**
 * Appends Screenpal embed parameters. Preserves existing query string on `videoUrl` (uses `&` when needed).
 */
export function buildScreenpalIframeSrc(videoUrl: string): string {
  const params = 'width=100%&height=100%&ff=1&title=0&a=1&bg=transparent';
  const sep = videoUrl.includes('?') ? '&' : '?';
  return `${videoUrl}${sep}${params}`;
}

const PROGRESS_POST_INTERVAL_MS = 30_000;
const MP4_PROGRESS_POST_INTERVAL_MS = 15_000;

type LessonVideoPlayerProps = {
  lessonId: string;
  videoUrl: string;
  /** From lesson row; used as durationSeconds for the API and 90% completion rule on the server */
  durationSec?: number;
};

/**
 * Renders either a Screenpal iframe or a plain HTML5 video, and reports progress to the Core API.
 *
 * Progress behaviour:
 * - **MP4 / direct file**: uses `timeupdate` to track the maximum second watched (handles seeks) and
 *   posts throttled updates; `ended` sends full completion.
 * - **Screenpal**: cannot read currentTime inside a cross-origin iframe. We use **visible time-on-page**
 *   while this embed is mounted as a proxy for "watched" seconds (capped at `durationSec`).
 *   Optional `postMessage` from Screenpal can be wired later in `useScreenpalPostMessageListener`.
 */
export function LessonVideoPlayer({ lessonId, videoUrl, durationSec }: LessonVideoPlayerProps) {
  const screenpal = isScreenpalLessonUrl(videoUrl);

  if (screenpal) {
    return (
      <LessonScreenpalEmbed
        lessonId={lessonId}
        iframeSrc={buildScreenpalIframeSrc(videoUrl)}
        durationSec={durationSec}
      />
    );
  }

  return (
    <LessonMp4Video lessonId={lessonId} videoUrl={videoUrl} durationSec={durationSec} />
  );
}

/** Screenpal iframe — dimensions and query string follow product requirements */
function LessonScreenpalEmbed({
  lessonId,
  iframeSrc,
  durationSec,
}: {
  lessonId: string;
  iframeSrc: string;
  durationSec?: number;
}) {
  // Max seconds we attribute to the learner (cannot exceed lesson duration when known)
  const durationCap =
    durationSec && durationSec > 0 ? durationSec : 3600;

  const maxWatchedRef = useRef(0);
  /** Wall-clock throttle for POST /video-progress (avoid hammering the API) */
  const lastPostAtRef = useRef(Date.now());
  /** Ensure the 90% completion post only fires once */
  const completionSentRef = useRef(false);

  const postProgress = useCallback(
    (watchedSeconds: number, durationSeconds: number) => {
      void recordVideoProgress(lessonId, watchedSeconds, durationSeconds);
    },
    [lessonId]
  );

  /**
   * Visible time proxy: increment ~1s per tick while tab is visible. Cross-origin iframe does not
   * expose playback position; this matches "time spent with the lesson video open" as a practical proxy.
   */
  useEffect(() => {
    const tickMs = 1000;
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;

      maxWatchedRef.current = Math.min(maxWatchedRef.current + 1, durationCap);

      const now = Date.now();
      const throttleElapsed = now - lastPostAtRef.current >= PROGRESS_POST_INTERVAL_MS;
      const hitCompletion =
        !completionSentRef.current && maxWatchedRef.current >= durationCap * 0.9;

      if (throttleElapsed || hitCompletion) {
        if (hitCompletion) completionSentRef.current = true;
        lastPostAtRef.current = now;
        postProgress(maxWatchedRef.current, durationCap);
      }
    }, tickMs);

    return () => {
      window.clearInterval(id);
      // Flush latest position when leaving the page / unmounting (only if actually watched)
      if (maxWatchedRef.current > 0) {
        postProgress(maxWatchedRef.current, durationCap);
      }
    };
  }, [durationCap, lessonId, postProgress]);

  useScreenpalPostMessageListener();

  return (
    <iframe
      title="Lesson video"
      src={iframeSrc}
      width="100%"
      height="400px"
      style={{ border: 0 }}
      allowFullScreen
      scrolling="no"
    />
  );
}

/**
 * Placeholder: if Screenpal documents a postMessage protocol for progress/completion,
 * extend this handler (always verify `event.origin` before trusting data).
 */
function useScreenpalPostMessageListener() {
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (typeof event.origin !== 'string' || !event.origin.includes('screenpal.com')) {
        return;
      }
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('[LessonVideoPlayer] Screenpal postMessage (ignored until protocol is known)', event.data);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
}

function LessonMp4Video({
  lessonId,
  videoUrl,
  durationSec,
}: {
  lessonId: string;
  videoUrl: string;
  durationSec?: number;
}) {
  const maxWatchedRef = useRef(0);
  const lastPostAtRef = useRef(0);

  const postProgress = useCallback(
    (watchedSeconds: number, durationSeconds: number) => {
      void recordVideoProgress(lessonId, watchedSeconds, durationSeconds);
    },
    [lessonId]
  );

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget;
    const t = el.currentTime;
    maxWatchedRef.current = Math.max(maxWatchedRef.current, t);

    const durationFromEl = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : undefined;
    const durationSeconds = durationFromEl ?? durationSec ?? 0;
    if (durationSeconds <= 0) return;

    const now = Date.now();
    if (now - lastPostAtRef.current < MP4_PROGRESS_POST_INTERVAL_MS) return;
    lastPostAtRef.current = now;
    postProgress(Math.floor(maxWatchedRef.current), Math.floor(durationSeconds));
  };

  const handleEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget;
    const durationFromEl = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : undefined;
    const durationSeconds = durationFromEl ?? durationSec ?? 0;
    const watched = Math.max(maxWatchedRef.current, durationSeconds);
    postProgress(Math.floor(watched), Math.floor(durationSeconds || watched));
  };

  return (
    <video
      src={videoUrl}
      controls
      width="100%"
      className="w-full h-full max-h-full"
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
    />
  );
}
