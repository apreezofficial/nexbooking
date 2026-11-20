import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { CalendarDays, Clock3, Compass, Home, LockKeyhole, MessageCircle, UserRound, Video, type LucideIcon } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, radii } from '../theme';
import { Badge, Button, Card, IconButton, Text, VerifiedMark } from './primitives';
import { Bookmark } from 'lucide-react-native';
import { BusinessLogo } from './BusinessLogo';

export const tabs = [
  { label: 'Home', icon: Home }, { label: 'Explore', icon: Compass },
  { label: 'Schedule', icon: CalendarDays }, { label: 'Inbox', icon: MessageCircle },
  { label: 'Profile', icon: UserRound },
] as const;
export type TabName = typeof tabs[number]['label'];

export function TabBar({ value, onChange }: { value: TabName; onChange: (value: TabName) => void }) {
  return <View style={styles.tabBar} accessibilityRole="tablist">
    {tabs.map(({ label, icon: Icon }) => {
      const active = value === label;
      return <Pressable key={label} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: active }}
        onPress={() => onChange(label)} style={({ pressed }) => [styles.tab, active && styles.activeTab, { opacity: pressed ? 0.7 : 1 }]}>
        <Icon size={22} strokeWidth={1.8} color={active ? colors.ink900 : colors.pearl} fill={active && label === 'Home' ? colors.ink900 : 'none'} />
        {active && <Text variant="button">{label}</Text>}
      </Pressable>;
    })}
  </View>;
}

export function SpotlightTile({ initials, name, seen = false, sponsored = false, selected = false, onPress }: {
  initials: string; name: string; seen?: boolean; sponsored?: boolean; selected?: boolean; onPress?: () => void;
}) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${name}${sponsored ? ', sponsored' : ''}`} accessibilityState={{ selected }}
    style={({ pressed }) => [styles.spotlight, { borderColor: seen ? colors.line : colors.gold, opacity: pressed ? 0.7 : 1 }]}>
    <View style={[styles.spotlightArt, { backgroundColor: initials === 'GS' ? colors.crayolaGold : colors.ink900 }]}>
      {sponsored && <View style={styles.ad}><Badge label="Ad" small /></View>}
      <BusinessLogo name={name as 'Zara Nails' | 'Glow Studio' | 'Kemi Cuts' | 'Lagos Lens'} size={58} />
    </View>
    <View style={{ backgroundColor: seen ? colors.daisy : colors.goldTint, paddingVertical: 6, alignItems: 'center' }}><Text variant="overline" numberOfLines={1}>{name}</Text></View>
  </Pressable>;
}

export function FeedCard({ saved, onSave, onBook, photo = require('../../assets/photos/salon-styling.jpg') }: { saved: boolean; onSave: () => void; onBook: () => void; photo?: number }) {
  return <Card>
    <ImageBackground source={photo} resizeMode="cover" style={styles.feedArt} imageStyle={styles.feedImage}>
      <View style={styles.feedScrim} />
      <View style={styles.rowBetween}><Badge label="Hair & Beauty" /><IconButton icon={Bookmark} label={saved ? 'Remove saved studio' : 'Save studio'} selected={saved} onPress={onSave} /></View>
      <View style={styles.photoLabel}><Text variant="caption" color={colors.pearl}>Studio photo · 1/4</Text></View>
    </ImageBackground>
    <View style={{ padding: 16, gap: 14 }}>
      <View style={styles.rowBetween}>
        <View style={[styles.row, { flex: 1 }]}>
          <BusinessLogo name='Glow Studio' size={44} />
          <View style={{ flex: 1 }}><View style={[styles.row, { gap: 4, flexWrap: 'wrap' }]}><Text variant="h3">Glow Studio</Text><VerifiedMark /></View><Text variant="caption" color={colors.muted}>Lekki · 1.2 km away</Text></View>
        </View>
        <Badge label="★ 4.9" />
      </View>
      <View style={[styles.rowBetween, { flexWrap: 'wrap', gap: 12 }]}>
        <View><Text variant="h3">Silk press & trim</Text><Text variant="caption" color={colors.muted}>90 min · Next slot today</Text></View>
        <Button label="Book now" size="small" onPress={onBook} />
      </View>
    </View>
  </Card>;
}

export function BookingCard({ onReschedule, onJoin }: { onReschedule: () => void; onJoin: () => void }) {
  return <Card style={{ padding: 16, gap: 16 }}>
    <View style={styles.row}>
      <View style={styles.date}><Text variant="overline" color={colors.muted}>NOV</Text><Text variant="h1">14</Text></View>
      <View style={{ flex: 1, gap: 4 }}><Text variant="h3">Silk press & trim</Text><Text variant="caption" color={colors.muted}>Glow Studio · 10:00 AM</Text><Badge status="Confirmed" /></View>
    </View>
    <View style={[styles.row, { flexWrap: 'wrap' }]}><Button label="Reschedule" variant="outline" onPress={onReschedule} style={{ flexGrow: 1 }} /><Button label="Join consultation" icon={Video} onPress={onJoin} style={{ flexGrow: 1 }} /></View>
  </Card>;
}

export function Banner({ premium = false, onUpgrade }: { premium?: boolean; onUpgrade?: () => void }) {
  const Icon: LucideIcon = premium ? LockKeyhole : Clock3;
  return <View style={[styles.banner, { backgroundColor: premium ? colors.ink900 : colors.goldTint }]}>
    <Icon size={22} color={premium ? colors.gold : colors.ink900} strokeWidth={1.8} />
    <View style={{ flex: 1, gap: 4 }}><Text variant="button" color={premium ? colors.pearl : colors.ink900}>{premium ? 'Staff management is a Premium feature' : 'Slot held for you'}</Text><Text variant="caption" color={premium ? colors.line : colors.muted}>{premium ? 'Upgrade to add your team.' : 'Complete payment before it expires.'}</Text>
      {premium && <Button label="Upgrade" size="small" onPress={onUpgrade} style={{ marginTop: 8 }} />}
    </View>
    {!premium && <Text variant="h3">09:58</Text>}
  </View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  tabBar: { minHeight: 64, backgroundColor: 'transparent', borderRadius: radii.pill, flexDirection: 'row', alignItems: 'center', padding: 8, gap: 2 },
  tab: { minWidth: 44, minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, borderRadius: radii.pill },
  activeTab: { backgroundColor: colors.gold, flexGrow: 2, paddingHorizontal: 10 },
  spotlight: { width: 88, borderWidth: 2, borderRadius: radii.tile, overflow: 'hidden' },
  spotlightArt: { height: 76, alignItems: 'center', justifyContent: 'center' },
  ad: { position: 'absolute', right: 4, top: 4 },
  feedArt: { height: 220, padding: 12, justifyContent: 'space-between', overflow: 'hidden' },
  feedImage: { borderTopLeftRadius: radii.card, borderTopRightRadius: radii.card },
  feedScrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(28, 26, 20, 0.08)' },
  photoLabel: { backgroundColor: colors.ink900, borderRadius: radii.chip, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8 },
  avatar: { width: 44, height: 44, borderRadius: radii.input, borderWidth: 2, borderColor: colors.gold, backgroundColor: colors.crayolaGold, alignItems: 'center', justifyContent: 'center' },
  date: { width: 56, paddingVertical: 8, backgroundColor: colors.goldTint, borderRadius: radii.input, alignItems: 'center' },
  banner: { borderRadius: radii.tile, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
});
