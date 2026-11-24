import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft, Ban, CalendarDays, Check, ChevronLeft, ChevronRight, CircleCheck, Clock3, Crown, Download, Eye, EyeOff,
  Home, Landmark, Mic, MessageCircle, Paperclip, Phone, Plus, Repeat, RefreshCw, Scissors, Send, ShieldCheck,
  SlidersHorizontal, Star, Store, Tag, Megaphone, TriangleAlert, UserRound, Video, Wallet, X, Bell, Info, PhoneOff,
  Sparkles, type LucideIcon,
} from 'lucide-react-native';
import { Badge, Button, Card, Chip, Input, Text, type Status } from '../components/primitives';
import { colors, radii, spacing } from '../theme';

/* ---------- Navigation ---------- */

type Page =
  | 'Signup' | 'Setup' | 'Plans'
  | 'Home' | 'Notifications' | 'Bookings' | 'BookingDetail' | 'NewBooking' | 'BlockTime'
  | 'Inbox' | 'Chat' | 'Consultation' | 'SessionNotes'
  | 'Earnings' | 'Transactions' | 'TransactionDetail' | 'RequestPayout' | 'Payouts' | 'PayoutAccount';

type Tab = 'Home' | 'Bookings' | 'Inbox' | 'Earnings' | 'Plans';
const tabPages: Record<Tab, Page> = { Home: 'Home', Bookings: 'Bookings', Inbox: 'Inbox', Earnings: 'Earnings', Plans: 'Plans' };
const tabOf = (page: Page): Tab | null =>
  (['Home', 'Bookings', 'Inbox', 'Earnings'] as Tab[]).find(tab => tabPages[tab] === page) ?? null;

/* ---------- Sample data (from the Figma frames) ---------- */

const bookingsToday = [
  { time: '10:00', name: 'Ada Okafor', service: 'Silk press · Amaka', status: 'In progress' as Status },
  { time: '11:30', name: 'Chidi N.', service: 'Wash & style · Tolu', status: 'Confirmed' as Status },
  { time: '1:00 PM', name: 'Ngozi E.', service: 'Knotless braids · Bisi', status: 'Pending' as Status },
];
const requests = [
  { name: 'Ngozi E.', tag: 'New customer', service: 'Knotless braids', when: 'Sat 21 Nov · 10:00', total: '₦48,375' },
  { name: 'Tolu B.', tag: '3 bookings', service: 'Wash & style', when: 'Sun 22 Nov · 2:30', total: '₦12,900' },
  { name: 'Chika K.', tag: 'New customer', service: 'Silk press & trim', when: 'Mon 23 Nov · 11:00', total: '₦26,875' },
];
const inboxItems = [
  { initials: 'AO', name: 'Ada Okafor', tag: 'Booked today', msg: 'Of course, send it here.', time: '10:42', unread: 2 },
  { initials: 'NE', name: 'Ngozi E.', tag: 'Request', msg: 'Hi, is parking available?', time: '9:15', unread: 1 },
  { initials: 'TB', name: 'Tolu B.', tag: 'Booked', msg: 'Thanks, see you Sunday!', time: 'Mon', unread: 0 },
  { initials: 'CK', name: 'Chika K.', tag: 'Request', msg: 'Can I move to 12:00?', time: 'Sun', unread: 0 },
  { initials: 'EM', name: 'Emeka O.', tag: 'Enquiry', msg: 'Do you do kids’ braids?', time: 'Sat', unread: 0 },
];
const transactions = [
  { name: 'Ada Okafor', sub: 'Payment · Gross ₦25,000', amount: '+₦22,500', time: '10:42', positive: true },
  { name: 'Chidi N.', sub: 'Payment · Gross ₦12,000', amount: '+₦10,800', time: '9:20', positive: true },
  { name: 'Payout to Access Bank', sub: 'Processed', amount: '−₦312,000', time: '3:00 PM', positive: false },
  { name: 'Tolu B.', sub: 'Refund · Cancelled booking', amount: '−₦12,900', time: '11:05', positive: false },
  { name: 'Emeka O.', sub: 'Payment · Gross ₦45,000', amount: '+₦40,500', time: '9:40', positive: true },
];

/* ---------- Small shared pieces ---------- */

function Avatar({ initials, size = 44 }: { initials: string; size?: number }) {
  return <View style={[styles.avatar, { width: size, height: size, borderRadius: size * 0.3 }]}>
    <Text variant="h3" style={{ fontSize: size * 0.34 }}>{initials}</Text>
  </View>;
}

function Header({ title, onBack, right }: { title?: string; onBack?: () => void; right?: ReactNode }) {
  return <View style={styles.header}>
    {onBack ? <IconSquare icon={ChevronLeft} label="Back" onPress={onBack} /> : <View style={styles.headerSpacer} />}
    {title ? <Text variant="h3" style={{ flex: 1, textAlign: 'center' }}>{title}</Text> : <View style={{ flex: 1 }} />}
    {right ?? <View style={styles.headerSpacer} />}
  </View>;
}

function IconSquare({ icon: Icon, label, onPress, dot, badge }: { icon: LucideIcon; label: string; onPress?: () => void; dot?: boolean; badge?: number }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconSquare, { opacity: pressed ? 0.7 : 1 }]}>
    <Icon size={22} strokeWidth={1.8} color={colors.ink900} />
    {dot && <View style={styles.dot} />}
    {!!badge && <View style={styles.badge}><Text variant="overline" color={colors.pearl} style={{ fontSize: 10 }}>{badge}</Text></View>}
  </Pressable>;
}

function Tone({ label, tone }: { label: string; tone: 'gold' | 'success' | 'warning' | 'error' | 'muted' }) {
  const map = {
    gold: [colors.goldTint, colors.ink900], success: [colors.successTint, colors.success],
    warning: [colors.warningTint, colors.goldDeep], error: [colors.errorTint, colors.error], muted: [colors.line, colors.ink800],
  } as const;
  const [bg, fg] = map[tone];
  return <View style={[styles.tone, { backgroundColor: bg }]}><Text variant="overline" color={fg}>{label}</Text></View>;
}

function Segmented({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return <View style={styles.segmented}>
    {options.map(option => {
      const active = option === value;
      return <Pressable key={option} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => onChange(option)}
        style={[styles.segment, active && { backgroundColor: colors.gold }]}>
        <Text variant="button" color={colors.ink900}>{option}</Text>
      </Pressable>;
    })}
  </View>;
}

function Field({ label, value, trailing }: { label: string; value: string; trailing?: ReactNode }) {
  return <Pressable accessibilityRole="button" style={styles.fieldRow}>
    <Text variant="body" color={colors.muted}>{label}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Text variant="button">{value}</Text>{trailing ?? <ChevronRight size={18} color={colors.ink800} />}
    </View>
  </Pressable>;
}

function Sheet({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return <View style={styles.overlay}>
    <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close" />
    <View style={styles.sheet}>
      <View style={styles.grabber} />
      <View style={styles.sheetHeader}><Text variant="h2">{title}</Text><IconSquare icon={X} label="Close" onPress={onClose} /></View>
      <View style={{ gap: spacing.md }}>{children}</View>
      {footer && <View style={{ marginTop: spacing.lg }}>{footer}</View>}
    </View>
  </View>;
}

function Gold({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.goldDark, style]}>{children}</View>;
}

function BottomNav({ value, onChange }: { value: Tab | null; onChange: (tab: Tab) => void }) {
  const items: { tab: Tab; icon: LucideIcon; label: string }[] = [
    { tab: 'Home', icon: Home, label: 'Home' },
    { tab: 'Bookings', icon: CalendarDays, label: 'Bookings' },
    { tab: 'Inbox', icon: MessageCircle, label: 'Inbox' },
    { tab: 'Earnings', icon: Wallet, label: 'Earnings' },
    { tab: 'Plans', icon: Store, label: 'Plans' },
  ];
  return <View style={styles.nav} accessibilityRole="tablist">
    {items.map(({ tab, icon: Icon, label }) => {
      const active = value === tab;
      return <Pressable key={tab} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: active }}
        onPress={() => onChange(tab)} style={[styles.navItem, active && { backgroundColor: colors.gold }]}>
        <Icon size={22} strokeWidth={1.8} color={active ? colors.ink900 : colors.pearl} />
        {active && <Text variant="button">{label}</Text>}
      </Pressable>;
    })}
  </View>;
}

/* ---------- App ---------- */

export function TenantApp() {
  const [page, setPage] = useState<Page>('Signup');
  const [history, setHistory] = useState<Page[]>([]);
  const [bookingTab, setBookingTab] = useState('Calendar');
  const [sheet, setSheet] = useState<'create' | 'decline' | 'voice' | null>(null);
  const [notesShared, setNotesShared] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('200,000');

  const go = (next: Page) => { setHistory(v => [...v, page]); setPage(next); setSheet(null); };
  const back = () => { setPage(history.at(-1) ?? 'Home'); setHistory(v => v.slice(0, -1)); setSheet(null); };
  const tab = tabOf(page);
  const openTab = (next: Tab) => { setHistory([]); setPage(tabPages[next]); setSheet(null); };

  let body: ReactNode;
  switch (page) {
    case 'Signup': body = <SignupPage onNext={() => go('Setup')} />; break;
    case 'Setup': body = <SetupPage onNext={() => go('Plans')} onSkip={() => openTab('Home')} />; break;
    case 'Plans': body = <PlansPage onNext={() => openTab('Home')} onBack={history.length ? back : undefined} />; break;
    case 'Home': body = <HomePage onNotifications={() => go('Notifications')} onCreate={() => setSheet('create')} onBlock={() => go('BlockTime')} onBooking={() => go('BookingDetail')} onEarnings={() => openTab('Earnings')} />; break;
    case 'Notifications': body = <NotificationsPage onBack={back} />; break;
    case 'Bookings': body = <BookingsPage tab={bookingTab} onTab={setBookingTab} onOpen={() => go('BookingDetail')} onDecline={() => setSheet('decline')} onAdd={() => go('NewBooking')} onVoice={() => setSheet('voice')} />; break;
    case 'BookingDetail': body = <BookingDetailPage onBack={back} onChat={() => go('Chat')} onNotes={() => go('SessionNotes')} onRoom={() => go('Consultation')} />; break;
    case 'NewBooking': body = <NewBookingPage onBack={back} onDone={back} />; break;
    case 'BlockTime': body = <BlockTimePage onBack={back} onDone={back} />; break;
    case 'Inbox': body = <InboxPage onOpen={() => go('Chat')} />; break;
    case 'Chat': body = <ChatPage onBack={back} onCall={() => go('Consultation')} onBooking={() => go('BookingDetail')} />; break;
    case 'Consultation': body = <ConsultationPage onEnd={back} />; break;
    case 'SessionNotes': body = <SessionNotesPage onBack={back} shared={notesShared} onShared={setNotesShared} />; break;
    case 'Earnings': body = <EarningsPage onPayout={() => go('RequestPayout')} onHistory={() => go('Payouts')} onTransactions={() => go('Transactions')} onNotifications={() => go('Notifications')} />; break;
    case 'Transactions': body = <TransactionsPage onBack={back} onOpen={() => go('TransactionDetail')} />; break;
    case 'TransactionDetail': body = <TransactionDetailPage onBack={back} />; break;
    case 'RequestPayout': body = <RequestPayoutPage onBack={back} amount={payoutAmount} onAmount={setPayoutAmount} onAccount={() => go('PayoutAccount')} />; break;
    case 'Payouts': body = <PayoutsPage onBack={back} onRequest={() => go('RequestPayout')} onChange={() => go('PayoutAccount')} />; break;
    case 'PayoutAccount': body = <PayoutAccountPage onBack={back} />; break;
  }

  const showNav = tab !== null;
  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>{body}</ScrollView>
    {showNav && <View style={styles.navWrap}><BottomNav value={tab} onChange={openTab} /></View>}
    {sheet === 'create' && <Sheet title="Create" onClose={() => setSheet(null)}>
      <View style={styles.grid}>
        {[{ l: 'New booking', i: CalendarDays, a: () => go('NewBooking') }, { l: 'Block time', i: Ban, a: () => go('BlockTime') }, { l: 'Add service', i: Tag, a: () => setSheet(null) },
          { l: 'Add task', i: CircleCheck, a: () => setSheet(null) }, { l: 'Promo code', i: Tag, a: () => setSheet(null) }, { l: 'Boost', i: Megaphone, a: () => setSheet(null) }]
          .map(({ l, i: Icon, a }) => <Pressable key={l} onPress={a} accessibilityRole="button" style={styles.gridTile}>
            <View style={styles.gridIcon}><Icon size={22} color={colors.ink900} strokeWidth={1.8} /></View>
            <Text variant="button" style={{ textAlign: 'center' }}>{l}</Text>
          </Pressable>)}
      </View>
    </Sheet>}
    {sheet === 'decline' && <DeclineSheet onClose={() => setSheet(null)} />}
    {sheet === 'voice' && <VoiceSheet onClose={() => setSheet(null)} />}
  </SafeAreaView>;
}

/* ---------- Onboarding ---------- */

function SignupPage({ onNext }: { onNext: () => void }) {
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState(true);
  return <View style={styles.page}>
    <Header onBack={undefined} />
    <Text variant="display" style={{ fontSize: 28, lineHeight: 34 }}>Grow your business</Text>
    <Text variant="body" color={colors.muted}>Set up your storefront in minutes.</Text>
    <Input label="Business name" defaultValue="Glow Studio" />
    <Input label="Category" defaultValue="Hair & Beauty" />
    <Input label="Email" defaultValue="hello@glowstudio.com" keyboardType="email-address" autoCapitalize="none" />
    <Input label="Phone number" defaultValue="+234 801 234 5678" keyboardType="phone-pad" />
    <Input label="Password" defaultValue="password123" secureTextEntry={!show}
      trailing={<Pressable onPress={() => setShow(v => !v)} accessibilityRole="button" accessibilityLabel={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff size={20} color={colors.muted} /> : <Eye size={20} color={colors.muted} />}</Pressable>} />
    <Pressable onPress={() => setTerms(v => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: terms }} style={styles.checkRow}>
      <View style={[styles.checkbox, terms && { backgroundColor: colors.gold }]}>{terms && <Check size={14} color={colors.ink900} strokeWidth={3} />}</View>
      <Text variant="body">I agree to the Terms and Vendor Agreement</Text>
    </Pressable>
    <View style={{ flex: 1 }} />
    <Button label="Create business account" size="large" style={styles.full} onPress={onNext} />
  </View>;
}

function SetupPage({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const steps = [
    { title: 'Business profile', sub: 'Name, logo and contact', done: true },
    { title: 'Add your services', sub: '4 services added', done: true },
    { title: 'Upload your works', sub: '6 photos added', done: true },
    { title: 'Set working hours', sub: 'Takes about 2 minutes', done: false, next: true },
    { title: 'Connect payout account', sub: 'Where we send your earnings', done: false },
    { title: 'Choose a plan', sub: '14-day free trial included', done: false },
  ];
  return <View style={styles.page}>
    <Text variant="h1">Set up Glow Studio</Text>
    <Text variant="body" color={colors.muted}>Finish these steps to go live.</Text>
    <View style={styles.progressTrack}><View style={[styles.progressFill, { width: '50%' }]} /></View>
    <Text variant="caption" color={colors.goldDeep} style={{ textAlign: 'right' }}>3 of 6 complete</Text>
    {steps.map(step => <Card key={step.title} style={[styles.stepCard, step.next && { backgroundColor: colors.goldTint, borderColor: colors.gold }]}>
      <View style={[styles.stepCircle, step.done && { backgroundColor: colors.gold, borderColor: colors.gold }]}>
        {step.done && <Check size={14} color={colors.ink900} strokeWidth={3} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="h3" color={step.done ? colors.muted : colors.ink900}>{step.title}</Text>
        <Text variant="caption" color={colors.muted}>{step.sub}</Text>
      </View>
      {!step.done && <ChevronRight size={18} color={colors.ink800} />}
    </Card>)}
    <Pressable onPress={onSkip} accessibilityRole="button" style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center' }}>
      <Text variant="button" color={colors.goldDeep}>Skip for now</Text>
    </Pressable>
    <Button label="Continue setup" size="large" style={styles.full} onPress={onNext} />
  </View>;
}

function PlansPage({ onNext, onBack }: { onNext: () => void; onBack?: () => void }) {
  const [period, setPeriod] = useState('Monthly');
  const plans = [
    { name: 'Basic', price: '$19/mo', features: ['Storefront and bookings', 'Payments and reminders'] },
    { name: 'Pro', price: '$49/mo', popular: true, features: ['Custom branding, analytics', 'Promo codes and marketing'] },
    { name: 'Premium', price: '$99/mo', features: ['Staff management', 'API, integrations, custom domain'] },
  ];
  return <View style={styles.page}>
    <Header title="Choose a plan" onBack={onBack} />
    <Segmented options={['Monthly', 'Annual · save 20%']} value={period} onChange={setPeriod} />
    {plans.map(plan => <Card key={plan.name} style={[styles.planCard, plan.popular && { backgroundColor: colors.goldTint, borderColor: colors.gold, borderWidth: 2 }]}>
      <View style={styles.rowBetween}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="h2">{plan.name}</Text>
          {plan.popular && <Tone label="Popular" tone="gold" />}
        </View>
        <Text variant="h2">{plan.price}</Text>
      </View>
      {plan.features.map(f => <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Check size={16} color={colors.ink900} strokeWidth={2.5} /><Text variant="button">{f}</Text>
      </View>)}
    </Card>)}
    <Text variant="caption" color={colors.muted} style={{ textAlign: 'center' }}>All plans include a 14-day free trial.</Text>
    <View style={{ flex: 1 }} />
    <Button label="Start free trial" size="large" style={styles.full} onPress={onNext} />
  </View>;
}

/* ---------- Home ---------- */

function HomePage({ onNotifications, onCreate, onBlock, onBooking, onEarnings }: {
  onNotifications: () => void; onCreate: () => void; onBlock: () => void; onBooking: () => void; onEarnings: () => void;
}) {
  const [range, setRange] = useState('Day');
  return <View style={styles.page}>
    <View style={styles.rowBetween}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <Avatar initials="GS" size={48} />
        <View style={{ flex: 1 }}>
          <Text variant="h3">Good morning, Amaka</Text>
          <Text variant="caption" color={colors.muted}>Glow Studio · Pro plan</Text>
        </View>
      </View>
      <IconSquare icon={Bell} label="Notifications" dot onPress={onNotifications} />
    </View>

    <Gold>
      <View style={styles.rowBetween}>
        <Text variant="caption" color={colors.line}>Today's revenue</Text>
        <Segmented options={['Day', 'Week']} value={range} onChange={setRange} />
      </View>
      <Text variant="display" color={colors.gold} style={{ fontSize: 34, lineHeight: 42 }}>₦84,500</Text>
      <View style={styles.trend}><Text variant="caption" color={colors.ink900}>↗ 12% vs last Tue</Text></View>
    </Gold>

    <View style={styles.statRow}>
      <StatCard label="Bookings" value="6" note="2 in progress" />
      <StatCard label="Requests" value="3" note="Needs review" highlight />
      <StatCard label="Rating" value="★ 4.9" note="128 reviews" />
    </View>

    <View style={styles.statRow}>
      {[{ l: 'New', i: Plus, a: onCreate }, { l: 'Block time', i: Ban, a: onBlock }, { l: 'Promo', i: Tag, a: onCreate }, { l: 'Boost', i: Megaphone, a: onCreate }]
        .map(({ l, i: Icon, a }) => <Pressable key={l} onPress={a} accessibilityRole="button" style={styles.quickTile}>
          <Icon size={20} color={colors.ink900} strokeWidth={1.8} />
          <Text variant="caption">{l}</Text>
        </Pressable>)}
    </View>

    <View style={styles.rowBetween}>
      <Text variant="h3">Today's schedule</Text>
      <Pressable onPress={onBooking} accessibilityRole="button"><Text variant="button" color={colors.goldDeep}>See all</Text></Pressable>
    </View>
    {bookingsToday.map(b => <Pressable key={b.name} onPress={onBooking} accessibilityRole="button">
      <Card style={styles.scheduleRow}>
        <Text variant="button" color={colors.muted} style={{ width: 64 }}>{b.time}</Text>
        <View style={{ flex: 1 }}>
          <Text variant="h3">{b.name}</Text>
          <Text variant="caption" color={colors.muted}>{b.service}</Text>
        </View>
        <Badge status={b.status} small />
      </Card>
    </Pressable>)}
    <Pressable onPress={onEarnings} accessibilityRole="button"><Text variant="caption" color={colors.muted}>Payouts go to your bank every Friday.</Text></Pressable>
  </View>;
}

function StatCard({ label, value, note, highlight }: { label: string; value: string; note: string; highlight?: boolean }) {
  return <Card style={[styles.statCard, highlight && { backgroundColor: colors.goldTint, borderColor: colors.gold }]}>
    <Text variant="caption" color={colors.muted}>{label}</Text>
    <Text variant="h2">{value}</Text>
    <Text variant="caption" color={colors.success}>{note}</Text>
  </Card>;
}

function NotificationsPage({ onBack }: { onBack: () => void }) {
  const today = [
    { title: 'New booking request', sub: 'Ngozi E. · Knotless braids\nSat 21 Nov, 10:00 AM', time: '2m', unread: true, icon: CalendarDays },
    { title: 'Payment received', sub: '₦26,875 from Ada Okafor.', time: '1h', unread: true, icon: Wallet },
    { title: 'New 5-star review', sub: 'Ada O: “Amaka was amazing!”', time: '3h', unread: false, icon: Star },
  ];
  const earlier = [
    { title: 'Payout sent', sub: '₦312,000 to Access Bank ••4821', time: 'Mon', icon: Landmark },
    { title: 'Plan renews in 3 days', sub: 'Pro plan · $49 on 20 Nov', time: 'Sun', icon: Crown },
  ];
  const row = (n: { title: string; sub: string; time: string; icon: LucideIcon; unread?: boolean }) => <Card key={n.title} style={[styles.notifRow, n.unread && { backgroundColor: colors.goldTint, borderColor: colors.goldTint }]}>
    <View style={styles.notifIcon}><n.icon size={20} color={colors.ink900} strokeWidth={1.8} /></View>
    <View style={{ flex: 1 }}>
      <View style={styles.rowBetween}><Text variant="h3">{n.title}</Text><Text variant="caption" color={colors.muted}>{n.time}</Text></View>
      <Text variant="caption" color={colors.muted}>{n.sub}</Text>
    </View>
    {n.unread && <View style={styles.unreadDot} />}
  </Card>;
  return <View style={styles.page}>
    <Header title="Notifications" onBack={onBack} right={<Pressable accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }}><Text variant="button" color={colors.goldDeep}>Mark all read</Text></Pressable>} />
    <Text variant="overline" color={colors.muted}>TODAY</Text>
    {today.map(row)}
    <Text variant="overline" color={colors.muted}>EARLIER</Text>
    {earlier.map(row)}
  </View>;
}

/* ---------- Bookings ---------- */

function BookingsPage({ tab, onTab, onOpen, onDecline, onAdd, onVoice }: {
  tab: string; onTab: (tab: string) => void; onOpen: () => void; onDecline: () => void; onAdd: () => void; onVoice: () => void;
}) {
  return <View style={styles.page}>
    <View style={styles.rowBetween}>
      <Text variant="h1">Bookings</Text>
      <IconSquare icon={Plus} label="New booking" onPress={onAdd} />
    </View>
    <Segmented options={['Calendar', 'Requests', 'Notes']} value={tab} onChange={onTab} />

    {tab === 'Calendar' && <>
      <View style={styles.weekRow}>
        {[['Mon', '16'], ['Tue', '17'], ['Wed', '18'], ['Thu', '19'], ['Fri', '20'], ['Sat', '21'], ['Sun', '22']].map(([d, n]) => {
          const active = n === '17';
          return <View key={d} style={[styles.dayCell, active && { backgroundColor: colors.gold, borderColor: colors.gold }]}>
            <Text variant="caption" color={colors.muted}>{d}</Text>
            <Text variant="h3">{n}</Text>
          </View>;
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['All staff', 'Amaka', 'Tolu', 'Bisi'].map((s, i) => <Chip key={s} label={s} selected={i === 0} />)}
      </View>
      <Card style={styles.timeline}>
        <TimelineBlock time="10:00 – 11:30" title="Ada Okafor" sub="Silk press & trim · Amaka" tone="gold" onPress={onOpen} />
        <TimelineBlock time="11:30 – 12:30" title="Chidi N." sub="Wash & style · Tolu" tone="light" onPress={onOpen} />
        <View style={styles.lunch}><Text variant="caption" color={colors.muted}>Lunch break</Text></View>
        <TimelineBlock time="2:00 – 3:30" title="Ngozi E. · Pending" sub="Knotless braids · Bisi" tone="pending" onPress={onOpen} />
      </Card>
    </>}

    {tab === 'Requests' && requests.map(r => <Card key={r.name} style={styles.requestCard}>
      <View style={styles.rowBetween}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 }}>
          <Avatar initials={r.name.split(' ').map(p => p[0]).join('').slice(0, 2)} size={40} />
          <View><Text variant="h3">{r.name}</Text><Text variant="caption" color={colors.muted}>{r.tag}</Text></View>
        </View>
        <Tone label="Paid" tone="success" />
      </View>
      <View style={styles.requestBand}><Text variant="button">{r.service}</Text><Text variant="button">{r.when}</Text></View>
      <View style={styles.rowBetween}>
        <View><Text variant="caption" color={colors.muted}>Total</Text><Text variant="h3">{r.total}</Text></View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button label="Decline" variant="outline" size="small" onPress={onDecline} style={{ borderColor: colors.line }} />
          <Button label="Accept" size="small" onPress={onOpen} />
        </View>
      </View>
    </Card>)}

    {tab === 'Notes' && <>
      <View style={styles.rowBetween}><Text variant="h3">Today</Text><Text variant="caption" color={colors.goldDeep}>2 of 5 done</Text></View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: '40%' }]} /></View>
      <Segmented options={['All', 'Mine', 'Team']} value="All" onChange={() => undefined} />
      {[
        { t: 'Order shampoo stock', s: '12:00 PM · Tolu', done: false },
        { t: 'Update price list', s: '2:00 PM · Amaka', done: false },
        { t: 'Pay supplier invoice', s: 'Done · 9:30 AM', done: true },
        { t: 'Post new works to storefront', s: '4:00 PM · Bisi', done: false, highlight: true },
        { t: 'Staff meeting', s: '5:30 PM · Everyone', done: false },
      ].map(task => <Card key={task.t} style={[styles.taskRow, task.highlight && { backgroundColor: colors.goldTint, borderColor: colors.gold }]}>
        <View style={[styles.taskCircle, task.done && { backgroundColor: colors.gold, borderColor: colors.gold }]}>
          {task.done && <Check size={14} color={colors.ink900} strokeWidth={3} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="h3" color={task.done ? colors.muted : colors.ink900}>{task.t}</Text>
          <Text variant="caption" color={colors.muted}>{task.s}</Text>
        </View>
      </Card>)}
      <View style={{ alignSelf: 'flex-end', marginTop: spacing.sm }}>
        <Pressable onPress={onVoice} accessibilityRole="button" accessibilityLabel="Voice note" style={styles.fab}>
          <Mic size={24} color={colors.ink900} strokeWidth={1.8} />
        </Pressable>
      </View>
    </>}
  </View>;
}

function TimelineBlock({ time, title, sub, tone, onPress }: { time: string; title: string; sub: string; tone: 'gold' | 'light' | 'pending'; onPress: () => void }) {
  const bg = tone === 'gold' ? colors.gold : tone === 'light' ? colors.goldTint : colors.warningTint;
  return <Pressable onPress={onPress} accessibilityRole="button" style={[styles.block, { backgroundColor: bg, borderColor: tone === 'pending' ? colors.warning : 'transparent', borderStyle: tone === 'pending' ? 'dashed' : 'solid' }]}>
    <Text variant="overline" color={colors.ink800}>{time}</Text>
    <Text variant="h3">{title}</Text>
    <Text variant="caption">{sub}</Text>
  </Pressable>;
}

function DeclineSheet({ onClose }: { onClose: () => void }) {
  const [reason, setReason] = useState('Staff unavailable');
  return <View style={styles.overlay}>
    <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close" />
    <View style={styles.sheet}>
      <View style={styles.grabber} />
      <Text variant="h2">Decline this request?</Text>
      <Text variant="caption" color={colors.muted}>Ngozi will be notified and refunded automatically.</Text>
      {['Fully booked', 'Staff unavailable', 'Service not available', 'Other'].map(option => {
        const active = option === reason;
        return <Pressable key={option} onPress={() => setReason(option)} accessibilityRole="radio" accessibilityState={{ selected: active }}
          style={[styles.radioRow, active && { backgroundColor: colors.goldTint, borderColor: colors.gold }]}>
          <View style={[styles.radio, active && { borderColor: colors.ink900 }]}>{active && <View style={styles.radioInner} />}</View>
          <Text variant="button">{option}</Text>
        </Pressable>;
      })}
      <Input label="Message (optional)" placeholder="Add a message" multiline />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button label="Keep request" variant="outline" style={{ flex: 1, justifyContent: 'center' }} onPress={onClose} />
        <Pressable onPress={onClose} accessibilityRole="button" style={[styles.destructive, { flex: 1 }]}><Text variant="button" color={colors.pearl}>Decline request</Text></Pressable>
      </View>
    </View>
  </View>;
}

function VoiceSheet({ onClose }: { onClose: () => void }) {
  const bars = [4, 8, 14, 22, 12, 28, 16, 34, 20, 30, 12, 24, 36, 18, 10, 26, 14, 8, 4];
  return <View style={styles.overlay}>
    <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close" />
    <View style={styles.sheet}>
      <View style={styles.grabber} />
      <Text variant="h2" style={{ textAlign: 'center' }}>Listening…</Text>
      <Text variant="caption" color={colors.muted} style={{ textAlign: 'center' }}>Say a name to assign a task, like “ask Tolu”.</Text>
      <View style={styles.waveRow}>{bars.map((h, i) => <View key={i} style={{ width: 3, height: h, borderRadius: 2, backgroundColor: colors.gold }} />)}</View>
      <View style={styles.transcript}>
        <Text variant="body">Order shampoo from the supplier, ask Tolu to cover Friday morning, and update the price list by Monday.</Text>
      </View>
      <View style={styles.voiceControls}>
        <Pressable onPress={onClose} accessibilityRole="button"><Text variant="button" color={colors.muted}>Cancel</Text></Pressable>
        <View style={styles.micLarge}><Mic size={30} color={colors.ink900} strokeWidth={1.8} /></View>
        <Pressable onPress={onClose} accessibilityRole="button"><Text variant="button" color={colors.goldDeep}>Done</Text></Pressable>
      </View>
    </View>
  </View>;
}

function BookingDetailPage({ onBack, onChat, onNotes, onRoom }: { onBack: () => void; onChat: () => void; onNotes: () => void; onRoom: () => void }) {
  const rows: [string, string][] = [['Service', 'Silk press & trim'], ['Staff', 'Amaka'], ['Time', 'Tue 17 Nov · 10:00 AM'], ['Duration', '90 min'], ['Type', 'In person']];
  return <View style={styles.page}>
    <Header title="Booking detail" onBack={onBack} />
    <View style={styles.rowBetween}><Tone label="In progress" tone="gold" /><Text variant="caption" color={colors.muted}>BK-2026-0418</Text></View>
    <Card style={styles.customerCard}>
      <Avatar initials="AO" size={48} />
      <View style={{ flex: 1 }}><Text variant="h3">Ada Okafor</Text><Text variant="caption" color={colors.muted}>6 bookings · Customer since Aug</Text></View>
      <IconSquare icon={MessageCircle} label="Message" onPress={onChat} />
      <IconSquare icon={Phone} label="Call" onPress={onRoom} />
    </Card>
    <Card style={{ padding: spacing.lg, gap: spacing.md }}>
      {rows.map(([k, v]) => <View key={k} style={styles.rowBetween}><Text variant="body" color={colors.muted}>{k}</Text><Text variant="button">{v}</Text></View>)}
    </Card>
    <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
      <View style={styles.rowBetween}><Text variant="button">Payment</Text><Tone label="Paid" tone="success" /></View>
      <View style={styles.rowBetween}><Text variant="caption" color={colors.muted}>Customer paid</Text><Text variant="caption">₦26,875</Text></View>
      <View style={styles.rowBetween}><Text variant="caption" color={colors.muted}>You receive (after 10% commission)</Text><Text variant="button" color={colors.success}>₦22,500</Text></View>
    </Card>
    <View style={styles.noteBox}>
      <Text variant="overline" color={colors.muted}>NOTE FROM CUSTOMER</Text>
      <Text variant="body">Bringing a reference photo.</Text>
    </View>
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Button label="Reschedule" variant="outline" style={{ flex: 1, justifyContent: 'center' }} onPress={onNotes} />
      <Pressable onPress={onBack} accessibilityRole="button" style={[styles.outlineDanger, { flex: 1 }]}><Text variant="button" color={colors.error}>Cancel</Text></Pressable>
    </View>
    <Button label="Mark as completed" size="large" icon={Check} style={styles.full} onPress={onNotes} />
  </View>;
}

function NewBookingPage({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [payment, setPayment] = useState('Unpaid');
  return <View style={styles.page}>
    <Header title="New booking" onBack={onBack} />
    <Text variant="overline" color={colors.muted}>CUSTOMER</Text>
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      <Chip label="Walk-in" /><Chip label="Ada Okafor" selected /><Chip label="+ New" />
    </View>
    <Card>
      <Field label="Service" value="Silk press & trim" />
      <Field label="Staff" value="Amaka" />
      <Field label="Date" value="Wed 18 Nov" />
      <Field label="Time" value="1:00 PM" />
      <Field label="Price" value="₦25,000" />
    </Card>
    <Text variant="overline" color={colors.muted}>PAYMENT</Text>
    <Segmented options={['Unpaid', 'Cash', 'Transfer']} value={payment} onChange={setPayment} />
    <Input label="Note (optional)" placeholder="Add a note" multiline />
    <View style={{ flex: 1 }} />
    <Button label="Create booking" size="large" style={styles.full} onPress={onDone} />
  </View>;
}

function BlockTimePage({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [mode, setMode] = useState('Time off');
  const [allDay, setAllDay] = useState(true);
  const [staff, setStaff] = useState('All staff');
  return <View style={styles.page}>
    <Header title="Block time" onBack={onBack} />
    <Segmented options={['Time off', 'Holiday']} value={mode} onChange={setMode} />
    <Card>
      <Field label="From" value="Fri 20 Nov" />
      <Field label="To" value="Fri 20 Nov" />
      <Pressable onPress={() => setAllDay(v => !v)} accessibilityRole="switch" accessibilityState={{ checked: allDay }} style={styles.fieldRow}>
        <Text variant="button">All day</Text>
        <View style={[styles.switch, allDay && { backgroundColor: colors.gold }]}><View style={[styles.switchKnob, allDay && { alignSelf: 'flex-end' }]} /></View>
      </Pressable>
    </Card>
    <Text variant="overline" color={colors.muted}>APPLIES TO</Text>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {['All staff', 'Amaka', 'Tolu', 'Bisi'].map(s => <Chip key={s} label={s} selected={staff === s} onPress={() => setStaff(s)} />)}
    </View>
    <Input label="Reason" defaultValue="Public holiday" />
    <Card style={{ borderStyle: 'solid' }}>
      <Field label="Repeat" value="Does not repeat" trailing={<Repeat size={18} color={colors.ink800} />} />
    </Card>
    <View style={styles.warnBox}>
      <TriangleAlert size={20} color={colors.warning} />
      <View style={{ flex: 1 }}>
        <Text variant="button">2 bookings fall in this period</Text>
        <Text variant="caption" color={colors.muted}>Review and notify customers.</Text>
      </View>
      <Text variant="button" color={colors.goldDeep}>Review</Text>
    </View>
    <View style={{ flex: 1 }} />
    <Button label="Block time" size="large" style={styles.full} onPress={onDone} />
  </View>;
}

/* ---------- Inbox ---------- */

function InboxPage({ onOpen }: { onOpen: () => void }) {
  const [filter, setFilter] = useState('All');
  return <View style={styles.page}>
    <View style={styles.rowBetween}><Text variant="h1">Inbox</Text><IconSquare icon={Plus} label="New message" /></View>
    <Input label="Search customers" placeholder="Search customers" />
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {['All', 'Unread 2', 'Bookings', 'Enquiries'].map(f => <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />)}
    </View>
    {inboxItems.map(item => <Pressable key={item.name} onPress={onOpen} accessibilityRole="button" style={styles.inboxRow}>
      <Avatar initials={item.initials} size={48} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="h3">{item.name}</Text><Tone label={item.tag} tone="gold" />
        </View>
        <Text variant="caption" color={item.unread ? colors.ink900 : colors.muted}>{item.msg}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Text variant="caption" color={colors.muted}>{item.time}</Text>
        {item.unread > 0 && <View style={styles.unreadCount}><Text variant="overline" style={{ fontSize: 10 }}>{item.unread}</Text></View>}
      </View>
    </Pressable>)}
  </View>;
}

function ChatPage({ onBack, onCall, onBooking }: { onBack: () => void; onCall: () => void; onBooking: () => void }) {
  const [draft, setDraft] = useState('');
  return <View style={[styles.page, { flex: 1, minHeight: 640 }]}>
    <Header onBack={onBack} title="" right={<IconSquare icon={Phone} label="Call" onPress={onCall} />} />
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: -8 }}>
      <Avatar initials="AO" size={40} />
      <View><Text variant="h3">Ada Okafor</Text><Text variant="caption" color={colors.muted}>6 bookings</Text></View>
    </View>
    <Pressable onPress={onBooking} accessibilityRole="button" style={styles.bookingBanner}>
      <Text variant="button">Silk press & trim · Amaka</Text><Text variant="caption" color={colors.muted}>Tue 17 Nov · 10:00 AM · Paid  ›</Text>
    </Pressable>
    <Bubble side="left">Can I bring a reference photo? It's a new style.</Bubble>
    <Bubble side="right">Of course, send it here.</Bubble>
    <LinearGradient colors={[colors.goldTint, colors.crayolaGold, colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.photo} />
    <Bubble side="right">Lovely, we can match that. See you at 10:00.</Bubble>
    <Text variant="overline" color={colors.muted}>QUICK REPLIES</Text>
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {['Confirmed!', '10 min late', 'Directions'].map(q => <Chip key={q} label={q} onPress={() => setDraft(q)} />)}
    </View>
    <View style={{ flex: 1 }} />
    <View style={styles.composer}>
      <Paperclip size={20} color={colors.muted} />
      <Input label="Message" placeholder="Message…" value={draft} onChangeText={setDraft} style={{ paddingVertical: 10 }} />
      <Pressable accessibilityRole="button" accessibilityLabel="Send" style={styles.sendBtn}><Send size={18} color={colors.ink900} /></Pressable>
    </View>
  </View>;
}

function Bubble({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  return <View style={{ alignSelf: side === 'right' ? 'flex-end' : 'flex-start', maxWidth: '78%', backgroundColor: side === 'right' ? colors.gold : colors.daisy, borderWidth: side === 'left' ? 1 : 0, borderColor: colors.line, borderRadius: radii.card, paddingHorizontal: 14, paddingVertical: 10 }}>
    <Text variant="body">{children}</Text>
  </View>;
}

function ConsultationPage({ onEnd }: { onEnd: () => void }) {
  return <View style={[styles.page, { flex: 1, minHeight: 640 }]}>
    <View style={styles.roomTop}><Text variant="caption" color={colors.pearl}>● 24:10</Text></View>
    <View style={styles.roomStage}>
      <Avatar initials="AO" size={96} />
      <View style={styles.selfTile}><Text variant="caption" color={colors.ink900}>You</Text></View>
    </View>
    <View style={styles.roomControls}>
      {[Mic, Video, MessageCircle].map((Icon, i) => <View key={i} style={styles.roomBtn}><Icon size={22} color={colors.pearl} /></View>)}
      <Pressable onPress={onEnd} accessibilityRole="button" accessibilityLabel="End call" style={[styles.roomBtn, { backgroundColor: colors.error }]}>
        <PhoneOff size={22} color={colors.pearl} />
      </Pressable>
    </View>
    <View style={styles.sheetLike}>
      <View style={styles.rowBetween}><Text variant="h3">Session notes</Text><Text variant="caption" color={colors.muted}>Share with Ada</Text></View>
      <Card style={{ padding: spacing.md }}><Text variant="body" color={colors.muted}>• Silk press, medium heat.{'\n'}• Sensitive scalp: avoid hot water.</Text></Card>
    </View>
  </View>;
}

function SessionNotesPage({ onBack, shared, onShared }: { onBack: () => void; shared: boolean; onShared: (v: boolean) => void }) {
  const [privacy, setPrivacy] = useState('Private');
  return <View style={styles.page}>
    <Header title="Session notes" onBack={onBack} />
    <Card style={styles.customerCard}>
      <Avatar initials="AO" size={40} />
      <View style={{ flex: 1 }}><Text variant="h3">Ada Okafor</Text><Text variant="caption" color={colors.muted}>Silk press · Tue 17 Nov · 10:00</Text></View>
    </Card>
    <Segmented options={['Private', 'Shared with customer']} value={privacy} onChange={setPrivacy} />
    <Card style={{ padding: spacing.md }}>
      <Text variant="body">Silk press, medium heat. Scalp is sensitive, so I used lukewarm water and a gentle shampoo.{'\n\n'}Recommended: deep condition every 2 weeks and re-book in 6 weeks.</Text>
    </Card>
    <Text variant="overline" color={colors.muted}>TEMPLATES</Text>
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {['Aftercare', 'Follow-up', 'Products used'].map(t => <Chip key={t} label={t} />)}
    </View>
    <Card style={[styles.rowBetween, { padding: spacing.md }]}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Download size={18} color={colors.ink900} /><Text variant="button">Aftercare-notes.pdf</Text></View><Text variant="caption" color={colors.muted}>PDF · 124 KB</Text></Card>
    <Pressable onPress={() => onShared(!shared)} accessibilityRole="switch" accessibilityState={{ checked: shared }} style={styles.fieldRow}>
      <Text variant="button">Share with Ada</Text>
      <View style={[styles.switch, shared && { backgroundColor: colors.gold }]}><View style={[styles.switchKnob, shared && { alignSelf: 'flex-end' }]} /></View>
    </Pressable>
    <View style={{ flex: 1 }} />
    <Button label="Save notes" size="large" style={styles.full} onPress={onBack} />
  </View>;
}

/* ---------- Earnings ---------- */

function EarningsPage({ onPayout, onHistory, onTransactions, onNotifications }: { onPayout: () => void; onHistory: () => void; onTransactions: () => void; onNotifications: () => void }) {
  const bars = [0.35, 0.5, 0.4, 0.62, 0.52, 1, 0.66];
  return <View style={styles.page}>
    <View style={styles.rowBetween}><Text variant="h1">Earnings</Text><IconSquare icon={Bell} label="Notifications" onPress={onNotifications} /></View>
    <Gold>
      <Text variant="caption" color={colors.line}>Available balance</Text>
      <Text variant="display" color={colors.gold} style={{ fontSize: 34, lineHeight: 42 }}>₦312,000</Text>
      <Text variant="caption" color={colors.line}>Next auto payout · Fri 20 Nov</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: spacing.sm }}>
        <Button label="Request payout" size="small" onPress={onPayout} />
        <Pressable onPress={onHistory} accessibilityRole="button" style={styles.darkBtn}><Text variant="button" color={colors.pearl}>History</Text></Pressable>
      </View>
    </Gold>
    <View style={styles.statRow}>
      <Card style={[styles.statCard, { flex: 1 }]}><Text variant="caption" color={colors.muted}>Pending</Text><Text variant="h2">₦84,500</Text><Text variant="caption" color={colors.muted}>3 bookings</Text></Card>
      <Card style={[styles.statCard, { flex: 1 }]}><Text variant="caption" color={colors.muted}>This month</Text><Text variant="h2">₦1,284,000</Text><Text variant="caption" color={colors.success}>▲ 18%</Text></Card>
    </View>
    <Card style={{ padding: spacing.lg, gap: spacing.md }}>
      <View style={styles.rowBetween}><Text variant="button">Last 7 days</Text><Text variant="button">₦412,000</Text></View>
      <View style={styles.chart}>
        {bars.map((b, i) => <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
          <View style={{ width: '70%', height: 90 * b, borderRadius: 6, backgroundColor: b === 1 ? colors.gold : colors.goldTint }} />
          <Text variant="caption" color={colors.muted}>{'MTWTFSS'[i]}</Text>
        </View>)}
      </View>
    </Card>
    <View style={styles.rowBetween}><Text variant="h3">Recent</Text><Pressable onPress={onTransactions} accessibilityRole="button"><Text variant="button" color={colors.goldDeep}>See all</Text></Pressable></View>
    <Pressable onPress={onTransactions} accessibilityRole="button"><TxRow name="Ada Okafor" sub="Silk press & trim" amount="+₦22,500" time="10:42" positive /></Pressable>
  </View>;
}

function TxRow({ name, sub, amount, time, positive }: { name: string; sub: string; amount: string; time: string; positive: boolean }) {
  return <Card style={styles.txRow}>
    <View style={styles.txIcon}><Wallet size={18} color={colors.ink900} strokeWidth={1.8} /></View>
    <View style={{ flex: 1 }}><Text variant="h3">{name}</Text><Text variant="caption" color={colors.muted}>{sub}</Text></View>
    <View style={{ alignItems: 'flex-end' }}>
      <Text variant="button" color={positive ? colors.success : colors.error}>{amount}</Text>
      <Text variant="caption" color={colors.muted}>{time}</Text>
    </View>
  </Card>;
}

function TransactionsPage({ onBack, onOpen }: { onBack: () => void; onOpen: () => void }) {
  const [filter, setFilter] = useState('All');
  return <View style={styles.page}>
    <Header title="Transactions" onBack={onBack} right={<IconSquare icon={SlidersHorizontal} label="Filter" />} />
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {['All', 'Payments', 'Refunds', 'Payouts'].map(f => <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />)}
    </View>
    <Text variant="overline" color={colors.muted}>TODAY</Text>
    {transactions.slice(0, 2).map(t => <Pressable key={t.name} onPress={onOpen} accessibilityRole="button"><TxRow {...t} /></Pressable>)}
    <Text variant="overline" color={colors.muted}>MON 16 NOV</Text>
    {transactions.slice(2).map(t => <Pressable key={t.name} onPress={onOpen} accessibilityRole="button"><TxRow {...t} /></Pressable>)}
  </View>;
}

function TransactionDetailPage({ onBack }: { onBack: () => void }) {
  const rows: [string, string, string?][] = [
    ['Customer paid', '₦26,875'], ['VAT (7.5%)', '−₦1,875'], ['Service amount', '₦25,000'], ['Platform commission (10%)', '−₦2,500', 'red'],
  ];
  return <View style={styles.page}>
    <Header title="Transaction" onBack={onBack} />
    <Text variant="display" color={colors.success} style={{ textAlign: 'center', fontSize: 34, lineHeight: 42 }}>+₦22,500</Text>
    <Text variant="caption" color={colors.muted} style={{ textAlign: 'center' }}>Net earnings</Text>
    <View style={{ alignSelf: 'center' }}><Tone label="Included in payout Fri 20 Nov" tone="gold" /></View>
    <Card style={{ padding: spacing.lg, gap: spacing.md }}>
      {rows.map(([k, v, tone]) => <View key={k} style={styles.rowBetween}><Text variant="body" color={colors.muted}>{k}</Text><Text variant="button" color={tone ? colors.error : colors.ink900}>{v}</Text></View>)}
      <View style={[styles.rowBetween, { borderTopWidth: 1, borderColor: colors.line, paddingTop: spacing.md }]}><Text variant="h3">You earn</Text><Text variant="h3" color={colors.success}>₦22,500</Text></View>
    </Card>
    <Card style={styles.customerCard}>
      <Avatar initials="AO" size={40} />
      <View style={{ flex: 1 }}><Text variant="h3">Ada Okafor</Text><Text variant="caption" color={colors.muted}>Silk press & trim · BK-2026-0418</Text></View>
      <ChevronRight size={18} color={colors.ink800} />
    </Card>
    <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
      <View style={styles.rowBetween}><Text variant="caption" color={colors.muted}>Paid with</Text><Text variant="caption">Card ···· 4417</Text></View>
      <View style={styles.rowBetween}><Text variant="caption" color={colors.muted}>Transaction ID</Text><Text variant="caption">txn_···8F2A</Text></View>
      <View style={styles.rowBetween}><Text variant="caption" color={colors.muted}>Date</Text><Text variant="caption">Tue 17 Nov · 9:41 AM</Text></View>
    </Card>
    <View style={{ flex: 1 }} />
    <Button label="Download receipt" icon={Download} size="large" style={styles.full} onPress={onBack} />
  </View>;
}

function RequestPayoutPage({ onBack, amount, onAmount, onAccount }: { onBack: () => void; amount: string; onAmount: (v: string) => void; onAccount: () => void }) {
  return <View style={styles.page}>
    <Header title="Request payout" onBack={onBack} />
    <View style={styles.balanceBox}>
      <Text variant="caption" color={colors.muted}>Available balance</Text>
      <Text variant="h1">₦312,000</Text>
    </View>
    <Text variant="overline" color={colors.muted}>AMOUNT</Text>
    <Input label="Amount" value={`₦ ${amount}`} onChangeText={v => onAmount(v.replace(/[^\d,]/g, '').replace('₦', '').trim())} keyboardType="number-pad" />
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {['25%', '50%', '75%', 'Max'].map(p => <Chip key={p} label={p} />)}
    </View>
    <Card>
      <Pressable onPress={onAccount} accessibilityRole="button" style={styles.fieldRow}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Landmark size={20} color={colors.ink900} /><View><Text variant="button">Access Bank</Text><Text variant="caption" color={colors.muted}>•••• 4821 · Amaka Eze</Text></View></View>
        <ChevronRight size={18} color={colors.ink800} />
      </Pressable>
    </Card>
    <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
      <View style={styles.rowBetween}><Text variant="caption" color={colors.muted}>Payout fee</Text><Text variant="caption">₦0</Text></View>
      <View style={styles.rowBetween}><Text variant="caption" color={colors.muted}>Arrives in</Text><Text variant="caption">1–2 business days</Text></View>
      <View style={styles.rowBetween}><Text variant="button">You'll receive</Text><Text variant="button" color={colors.success}>₦{amount}</Text></View>
    </Card>
    <View style={styles.infoBox}><Info size={18} color={colors.ink900} /><Text variant="caption">Minimum payout is ₦10,000.</Text></View>
    <View style={{ flex: 1 }} />
    <Button label={`Request ₦${amount}`} size="large" style={styles.full} onPress={onBack} />
  </View>;
}

function PayoutsPage({ onBack, onRequest, onChange }: { onBack: () => void; onRequest: () => void; onChange: () => void }) {
  const history = [
    { amount: '₦180,500', sub: 'Access Bank ••4821 · Today', status: 'Processing', tone: 'warning' as const },
    { amount: '₦312,000', sub: 'Access Bank ••4821 · Mon 16 Nov', status: 'Paid', tone: 'success' as const },
    { amount: '₦95,000', sub: 'Access Bank ••4821 · Fri 6 Nov', status: 'Failed', tone: 'error' as const },
    { amount: '₦268,400', sub: 'Access Bank ••4821 · Fri 30 Oct', status: 'Paid', tone: 'success' as const },
  ];
  return <View style={styles.page}>
    <Header title="Payouts" onBack={onBack} />
    <View style={styles.autoBox}>
      <RefreshCw size={20} color={colors.ink900} />
      <View style={{ flex: 1 }}><Text variant="button">Automatic payouts</Text><Text variant="caption" color={colors.muted}>Every Friday · to Access Bank ••4821</Text></View>
      <Pressable onPress={onChange} accessibilityRole="button"><Text variant="button" color={colors.goldDeep}>Change</Text></Pressable>
    </View>
    <Text variant="h3">History</Text>
    {history.map(h => <Card key={h.sub} style={styles.txRow}>
      <View style={styles.txIcon}><Landmark size={18} color={colors.ink900} /></View>
      <View style={{ flex: 1 }}><Text variant="h3">{h.amount}</Text><Text variant="caption" color={colors.muted}>{h.sub}</Text></View>
      <Tone label={h.status} tone={h.tone} />
    </Card>)}
    <View style={{ flex: 1 }} />
    <Button label="Request payout" size="large" style={styles.full} onPress={onRequest} />
  </View>;
}

function PayoutAccountPage({ onBack }: { onBack: () => void }) {
  const [defaultAcc, setDefaultAcc] = useState(true);
  return <View style={styles.page}>
    <Header title="Payout account" onBack={onBack} />
    <Input label="Bank" defaultValue="Access Bank" />
    <Input label="Account number" defaultValue="0123456789" keyboardType="number-pad" />
    <Input label="Account name" defaultValue="Amaka Eze" trailing={<Check size={20} color={colors.success} />} />
    <Tone label="Name verified" tone="success" />
    <Pressable onPress={() => setDefaultAcc(v => !v)} accessibilityRole="switch" accessibilityState={{ checked: defaultAcc }} style={styles.fieldRow}>
      <Text variant="button">Set as default account</Text>
      <View style={[styles.switch, defaultAcc && { backgroundColor: colors.gold }]}><View style={[styles.switchKnob, defaultAcc && { alignSelf: 'flex-end' }]} /></View>
    </Pressable>
    <View style={styles.infoBox}>
      <ShieldCheck size={20} color={colors.ink900} />
      <View style={{ flex: 1 }}><Text variant="button">We verify your account name with your bank.</Text><Text variant="caption" color={colors.muted}>Payouts only go to accounts in your name.</Text></View>
    </View>
    <View style={{ flex: 1 }} />
    <Button label="Save account" size="large" style={styles.full} onPress={onBack} />
  </View>;
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pearl },
  scroll: { flexGrow: 1, paddingBottom: 120 },
  page: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md, width: '100%', maxWidth: 560, alignSelf: 'center', flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 44 },
  headerSpacer: { width: 44, height: 44 },
  full: { alignSelf: 'stretch' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  iconSquare: { width: 44, height: 44, borderRadius: radii.input, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.daisy, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', right: 9, top: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  badge: { position: 'absolute', right: -4, top: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  avatar: { backgroundColor: colors.crayolaGold, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  tone: { alignSelf: 'flex-start', borderRadius: radii.tag, paddingHorizontal: 10, paddingVertical: 4 },
  segmented: { flexDirection: 'row', backgroundColor: colors.daisy, borderRadius: radii.input, borderWidth: 1, borderColor: colors.line, padding: 4 },
  segment: { flex: 1, minHeight: 40, borderRadius: radii.chip, alignItems: 'center', justifyContent: 'center' },
  fieldRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  overlay: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end', zIndex: 30 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(28,26,20,0.45)' },
  sheet: { backgroundColor: colors.pearl, borderTopLeftRadius: radii.card, borderTopRightRadius: radii.card, padding: spacing.xl, paddingBottom: spacing.huge, gap: spacing.md },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridTile: { width: '31%', minHeight: 110, borderRadius: radii.card, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.daisy, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.sm },
  gridIcon: { width: 44, height: 44, borderRadius: radii.input, backgroundColor: colors.goldTint, alignItems: 'center', justifyContent: 'center' },
  navWrap: { position: 'absolute', left: 16, right: 16, bottom: 16, alignItems: 'center' },
  nav: { flexDirection: 'row', backgroundColor: colors.ink900, borderRadius: radii.pill, padding: 8, gap: 4, width: '100%', maxWidth: 528, justifyContent: 'space-between' },
  navItem: { minHeight: 44, minWidth: 44, borderRadius: radii.pill, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  goldDark: { backgroundColor: colors.ink900, borderRadius: radii.card, padding: spacing.lg, gap: spacing.sm },
  trend: { alignSelf: 'flex-start', backgroundColor: colors.goldTint, borderRadius: radii.chip, paddingHorizontal: 12, paddingVertical: 6 },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, padding: spacing.md, gap: 4 },
  quickTile: { flex: 1, minHeight: 72, borderRadius: radii.input, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.daisy, alignItems: 'center', justifyContent: 'center', gap: 6 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  notifIcon: { width: 44, height: 44, borderRadius: radii.input, backgroundColor: colors.daisy, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  weekRow: { flexDirection: 'row', gap: 4 },
  dayCell: { flex: 1, paddingVertical: 8, borderRadius: radii.input, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.daisy, alignItems: 'center', gap: 2 },
  timeline: { padding: spacing.md, gap: spacing.sm },
  block: { borderRadius: radii.input, borderWidth: 1, padding: spacing.md, gap: 2 },
  lunch: { height: 32, borderRadius: radii.tag, backgroundColor: colors.line, justifyContent: 'center', paddingHorizontal: 12 },
  requestCard: { padding: spacing.md, gap: spacing.md },
  requestBand: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.goldTint, borderRadius: radii.input, padding: spacing.md },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  taskCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  fab: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  radioRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radii.input, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.daisy },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ink900 },
  destructive: { minHeight: 52, borderRadius: radii.button, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  outlineDanger: { minHeight: 48, borderRadius: radii.button, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  waveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 44 },
  transcript: { borderRadius: radii.input, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.daisy, padding: spacing.md },
  voiceControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  micLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  customerCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  noteBox: { borderRadius: radii.input, backgroundColor: colors.goldTint, padding: spacing.md, gap: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  stepCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  stepCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  planCard: { padding: spacing.lg, gap: spacing.sm },
  switch: { width: 48, height: 28, borderRadius: 14, backgroundColor: colors.line, padding: 3, justifyContent: 'center' },
  switchKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.pearl },
  balanceBox: { borderRadius: radii.input, backgroundColor: colors.goldTint, padding: spacing.lg, gap: 4 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radii.input, backgroundColor: colors.goldTint, padding: spacing.md },
  warnBox: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radii.input, backgroundColor: colors.warningTint, padding: spacing.md },
  autoBox: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radii.card, borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.goldTint, padding: spacing.lg },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  txIcon: { width: 40, height: 40, borderRadius: radii.input, backgroundColor: colors.goldTint, alignItems: 'center', justifyContent: 'center' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 6 },
  darkBtn: { minHeight: 44, borderRadius: radii.button, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: colors.ink800 },
  inboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderColor: colors.line },
  unreadCount: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  bookingBanner: { borderRadius: radii.input, backgroundColor: colors.goldTint, padding: spacing.md, gap: 2 },
  photo: { width: 180, height: 140, borderRadius: radii.input, alignSelf: 'flex-start' },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  roomTop: { alignSelf: 'flex-start', backgroundColor: colors.ink900, borderRadius: radii.tag, paddingHorizontal: 10, paddingVertical: 4 },
  roomStage: { flex: 1, minHeight: 320, borderRadius: radii.card, backgroundColor: colors.ink800, alignItems: 'center', justifyContent: 'center' },
  selfTile: { position: 'absolute', right: 12, bottom: 12, width: 90, height: 120, borderRadius: radii.input, backgroundColor: colors.goldTint, alignItems: 'center', justifyContent: 'flex-end', padding: 6 },
  roomControls: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  roomBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.ink800, alignItems: 'center', justifyContent: 'center' },
  sheetLike: { backgroundColor: colors.pearl, borderRadius: radii.card, padding: spacing.lg, gap: spacing.md },
});
