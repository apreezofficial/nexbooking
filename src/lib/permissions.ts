import { Alert, Linking, Platform } from 'react-native';
import { check, checkNotifications, PERMISSIONS, request, requestNotifications, RESULTS, openSettings, type Permission } from 'react-native-permissions';

export type AppPermission = 'location' | 'notifications' | 'microphone' | 'camera' | 'photos' | 'faceId';
export type PermissionState = 'granted' | 'denied' | 'blocked' | 'unavailable';

const ios: Partial<Record<AppPermission, Permission>> = {
  location: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  microphone: PERMISSIONS.IOS.MICROPHONE,
  camera: PERMISSIONS.IOS.CAMERA,
  photos: PERMISSIONS.IOS.PHOTO_LIBRARY,
  faceId: PERMISSIONS.IOS.FACE_ID,
};
const android: Partial<Record<AppPermission, Permission>> = {
  location: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  microphone: PERMISSIONS.ANDROID.RECORD_AUDIO,
  camera: PERMISSIONS.ANDROID.CAMERA,
  photos: PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
};

function resolve(kind: AppPermission): Permission | undefined {
  return Platform.OS === 'ios' ? ios[kind] : android[kind];
}

function toState(result: string): PermissionState {
  if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) return 'granted';
  if (result === RESULTS.BLOCKED) return 'blocked';
  if (result === RESULTS.UNAVAILABLE) return 'unavailable';
  return 'denied';
}

/** Current state, without asking. */
export async function permissionState(kind: AppPermission): Promise<PermissionState> {
  if (kind === 'notifications') return toState((await checkNotifications()).status);
  const permission = resolve(kind);
  if (!permission) return 'granted';
  return toState(await check(permission));
}

/** Asks the user (once per install on iOS). Returns the new state. */
export async function askPermission(kind: AppPermission): Promise<PermissionState> {
  if (kind === 'notifications') {
    try { return toState((await requestNotifications(['alert', 'sound', 'badge'])).status); } catch { return 'unavailable'; }
  }
  const permission = resolve(kind);
  if (!permission) return 'granted';
  try {
    return toState(await request(permission));
  } catch {
    return 'unavailable';
  }
}

const copy: Record<AppPermission, { title: string; body: string }> = {
  location: { title: 'Location is off', body: 'Turn on location to see businesses near you, or choose an area yourself.' },
  notifications: { title: 'Turn on notifications', body: 'Get booking requests, reminders and payment alerts as they happen.' },
  microphone: { title: 'Microphone access needed', body: 'Allow microphone access for voice notes and calls. You can still type instead.' },
  camera: { title: 'Camera access needed', body: 'Allow camera access to add photos to your works and notes.' },
  photos: { title: 'Photo access needed', body: 'Allow photo access to choose pictures for your works and notes.' },
  faceId: { title: 'Face ID is off', body: 'Allow Face ID in Settings to unlock EdeBooking quickly.' },
};

/** Explains a blocked permission and offers to open Settings. */
export function explainBlocked(kind: AppPermission) {
  const { title, body } = copy[kind];
  Alert.alert(title, body, [
    { text: 'Not now', style: 'cancel' },
    { text: 'Open settings', onPress: () => openSettings().catch(() => Linking.openSettings()) },
  ]);
}

/** Asks for a permission, and explains it when the user has blocked it. Resolves to true when granted. */
export async function ensurePermission(kind: AppPermission): Promise<boolean> {
  const current = await permissionState(kind);
  if (current === 'granted') return true;
  if (current === 'blocked') { explainBlocked(kind); return false; }
  const next = await askPermission(kind);
  if (next === 'blocked') explainBlocked(kind);
  return next === 'granted';
}
