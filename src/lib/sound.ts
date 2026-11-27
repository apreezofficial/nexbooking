import Sound from 'react-native-sound';

const files = {
  tap: require('../../assets/sounds/tap.wav'),
  toggle: require('../../assets/sounds/toggle.wav'),
  success: require('../../assets/sounds/success.wav'),
  error: require('../../assets/sounds/error.wav'),
  send: require('../../assets/sounds/send.wav'),
  pop: require('../../assets/sounds/pop.wav'),
};
export type SoundName = keyof typeof files;

// Ambient: respects the silent switch and mixes with the user's music instead of stopping it.
Sound.setCategory('Ambient', true);

const volume: Record<SoundName, number> = { tap: 0.5, toggle: 0.6, success: 0.8, error: 0.7, send: 0.7, pop: 0.6 };
const cache: Partial<Record<SoundName, Sound>> = {};
let enabled = true;

export const isSoundEnabled = () => enabled;
export function setSoundEnabled(value: boolean) { enabled = value; }

function load(name: SoundName, then?: (sound: Sound) => void) {
  const sound: Sound = new Sound(files[name], error => {
    if (error) return;
    sound.setVolume(volume[name]);
    cache[name] = sound;
    then?.(sound);
  });
}

/** Load the sounds once at start so the first tap is not silent. */
export function preloadSounds() {
  (Object.keys(files) as SoundName[]).forEach(name => { if (!cache[name]) load(name); });
}

export function playSound(name: SoundName) {
  if (!enabled) return;
  const ready = cache[name];
  if (ready) ready.stop(() => ready.play());
  else load(name, sound => sound.play());
}
