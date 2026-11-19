import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, SlidersHorizontal } from 'lucide-react-native';
import { Badge, Banner, BookingCard, Button, Card, Chip, FeedCard, IconButton, Input, SpotlightTile, TabBar, Text, type Status, type TabName } from '../components';
import { colors, radii, typography } from '../theme';

export function DesignSystemScreen() {
  const [section, setSection] = useState('Components');
  const [category, setCategory] = useState('All');
  const [slot, setSlot] = useState('11:30');
  const [tab, setTab] = useState<TabName>('Home');
  const [saved, setSaved] = useState(false);
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [touched, setTouched] = useState(false);
  const [notice, setNotice] = useState('Interactive preview · ready for your app screens');
  const phoneError = touched && phone.replace(/\D/g, '').length < 10 ? 'Enter a valid phone number' : undefined;
  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.rowBetween}><Badge label="NEX BOOKING" small /><Text variant="overline" color={colors.muted}>DESIGN SYSTEM / 01</Text></View>
        <Text variant="display">A considered start.</Text><Text variant="bodyLarge" color={colors.muted}>The foundation for your next booking.</Text>
        <View style={styles.accent} /><Text variant="caption" color={colors.muted}>Plus Jakarta Sans · 4 pt grid · iOS, Android & web</Text>
      </View>
      <View style={styles.row}>{['Components', 'Foundations'].map(item => <Chip key={item} label={item} selected={section === item} onPress={() => setSection(item)} />)}</View>
      <View style={styles.notice} accessibilityLiveRegion="polite"><View style={styles.dot} /><Text variant="caption" color={colors.goldDeep} style={{ flex: 1 }}>{notice}</Text></View>
      {section === 'Foundations' ? <>
        <Section eyebrow="01 / PALETTE" title="Warm by design.">
          <Text color={colors.muted}>Gold is an accent and fill. Use Ink on gold, and Gold Deep for gold text on light surfaces.</Text>
          <View style={styles.swatches}>{Object.entries(colors).map(([name, color]) => <View key={name} style={styles.swatchItem}><View style={[styles.swatch, { backgroundColor: color }]} /><Text variant="button">{name}</Text><Text variant="caption" color={colors.muted}>{color}</Text></View>)}</View>
          <Text variant="caption" color={colors.muted}>Crayola Gold #E6BE8A is provisional in your reference.</Text>
        </Section>
        <Section eyebrow="02 / TYPOGRAPHY" title="A clear hierarchy.">
          {Object.entries(typography).map(([name, spec]) => <View key={name} style={{ gap: 4 }}><Text variant={name as keyof typeof typography}>{name === 'display' ? 'Book your next appointment' : name === 'h1' ? 'Glow Studio' : name === 'h2' ? 'Upcoming bookings' : name === 'h3' ? 'Silk press & trim' : 'Choose a time that works for you.'}</Text><Text variant="caption" color={colors.muted}>{name} · {spec.fontSize}/{spec.lineHeight}</Text></View>)}
        </Section>
        <Section eyebrow="03 / STRUCTURE" title="Space to breathe.">
          <Text color={colors.muted}>390 × 844 reference · 16 pt side margins · 12–16 pt card gaps · minimum 44 × 44 touch targets.</Text>
          <View style={[styles.row, { alignItems: 'flex-end' }]}>{[4, 8, 12, 16, 20, 24, 32, 40, 48].map(n => <View key={n} style={{ alignItems: 'center', gap: 8 }}><View style={{ width: n, height: n, backgroundColor: colors.gold }} /><Text variant="overline" color={colors.muted}>{n}</Text></View>)}</View>
          <View style={styles.wrap}>{Object.entries(radii).map(([name, value]) => <View key={name} style={{ alignItems: 'center', gap: 8 }}><View style={{ width: 64, height: 64, borderRadius: value, borderWidth: 1, borderColor: colors.goldDeep, backgroundColor: colors.goldTint }} /><Text variant="caption">{name} · {value}</Text></View>)}</View>
        </Section>
      </> : <>
        <Section eyebrow="01 / ACTIONS" title="Every next step.">
          <View style={styles.wrap}><Button label="Book now" onPress={() => setNotice('Book now pressed · booking flow awaits your screen designs.')} /><Button label="View details" variant="dark" onPress={() => setNotice('View details pressed.')} /><Button label="Reschedule" variant="outline" onPress={() => setNotice('Reschedule pressed.')} /><Button label="Unavailable" disabled /></View>
          <Button label="Pay now" size="large" style={{ alignSelf: 'stretch' }} onPress={() => setNotice('Payment preview · no payment has been made.')} />
          <View style={styles.rowBetween}><Button label="Forgot password?" variant="text" onPress={() => setNotice('Password recovery button pressed.')} /><View style={styles.row}><IconButton icon={Bell} label="Notifications" onPress={() => setNotice('No new notifications in this preview.')} /><IconButton icon={Bell} label="Unread notifications" dot onPress={() => setNotice('Unread notification state preview.')} /></View></View>
        </Section>
        <Section eyebrow="02 / SELECTION" title="Make it yours.">
          <View style={styles.wrap}>{['All', 'Hair', 'Nails', 'Photo'].map(item => <Chip key={item} label={item} selected={item === category} onPress={() => { setCategory(item); setNotice(`${item} category selected.`); }} />)}</View>
          <View style={styles.row}>{['10:00', '11:30', '13:00'].map(item => <Chip key={item} label={item} selected={slot === item} disabled={item === '13:00'} onPress={() => { setSlot(item); setNotice(`${item} time selected.`); }} />)}</View>
          <Text variant="caption" color={colors.muted}>Available · Selected · Unavailable</Text>
          <View style={styles.wrap}>{(['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'Refunded', 'In progress'] as Status[]).map(status => <Badge key={status} status={status} />)}</View>
        </Section>
        <Section eyebrow="03 / INPUTS" title="Start a conversation.">
          <Input label="Search" placeholder="Studios, stylists, services" leading={Search} value={search} onChangeText={setSearch} returnKeyType="search" onSubmitEditing={() => setNotice(search ? `Search preview: ${search}` : 'Enter a studio, stylist or service.')} trailing={<IconButton icon={SlidersHorizontal} label="Cycle category filter" onPress={() => { const next = category === 'All' ? 'Hair' : 'All'; setCategory(next); setNotice(`Search category: ${next}`); }} style={{ backgroundColor: colors.goldTint, borderWidth: 0 }} />} />
          <Input nativeID="phone" label="Phone number" placeholder="+234 800 000 0000" keyboardType="phone-pad" autoComplete="tel" value={phone} onChangeText={setPhone} onBlur={() => setTouched(true)} error={phoneError} />
          <Text variant="caption" color={colors.muted}>Tap to see the gold focus state. Leave a short phone number to preview validation.</Text>
        </Section>
        <Section eyebrow="04 / DISCOVERY" title="In the spotlight.">
          <View style={styles.row}>{[{ initials: 'ZN', name: 'Zara Nails', sponsored: true }, { initials: 'GS', name: 'Glow Studio' }, { initials: 'LL', name: 'Lagos Lens', seen: true }].map(item => <SpotlightTile key={item.initials} {...item} onPress={() => setNotice(`${item.name} spotlight opened in preview.`)} />)}</View>
          <Text variant="caption" color={colors.muted}>Gold border = unseen · Grey border = seen · Ad = sponsored</Text>
          <FeedCard saved={saved} onSave={() => { setSaved(!saved); setNotice(saved ? 'Glow Studio removed from saved.' : 'Glow Studio saved.'); }} onBook={() => setNotice(`Booking preview · ${category} · ${slot}`)} />
        </Section>
        <Section eyebrow="05 / BOOKINGS" title="Good things ahead.">
          <BookingCard onReschedule={() => setNotice(`Reschedule preview · selected time ${slot}.`)} onJoin={() => setNotice('Consultation preview · video service is not connected.')} />
          <Banner /><Banner premium onUpgrade={() => setNotice('Upgrade preview · no purchase has been made.')} />
        </Section>
        <Section eyebrow="06 / NAVIGATION" title="Always within reach.">
          <TabBar value={tab} onChange={setTab} /><Text variant="caption" color={colors.muted}>Navigation component preview · {tab} selected</Text>
        </Section>
      </>}
      <Card style={{ padding: 20, gap: 8, backgroundColor: colors.goldTint }}><Text variant="h3">Ready for what comes next.</Text><Text color={colors.muted}>Your screen designs will build on these shared components. This is the design system preview, with sample content and local interactions.</Text></Card>
      <Text variant="overline" color={colors.muted} style={{ textAlign: 'center' }}>NEX BOOKING · FOUNDATION V1</Text>
    </ScrollView>
  </SafeAreaView>;
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <View style={styles.section}><View style={{ gap: 6 }}><Text variant="overline" color={colors.goldDeep}>{eyebrow}</Text><Text variant="h1">{title}</Text></View>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pearl },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48, gap: 24 },
  header: { gap: 12, paddingTop: 8, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  section: { gap: 16, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: colors.line },
  accent: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gold, marginVertical: 4 },
  notice: { backgroundColor: colors.goldTint, borderRadius: radii.chip, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { width: 6, height: 6, backgroundColor: colors.goldDeep, borderRadius: 3 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatchItem: { width: '47%', gap: 4, marginBottom: 8 },
  swatch: { height: 64, borderRadius: radii.chip, borderWidth: 1, borderColor: colors.line, marginBottom: 4 },
});
