/**
 * Audio Synthesizer Utility
 *
 * Generates synthetic sound feedback using the browser's native Web Audio API.
 * Provides custom chime harmonics for:
 * - 'complete': Rapid upward two-tone arpeggio (E5 -> B5 -> E6)
 * - 'reminder': Bell chime alert (A5 -> D6)
 * - 'milestone': Four-tone victory fanfare chord (C5 -> E5 -> G5 -> C6)
 *
 * Designed to work without external asset downloads, fully client-side.
 */

export type ChimeType = 'complete' | 'reminder' | 'milestone';

export function playChime(type: ChimeType = 'complete'): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // In modern browsers, AudioContext may start in 'suspended' state until user interaction
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'milestone') {
      // Victory Fanfare: 4-note ascending chord with gentle decay (C5, E5, G5, C6)
      const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const startDelays = [0, 0.09, 0.18, 0.28];

      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = index === 3 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + startDelays[index]);

        // Volume envelope with warm fade-out
        gain.gain.setValueAtTime(0, now + startDelays[index]);
        gain.gain.linearRampToValueAtTime(0.18, now + startDelays[index] + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startDelays[index] + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + startDelays[index]);
        osc.stop(now + startDelays[index] + 0.9);
      });
    } else if (type === 'complete') {
      // Two-tone check-in sound (E5 -> B5 -> E6)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.15); // B5

      osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } else {
      // Bell notification chime (A5 -> D6)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.12); // D6

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch {
    // Gracefully ignore audio errors if blocked by browser autoplay policies
  }
}
