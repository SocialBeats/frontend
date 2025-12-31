import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Interface representing a Beat in the player context.
 * decoupled from the specific backend response but compatible with mapped data.
 */
export interface Beat {
  id: string;
  title: string;
  author: string; // mapped from createdBy.username
  cover?: string; // mapped from audio.coverUrl
  audio: {
    url: string;
    coverUrl?: string;
    duration?: number;
  };
  // Allow additional properties to preserve original object data if needed
  [key: string]: any;
}

export interface PlayerState {
  // State
  isPlaying: boolean;
  currentBeat: Beat | null;
  queue: Beat[];
  currentIndex: number;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;

  // Actions
  play: (beat?: Beat, newQueue?: Beat[]) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  setVolume: (val: number) => void;
  setMuted: (val: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  seek: (time: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentBeat: null,
      queue: [],
      currentIndex: -1,
      volume: 1,
      isMuted: false,
      currentTime: 0,
      duration: 0,

      play: (beat?: Beat, newQueue?: Beat[]) => {
        const state = get();
        const update: Partial<PlayerState> = { isPlaying: true };

        // 1. Update queue if provided
        if (newQueue) {
          update.queue = newQueue;
        }

        // 2. Set current beat if provided
        if (beat) {
          update.currentBeat = beat;
          
          // Determine index
          const queueToSearch = newQueue || state.queue;
          const idx = queueToSearch.findIndex((b) => b.id === beat.id);
          
          if (idx !== -1) {
            update.currentIndex = idx;
          } else {
            // Beat not in queue? 
            // If new queue was provided but beat not found (unlikely if logic is correct), 
            // or if playing a beat independent of current queue.
            // For safety, we can append it or just treat as standalone (index -1)
            // But usually we want it in queue. 
            // If explicit newQueue was passed, we trust it. 
            // If not, we assume playing from outside current queue context implies replacing queue 
            // OR just playing single track. 
            // Requirement doesn't specify "add to queue".
            update.currentIndex = -1; // Standalone or not found
          }
        } else if (newQueue && newQueue.length > 0) {
             // New queue provided but no specific beat, play first
             update.currentBeat = newQueue[0];
             update.currentIndex = 0;
        }

        set(update);
      },

      pause: () => set({ isPlaying: false }),

      togglePlay: () => {
        const { isPlaying, currentBeat } = get();
        if (!currentBeat) return;
        set({ isPlaying: !isPlaying });
      },

      next: () => {
        const { queue, currentIndex } = get();
        if (queue.length === 0) return;

        const nextIndex = currentIndex + 1;

        if (nextIndex < queue.length) {
          set({
            currentIndex: nextIndex,
            currentBeat: queue[nextIndex],
          });
        } else {
          // Loop logic: Go back to start
          set({
            currentIndex: 0,
            currentBeat: queue[0],
          });
        }
      },

      prev: () => {
        const { queue, currentIndex } = get();
        if (queue.length === 0) return;

        const prevIndex = currentIndex - 1;

        if (prevIndex >= 0) {
          set({
            currentIndex: prevIndex,
            currentBeat: queue[prevIndex],
          });
        } else {
          // Loop logic: Go to last beat
          set({
            currentIndex: queue.length - 1,
            currentBeat: queue[queue.length - 1],
          });
        }
      },

      setVolume: (val: number) => {
        // Clamp volume between 0 and 1
        const clamped = Math.max(0, Math.min(1, val));
        set({ volume: clamped });
      },

      setMuted: (val: boolean) => set({ isMuted: val }),

      setCurrentTime: (time: number) => set({ currentTime: time }),

      setDuration: (dur: number) => set({ duration: dur }),

      seek: (time: number) => {
        // This triggers a state update that GlobalPlayerDock will listen to
        set({ currentTime: time });
      },
    }),
    {
      name: 'player-storage',
      // Only persist user preferences
      partialize: (state) => ({ 
        volume: state.volume, 
        isMuted: state.isMuted 
      }),
    }
  )
);
