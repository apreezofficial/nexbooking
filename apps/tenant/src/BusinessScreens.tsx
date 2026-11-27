import { useState } from 'react';
import { Pressable, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  BarChart3, Building2, Calendar, Check, ChevronRight, Clock3, Copy, CreditCard, Download, Gift, Image as ImageIcon,
  Link2, Lock, Megaphone, Plus, Plug, Settings, Star, Tag, Trash2, Users, Wallet, Zap, type LucideIcon,
} from 'lucide-react-native';
import { Button, Card, Chip, Input, Text } from '../../../src/components/primitives';
import { colors, radii, spacing } from '../../../src/theme';
import { Notice, Page, Row, Section, Toggle } from './SettingsAndStates';

type Nav = { onBack: () => void };
type Go = { go: (page: string) => void };

const gold = [colors.goldTint, colors.crayolaGold, colors.gold];

function Photo({ cover, size }: { cover?: boolean; size: number }) {
  return <LinearGradient colors={gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: size || '100%', height: size || '100%', borderRadius: radii.input, overflow: 'hidden' }}>
    {cover && <View style={{ margin: 6, alignSelf: 'flex-start', backgroundColor: colors.ink900, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}><Text variant="overline" color={colors.pearl} style={{ fontSize: 9 }}>Cover</Text></View>}
  </LinearGradient>;
}

function Avatar({ initials, size = 48 }: { initials: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: colors.crayolaGold, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
    <Text variant="h3" style={{ fontSize: size * 0.34 }}>{initials}</Text>
  </View>;
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return <Card style={{ flex: 1, padding: spacing.md, gap: 4 }}>
    <Text variant="caption" color={colors.muted}>{label}</Text>
    <Text variant="h2">{value}</Text>
    {note && <Text variant="caption" color={colors.success}>{note}</Text>}
  </Card>;
}

/* ---------- Business hub ---------- */

export function BusinessHubPage({ go }: Go) {
  const tiles: { icon: LucideIcon; label: string; meta: string; page: string; locked?: boolean }[] = [
    { icon: Building2, label: 'Storefront', meta: 'Branding', page: 'StorefrontEdit' },
    { icon: ImageIcon, label: 'Works', meta: '6 photos', page: 'Works' },
    { icon: Tag, label: 'Services', meta: '4 active', page: 'Services' },
    { icon: Users, label: 'Team', meta: '', page: 'Staff', locked: true },
    { icon: Clock3, label: 'Hours', meta: 'Mon–Sat', page: 'WorkingHours' },
    { icon: Star, label: 'Reviews', meta: '4.9 ★', page: 'Reviews' },
    { icon: Gift, label: 'Promo codes', meta: '2 active', page: 'PromoCodes' },
    { icon: BarChart3, label: 'Analytics', meta: 'This week', page: 'Analytics' },
    { icon: Megaphone, label: 'Boost ads', meta: 'Promote', page: 'Boost' },
    { icon: Plug, label: 'Integrations', meta: '', page: 'Integrations', locked: true },
  ];
  return <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text variant="h1">Business</Text>
      <Pressable onPress={() => go('Settings')} accessibilityRole="button" accessibilityLabel="Settings" style={{ width: 44, height: 44, borderRadius: radii.input, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.daisy, alignItems: 'center', justifyContent: 'center' }}>
        <Settings size={20} color={colors.ink900} />
      </Pressable>
    </View>
    <Card style={{ padding: spacing.md, gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar initials="GS" />
        <View><Text variant="h3">Glow Studio</Text><Text variant="caption" color={colors.muted}>Pro plan</Text></View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.goldTint, borderRadius: radii.input, padding: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Link2 size={16} color={colors.ink900} /><Text variant="caption">glowstudio.edebooking.com</Text></View>
        <Copy size={16} color={colors.ink900} />
      </View>
    </Card>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
      {tiles.map(({ icon: Icon, label, meta, page, locked }) => <Pressable key={label} onPress={() => go(page)} accessibilityRole="button" style={{ width: '47.5%', minHeight: 96, borderRadius: radii.card, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.daisy, padding: spacing.md, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Icon size={20} color={colors.ink900} strokeWidth={1.8} />
          {locked ? <Lock size={14} color={colors.goldDeep} /> : <Text variant="caption" color={colors.muted}>{meta}</Text>}
        </View>
        <Text variant="button">{label}</Text>
      </Pressable>)}
    </View>
  </View>;
}

/* ---------- Storefront ---------- */

export function StorefrontEditPage({ onBack }: Nav) {
  const [showReviews, setShowReviews] = useState(true);
  const [swatch, setSwatch] = useState(0);
  const swatches = [colors.gold, colors.crayolaGold, '#B08D3C', colors.ink900, '#4E8B5A'];
  return <Page title="Storefront" onBack={onBack} footer={<Button label="Save changes" size="large" style={{ alignSelf: 'stretch' }} onPress={onBack} />}>
    <LinearGradient colors={gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 120, borderRadius: radii.card, justifyContent: 'flex-end', padding: spacing.md }}>
      <Avatar initials="GS" size={56} />
    </LinearGradient>
    <Input label="Business name" defaultValue="Glow Studio" />
    <Input label="Tagline" defaultValue="Silk press, braids and natural hair care" />
    <Input label="Category" defaultValue="Hair & Beauty" />
    <Text variant="button">Brand colour</Text>
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {swatches.map((c, i) => <Pressable key={c} onPress={() => setSwatch(i)} accessibilityRole="button" accessibilityLabel={`Colour ${i + 1}`} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c, alignItems: 'center', justifyContent: 'center', borderWidth: swatch === i ? 3 : 0, borderColor: colors.ink900 }}>
        {swatch === i && <Check size={16} color={c === colors.ink900 ? colors.pearl : colors.ink900} strokeWidth={3} />}
      </Pressable>)}
    </View>
    <Input label="Storefront link" defaultValue="glowstudio.edebooking.com" autoCapitalize="none" trailing={<Check size={18} color={colors.success} />} />
    <Section label="DISPLAY"><Row label="Show reviews on storefront" right={<Toggle value={showReviews} onValueChange={setShowReviews} />} last /></Section>
  </Page>;
}

export function WorksPage({ onBack, go }: Nav & Go) {
  return <Page title="Works" onBack={onBack} footer={<Button label="Upload photos" size="large" icon={ImageIcon} style={{ alignSelf: 'stretch' }} onPress={() => go('UploadFailed')} />}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text variant="caption" color={colors.muted}>6 of 20 photos</Text><Text variant="button" color={colors.goldDeep}>Select</Text>
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Add photo" style={{ width: '31.5%', aspectRatio: 1, borderRadius: radii.input, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Plus size={22} color={colors.ink900} /><Text variant="caption">Add</Text>
      </Pressable>
      {[true, false, false, false, false].map((cover, i) => <View key={i} style={{ width: '31.5%', aspectRatio: 1 }}><Photo cover={cover} size={0} /></View>)}
    </View>
    <Notice icon={Check} text="Drag to reorder. The first photo is your cover." />
  </Page>;
}

/* ---------- Services ---------- */

const serviceList = [
  { name: 'Silk press & trim', meta: '90 min · Wash, press and trim', price: '₦25,000', on: true },
  { name: 'Wash & style', meta: '60 min · Wash, blow-dry, style', price: '₦12,000', on: true },
  { name: 'Knotless braids', meta: '4 hrs · Medium length', price: '₦45,000', on: true },
  { name: 'Deep conditioning', meta: '45 min · Treatment', price: '₦9,000', on: false },
];

export function ServicesPage({ onBack, go }: Nav & Go) {
  const [filter, setFilter] = useState('All');
  const [list, setList] = useState(serviceList);
  return <Page title="Services" onBack={onBack} footer={<Button label="Add service" size="large" icon={Plus} style={{ alignSelf: 'stretch' }} onPress={() => go('EditService')} />}>
    <View style={{ flexDirection: 'row', gap: 8 }}>{['All', 'Hair', 'Braids'].map(f => <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />)}</View>
    {list.map((s, i) => <Pressable key={s.name} onPress={() => go('EditService')} accessibilityRole="button">
      <Card style={{ padding: spacing.md, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="h3">{s.name}</Text><Text variant="h3">{s.price}</Text>
        </View>
        <Text variant="caption" color={colors.muted}>{s.meta}</Text>
        <View style={{ alignSelf: 'flex-end' }}><Toggle value={s.on} onValueChange={v => setList(l => l.map((x, j) => j === i ? { ...x, on: v } : x))} /></View>
      </Card>
    </Pressable>)}
  </Page>;
}

export function EditServicePage({ onBack }: Nav) {
  const [instant, setInstant] = useState(true);
  const [video, setVideo] = useState(true);
  return <Page title="Edit service" onBack={onBack} footer={<Button label="Save service" size="large" style={{ alignSelf: 'stretch' }} onPress={onBack} />}>
    <Input label="Service name" defaultValue="Silk press & trim" />
    <Input label="Description" defaultValue="Wash, deep condition, silk press and trim. Heat protection included." multiline />
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ flex: 1 }}><Input label="Duration" defaultValue="90 min" /></View>
      <View style={{ flex: 1 }}><Input label="Price" defaultValue="₦25,000" /></View>
    </View>
    <Section label="DETAILS">
      <Row label="Staff" value="Amaka, Tolu" onPress={() => {}} />
      <Row label="Add-ons" value="2 add-ons" onPress={() => {}} last />
    </Section>
    <Section label="BOOKING">
      <Row label="Instant booking" sub="Customers book without waiting" right={<Toggle value={instant} onValueChange={setInstant} />} />
      <Row label="Offer video consultation" sub="Add an online option" right={<Toggle value={video} onValueChange={setVideo} />} last />
    </Section>
    <Pressable onPress={onBack} accessibilityRole="button" style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Trash2 size={16} color={colors.error} /><Text variant="button" color={colors.error}>Delete service</Text>
    </Pressable>
  </Page>;
}

export function WorkingHoursPage({ onBack }: Nav) {
  const [days, setDays] = useState([true, true, true, true, true, true, false]);
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return <Page title="Working hours" onBack={onBack} footer={<Button label="Save hours" size="large" style={{ alignSelf: 'stretch' }} onPress={onBack} />}>
    <Card style={{ padding: 0 }}>
      {names.map((d, i) => <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.md, minHeight: 52, borderTopWidth: i ? 1 : 0, borderColor: colors.line }}>
        <Text variant="button" style={{ width: 40 }}>{d}</Text>
        <Toggle value={days[i]} onValueChange={v => setDays(a => a.map((x, j) => j === i ? v : x))} />
        <Text variant="caption" color={days[i] ? colors.ink900 : colors.muted} style={{ flex: 1, textAlign: 'right' }}>{days[i] ? (d === 'Sat' ? '9:00 AM – 6:00 PM' : '9:00 AM – 7:00 PM') : 'Closed'}</Text>
      </View>)}
    </Card>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text variant="h3">Holidays and time off</Text><Text variant="button" color={colors.goldDeep}>Add</Text>
    </View>
    <Section label="">
      <Row label="Christmas Day" sub="Fri 25 Dec · All staff" right={<Trash2 size={16} color={colors.muted} />} />
      <Row label="Boxing Day" sub="Sat 26 Dec · All staff" right={<Trash2 size={16} color={colors.muted} />} last />
    </Section>
  </Page>;
}

/* ---------- Team ---------- */

export function StaffPage({ onBack, go }: Nav & Go) {
  const team = [
    { i: 'AM', name: 'Amaka Eze', sub: 'Owner · 6 services', status: 'Available now', tone: colors.success },
    { i: 'TO', name: 'Tolu B.', sub: 'Staff · 4 services', status: 'In session until 11:30', tone: colors.warning },
    { i: 'BI', name: 'Bisi A.', sub: 'Staff · 3 services', status: 'Off today', tone: colors.muted },
  ];
  return <Page title="Staff" onBack={onBack} footer={<Button label="Invite team member" size="large" icon={Plus} style={{ alignSelf: 'stretch' }} onPress={() => go('InviteStaff')} />}>
    <Text variant="caption" color={colors.muted}>3 staff · 1 pending invite</Text>
    {team.map(t => <Pressable key={t.name} onPress={() => go('StaffProfile')} accessibilityRole="button">
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md }}>
        <Avatar initials={t.i} size={44} />
        <View style={{ flex: 1 }}>
          <Text variant="h3">{t.name}</Text><Text variant="caption" color={colors.muted}>{t.sub}</Text>
          <Text variant="caption" color={t.tone}>● {t.status}</Text>
        </View>
        <ChevronRight size={18} color={colors.ink800} />
      </Card>
    </Pressable>)}
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, backgroundColor: colors.goldTint, borderColor: colors.gold, borderStyle: 'dashed' }}>
      <Avatar initials="CN" size={44} />
      <View style={{ flex: 1 }}><Text variant="h3">Chidi N.</Text><Text variant="caption" color={colors.muted}>Invite sent · Manager</Text></View>
      <View style={{ alignItems: 'flex-end' }}><Text variant="overline" color={colors.goldDeep}>Pending</Text><Text variant="caption" color={colors.goldDeep}>Resend</Text></View>
    </Card>
  </Page>;
}

export function InviteStaffPage({ onBack }: Nav) {
  const [role, setRole] = useState('Manager');
  const [accept, setAccept] = useState(true);
  const [picked, setPicked] = useState<string[]>(['Silk press', 'Wash & style']);
  const services = ['Silk press', 'Wash & style', 'Braids', 'Conditioning'];
  return <Page title="Invite staff member" onBack={onBack} footer={<Button label="Send invite" size="large" style={{ alignSelf: 'stretch' }} onPress={onBack} />}>
    <Input label="Name" defaultValue="Chidi N." />
    <Input label="Email or phone" defaultValue="chidi@glowstudio.com" autoCapitalize="none" />
    <Text variant="button">Role</Text>
    {[['Manager', 'Manages bookings, customers and tasks'], ['Assistant', 'Sees only their own schedule']].map(([r, d]) => <Pressable key={r} onPress={() => setRole(r)} accessibilityRole="radio" accessibilityState={{ selected: role === r }}>
      <Card style={{ padding: spacing.md, flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: role === r ? colors.goldTint : colors.daisy, borderColor: role === r ? colors.gold : colors.line }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.ink900, alignItems: 'center', justifyContent: 'center' }}>{role === r && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ink900 }} />}</View>
        <View style={{ flex: 1 }}><Text variant="button">{r}</Text><Text variant="caption" color={colors.muted}>{d}</Text></View>
      </Card>
    </Pressable>)}
    <Text variant="button">Services they offer</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {services.map(s => <Chip key={s} label={s} selected={picked.includes(s)} onPress={() => setPicked(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])} />)}
    </View>
    <Section label=""><Row label="Can accept booking requests" right={<Toggle value={accept} onValueChange={setAccept} />} last /></Section>
  </Page>;
}

export function StaffProfilePage({ onBack }: Nav) {
  return <Page title="Amaka Eze" onBack={onBack} footer={<Button label="Edit schedule" size="large" style={{ alignSelf: 'stretch' }} onPress={onBack} />}>
    <View style={{ alignItems: 'center', gap: 8 }}><Avatar initials="AM" size={84} /><Text variant="overline" color={colors.goldDeep}>OWNER</Text></View>
    <View style={{ flexDirection: 'row', gap: spacing.sm }}><Stat label="Bookings" value="42" /><Stat label="Rating" value="★ 4.9" /><Stat label="Revenue" value="₦1.2M" /></View>
    <Section label="WEEKLY AVAILABILITY">
      <Row label="Mon – Fri" value="9:00 AM – 7:00 PM" />
      <Row label="Saturday" value="9:00 AM – 6:00 PM" />
      <Row label="Sunday" value="Off" />
      <Row label="Lunch break" value="12:30 – 1:00 PM" last />
    </Section>
    <Text variant="button">Assigned services</Text>
    <View style={{ flexDirection: 'row', gap: 8 }}>{['Silk press', 'Wash & style', 'Braids'].map(s => <Chip key={s} label={s} />)}</View>
  </Page>;
}

/* ---------- Reviews ---------- */

export function ReviewsPage({ onBack }: Nav) {
  const [filter, setFilter] = useState('All');
  const reviews = [
    { i: 'AO', name: 'Ada O.', when: '2 days ago', stars: 5, text: 'Amaka was amazing! My silk press lasted two weeks and the studio was spotless.', reply: false },
    { i: 'TB', name: 'Tolu B.', when: '1 week ago', stars: 4, text: 'Great braids and good value. Started a little late but worth the wait.', reply: true },
  ];
  return <Page title="Reviews" onBack={onBack}>
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
      <Text variant="display">4.9</Text><Text variant="body" color={colors.gold}>★★★★★</Text><Text variant="caption" color={colors.muted}>128 reviews</Text>
    </View>
    <View style={{ flexDirection: 'row', gap: 8 }}>{['All', 'Needs reply 2', 'Low ratings'].map(f => <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />)}</View>
    {reviews.map(r => <Card key={r.name} style={{ padding: spacing.md, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Avatar initials={r.i} size={36} />
        <View style={{ flex: 1 }}><Text variant="button">{r.name}</Text><Text variant="caption" color={colors.gold}>{'★'.repeat(r.stars)}</Text></View>
        <Text variant="caption" color={colors.muted}>{r.when}</Text>
      </View>
      <Text variant="body">{r.text}</Text>
      {r.reply
        ? <View style={{ borderWidth: 1.5, borderColor: colors.gold, borderRadius: radii.input, padding: spacing.md, gap: 8 }}>
            <Text variant="caption" color={colors.muted}>Thank you, Tolu! We loved having you.</Text>
            <View style={{ alignSelf: 'flex-end' }}><Button label="Post reply" size="small" onPress={() => {}} /></View>
          </View>
        : <Text variant="button" color={colors.goldDeep}>Reply</Text>}
    </Card>)}
  </Page>;
}

/* ---------- Promo codes ---------- */

export function PromoCodesPage({ onBack, go }: Nav & Go) {
  const [on, setOn] = useState<Record<string, boolean>>({ WELCOME20: true, FRIDAY10: true });
  return <Page title="Promo codes" onBack={onBack} footer={<Button label="Create promo code" size="large" icon={Plus} style={{ alignSelf: 'stretch' }} onPress={() => go('NewPromo')} />}>
    <View style={{ flexDirection: 'row', gap: spacing.sm }}><Stat label="Redemptions" value="38" note="▲ 9 this week" /><Stat label="Revenue driven" value="₦412k" /></View>
    <Text variant="h3">Active</Text>
    {[['WELCOME20', '20% off first booking', '12 used · Ends 30 Nov'], ['FRIDAY10', '10% off Friday slots', '26 used · Ends 31 Dec']].map(([code, desc, meta]) => <Card key={code} style={{ padding: spacing.md, gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ backgroundColor: colors.goldTint, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}><Text variant="overline">{code}</Text></View>
        <Toggle value={on[code]} onValueChange={v => setOn(s => ({ ...s, [code]: v }))} />
      </View>
      <Text variant="button">{desc}</Text><Text variant="caption" color={colors.muted}>{meta}</Text>
    </Card>)}
    <Text variant="h3">Expired</Text>
    <Card style={{ padding: spacing.md, gap: 4, opacity: 0.6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="overline">BLACKFRI</Text><Text variant="caption" color={colors.muted}>Expired</Text></View>
      <Text variant="button">15% off all services</Text><Text variant="caption" color={colors.muted}>41 used · Ended 1 Nov</Text>
    </Card>
  </Page>;
}

export function NewPromoPage({ onBack }: Nav) {
  const [kind, setKind] = useState('Percentage');
  const [newOnly, setNewOnly] = useState(true);
  return <Page title="New promo code" onBack={onBack} footer={<Button label="Create promo code" size="large" style={{ alignSelf: 'stretch' }} onPress={onBack} />}>
    <Input label="Code" defaultValue="GLOW20" autoCapitalize="characters" trailing={<Text variant="button" color={colors.goldDeep}>Generate</Text>} />
    <Text variant="button">Discount</Text>
    <View style={{ flexDirection: 'row', gap: 8 }}>{['Percentage', 'Fixed amount'].map(k => <Chip key={k} label={k} selected={kind === k} onPress={() => setKind(k)} />)}</View>
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ flex: 1 }}><Input label="Value" defaultValue="20%" /></View>
      <View style={{ flex: 1 }}><Input label="Applies to" defaultValue="All services" /></View>
    </View>
    <Section label="">
      <Row icon={Calendar} label="Starts" value="Wed 18 Nov" onPress={() => {}} />
      <Row icon={Calendar} label="Ends" value="Mon 30 Nov" onPress={() => {}} last />
    </Section>
    <Section label="">
      <Row label="New customers only" right={<Toggle value={newOnly} onValueChange={setNewOnly} />} />
      <Row label="Usage limit" value="100 total · 1 each" onPress={() => {}} last />
    </Section>
  </Page>;
}

/* ---------- Analytics ---------- */

export function AnalyticsPage({ onBack }: Nav) {
  const [range, setRange] = useState('30 days');
  const bars = [0.35, 0.5, 0.42, 0.6, 0.5, 1, 0.55];
  return <Page title="Analytics" onBack={onBack}>
    <View style={{ flexDirection: 'row', gap: 8 }}>{['7 days', '30 days', '90 days'].map(r => <Chip key={r} label={r} selected={range === r} onPress={() => setRange(r)} />)}</View>
    <Card style={{ padding: spacing.lg, gap: spacing.md }}>
      <Text variant="caption" color={colors.muted}>Revenue</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}><Text variant="h1">₦1,284,000</Text><Text variant="caption" color={colors.success}>▲ 18%</Text></View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 6 }}>
        {bars.map((b, i) => <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
          <View style={{ width: '70%', height: 90 * b, borderRadius: 6, backgroundColor: b === 1 ? colors.gold : colors.goldTint }} />
          <Text variant="caption" color={colors.muted}>W{i + 1}</Text>
        </View>)}
      </View>
    </Card>
    <View style={{ flexDirection: 'row', gap: spacing.sm }}><Stat label="Bookings" value="128" /><Stat label="New customers" value="41" /></View>
    <View style={{ flexDirection: 'row', gap: spacing.sm }}><Stat label="Repeat rate" value="62%" /><Stat label="Cancellations" value="4%" /></View>
    <Text variant="h3">Top services</Text>
    {[['Silk press & trim', '₦520k', 1], ['Knotless braids', '₦402k', 0.78], ['Wash & style', '₦196k', 0.38]].map(([n, v, w]) => <View key={n as string} style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="caption">{n}</Text><Text variant="caption">{v}</Text></View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.line }}><View style={{ height: 6, borderRadius: 3, backgroundColor: colors.gold, width: `${(w as number) * 100}%` }} /></View>
    </View>)}
  </Page>;
}

/* ---------- Subscription and billing ---------- */

export function SubscriptionPage({ onBack, go }: Nav & Go) {
  return <Page title="Subscription" onBack={onBack} footer={<Button label="Upgrade to Premium" size="large" icon={Star} style={{ alignSelf: 'stretch' }} onPress={() => go('UpgradeCheckout')} />}>
    <View style={{ backgroundColor: colors.ink900, borderRadius: radii.card, padding: spacing.lg, gap: spacing.sm }}>
      <Text variant="caption" color={colors.line}>Current plan</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text variant="display" color={colors.gold}>Pro</Text><Text variant="h2" color={colors.pearl}>$49/mo</Text>
      </View>
      <Text variant="caption" color={colors.line}>Renews Fri 20 Nov · Card ···· 4417</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: spacing.sm }}>
        <Button label="Manage" size="small" onPress={() => {}} />
        <Pressable onPress={() => go('Billing')} accessibilityRole="button" style={{ minHeight: 44, borderRadius: radii.button, paddingHorizontal: 18, justifyContent: 'center', backgroundColor: colors.ink800 }}><Text variant="button" color={colors.pearl}>Billing history</Text></Pressable>
      </View>
    </View>
    <Text variant="h3">Included in Pro</Text>
    {['Custom branding', 'Advanced analytics', 'Promo codes and marketing'].map(f => <View key={f} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Check size={16} color={colors.ink900} strokeWidth={2.5} /><Text variant="button">{f}</Text></View>)}
    <Text variant="h3">Available on Premium</Text>
    {['Staff management', 'API and integrations', 'Custom domain'].map(f => <View key={f} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Lock size={16} color={colors.goldDeep} /><Text variant="button" color={colors.muted}>{f}</Text></View>)}
    <Pressable accessibilityRole="button" style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center' }}><Text variant="button" color={colors.error}>Cancel subscription</Text></Pressable>
  </Page>;
}

export function UpgradeCheckoutPage({ onBack }: Nav) {
  const [period, setPeriod] = useState('Monthly');
  return <Page title="Upgrade to Premium" onBack={onBack} footer={<Button label="Upgrade now · $86.75" size="large" style={{ alignSelf: 'stretch' }} onPress={onBack} />}>
    <View style={{ flexDirection: 'row', gap: 8 }}>{['Monthly', 'Annual · save 20%'].map(p => <Chip key={p} label={p} selected={period === p} onPress={() => setPeriod(p)} />)}</View>
    <Card style={{ padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.goldTint, borderColor: colors.gold, borderWidth: 2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="h2">Premium</Text><Text variant="h2">$99/mo</Text></View>
      {['Everything in Pro', 'Staff management', 'API and integrations', 'Custom domain'].map(f => <View key={f} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Check size={16} color={colors.ink900} strokeWidth={2.5} /><Text variant="button">{f}</Text></View>)}
      <View style={{ borderTopWidth: 1, borderColor: colors.gold, paddingTop: spacing.sm, gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="caption" color={colors.muted}>Prorated credit from Pro</Text><Text variant="caption">−$12.25</Text></View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="button">Due today</Text><Text variant="button">$86.75</Text></View>
      </View>
    </Card>
    <Section label=""><Row icon={CreditCard} label="Card ···· 4417" sub="Charged via Stripe" right={<Text variant="button" color={colors.goldDeep}>Change</Text>} last /></Section>
    <Text variant="caption" color={colors.muted} style={{ textAlign: 'center' }}>Your next bill is $99 on Sun 20 Dec.</Text>
  </Page>;
}

export function BillingPage({ onBack }: Nav) {
  const invoices = [['INV-2026-011', '20 Oct 2026', '$49.00'], ['INV-2026-010', '20 Sep 2026', '$49.00'], ['INV-2026-009', '20 Aug 2026', '$19.00']];
  return <Page title="Billing" onBack={onBack}>
    <Card style={{ padding: spacing.lg, gap: 4, backgroundColor: colors.goldTint }}>
      <Text variant="caption" color={colors.muted}>Upcoming charge</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}><Text variant="h1">$49.00</Text><Text variant="caption">Fri 20 Nov</Text></View>
    </Card>
    <Section label=""><Row icon={CreditCard} label="Card ···· 4417" sub="Expires 09/28" right={<Text variant="button" color={colors.goldDeep}>Update</Text>} last /></Section>
    <Text variant="h3">Invoices</Text>
    {invoices.map(([id, date, amount]) => <Card key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md }}>
      <Wallet size={18} color={colors.ink900} />
      <View style={{ flex: 1 }}><Text variant="button">{id}</Text><Text variant="caption" color={colors.muted}>{date}</Text></View>
      <View style={{ alignItems: 'flex-end' }}><Text variant="button">{amount}</Text><Text variant="caption" color={colors.success}>Paid</Text></View>
      <Download size={16} color={colors.ink800} />
    </Card>)}
  </Page>;
}

/* ---------- Boost ---------- */

export function BoostPage({ onBack }: Nav) {
  const [kind, setKind] = useState('A service');
  const [days, setDays] = useState('7 days');
  return <Page title="Boost" onBack={onBack} footer={<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
    <View><Text variant="h2">₦35,000</Text><Text variant="caption" color={colors.muted}>7 days · ₦5,000 / day</Text></View>
    <Button label="Pay and boost" onPress={onBack} />
  </View>}>
    <Text variant="h3">What do you want to promote?</Text>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {[['A post', ImageIcon], ['A service', Tag], ['Storefront', Building2]].map(([k, Icon]) => {
        const I = Icon as LucideIcon; const active = kind === k;
        return <Pressable key={k as string} onPress={() => setKind(k as string)} accessibilityRole="button" style={{ flex: 1, minHeight: 80, borderRadius: radii.input, borderWidth: 1, borderColor: active ? colors.gold : colors.line, backgroundColor: active ? colors.goldTint : colors.daisy, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <I size={20} color={colors.ink900} /><Text variant="caption">{k as string}</Text>
        </Pressable>;
      })}
    </View>
    <Input label="Service" defaultValue="Silk press & trim" />
    <Text variant="button">Budget and duration</Text>
    <View style={{ flexDirection: 'row', gap: 8 }}>{['3 days', '7 days', '14 days'].map(d => <Chip key={d} label={d} selected={days === d} onPress={() => setDays(d)} />)}</View>
    <Card style={{ padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Zap size={18} color={colors.ink900} /><View><Text variant="caption" color={colors.muted}>Estimated reach</Text><Text variant="button">4,200 – 6,800 people</Text></View>
    </Card>
    <Text variant="overline" color={colors.muted}>PREVIEW</Text>
    <Card style={{ padding: spacing.sm, flexDirection: 'row', gap: 12 }}>
      <Photo size={72} /><View style={{ flex: 1, gap: 2 }}><Text variant="overline" color={colors.goldDeep}>SPONSORED</Text><Text variant="button">Glow Studio</Text><Text variant="caption" color={colors.muted}>Silk press from ₦25,000</Text></View>
    </Card>
  </Page>;
}

/* ---------- Integrations ---------- */

export function IntegrationsPage({ onBack }: Nav) {
  const items = [['Google Calendar', 'Sync bookings both ways', 'Connected'], ['Outlook Calendar', 'Sync bookings both ways', 'Connect'], ['CRM export', 'Send customers to your CRM', 'Connect'], ['Zoom', 'Use your own video provider', 'Connect']];
  return <Page title="Integrations" onBack={onBack}>
    <View style={{ backgroundColor: colors.ink900, borderRadius: radii.card, padding: spacing.lg, gap: 6 }}>
      <Text variant="button" color={colors.gold}>Premium features</Text>
      <Text variant="caption" color={colors.line}>Connect calendars, CRMs and your own domain.</Text>
      <Text variant="caption" color={colors.gold}>Included in your Premium plan.</Text>
    </View>
    {items.map(([n, d, s]) => <Card key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md }}>
      <Link2 size={18} color={colors.ink900} />
      <View style={{ flex: 1 }}><Text variant="button">{n}</Text><Text variant="caption" color={colors.muted}>{d}</Text></View>
      <View style={{ backgroundColor: s === 'Connected' ? colors.successTint : colors.goldTint, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 }}>
        <Text variant="overline" color={s === 'Connected' ? colors.success : colors.ink900}>{s}</Text>
      </View>
    </Card>)}
    <Card style={{ padding: spacing.md, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="button">Custom domain</Text><Text variant="caption" color={colors.warning}>Verifying DNS</Text></View>
      <Text variant="caption" color={colors.muted}>book.glowstudio.com</Text>
      <Notice icon={Link2} text="CNAME book → domains.edebooking.com. Changes can take up to 24 hours." />
    </Card>
  </Page>;
}

