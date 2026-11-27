import Sound from 'react-native-sound';

type Source = number | null;
// Files are required lazily, and a missing file just means silence, so a bad asset can never stop the app from starting.
function sourceFor(name: SoundName): Source {
  try {
    switch (name) {
      case 'tap': return require('../../assets/sounds/tap.wav');
      case 'toggle': return require('../../assets/sounds/toggle.wav');
      case 'success': return require('../../assets/sounds/success.wav');
      case 'error': return require('../../assets/sounds/error.wav');
      case 'send': return require('../../assets/sounds/send.wav');
      case 'pop': return require('../../assets/sounds/pop.wav');
    }
  } catch {
    return null;
  }
  return null;
}
export type SoundName = 'tap' | 'toggle' | 'success' | 'error' | 'send' | 'pop';

// Ambient: respects the silent switch and mixes with the user's music instead of stopping it.
Sound.setCategory('Ambient', true);

const volume: Record<SoundName, number> = { tap: 0.5, toggle: 0.6, success: 0.8, error: 0.7, send: 0.7, pop: 0.6 };
const cache: Partial<Record<SoundName, Sound>> = {};
let enabled = true;

export const isSoundEnabled = () => enabled;
export function setSoundEnabled(value: boolean) { enabled = value; }

function load(name: SoundName, then?: (sound: Sound) => void) {
  const source = sourceFor(name);
  if (source == null) return;
  const sound: Sound = new Sound(source as never, error => {
    if (error) return;
    sound.setVolume(volume[name]);
    cache[name] = sound;
    then?.(sound);
  });
}

/** Load the sounds once at start so the first tap is not silent. */
export function preloadSounds() {
  (['tap', 'toggle', 'success', 'error', 'send', 'pop'] as SoundName[]).forEach(name => { if (!cache[name]) load(name); });
}

export function playSound(name: SoundName) {
  if (!enabled) return;
  const ready = cache[name];
  if (ready) ready.stop(() => ready.play());
  else load(name, sound => sound.play());
}
