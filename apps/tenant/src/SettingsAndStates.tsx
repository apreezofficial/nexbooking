import { useState, type ReactNode } from 'react';
import { Pressable, Switch, View } from 'react-native';
import {
  Bell, Building2, Check, ChevronRight, CreditCard, Globe, HelpCircle, Landmark, Link2, Lock,
  LogOut, Shield, Star, Tag, TriangleAlert, Image as ImageIcon, WifiOff, FileText, RefreshCw,
  Users, type LucideIcon,
} from 'lucide-react-native';
import { Badge, Button, Card, Chip, Text } from '../../../src/components/primitives';
import { StateView } from '../../../src/components/StateView';
import { colors, radii, spacing } from '../../../src/theme';

type Nav = { onBack: () => void };

/* ---------- Shared pieces ---------- */

export function Page({ title, onBack, children, footer }: Nav & { title: string; children: ReactNode; footer?: ReactNode }) {
  return <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md, width: '100%', maxWidth: 560, alignSelf: 'center', flex: 1 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" style={{ width: 44, height: 44, borderRadius: radii.input, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.daisy, alignItems: 'center', justifyContent: 'center' }}>
        <ChevronRight size={20} color={colors.ink900} style={{ transform: [{ rotate: '180deg' }] }} />
      </Pressable>
      <Text variant="h3" style={{ flex: 1, textAlign: 'center' }}>{title}</Text>
      <View style={{ width: 44 }} />
    </View>
    {children}
    {footer && <View style={{ marginTop: 'auto', paddingBottom: spacing.lg }}>{footer}</View>}
  </View>;
}

export function Section({ label, children }: { label: string; children: ReactNode }) {
  return <View style={{ gap: spacing.sm }}>
    <Text variant="overline" color={colors.muted}>{label}</Text>
    <Card style={{ padding: 0 }}>{children}</Card>
  </View>;
}

export function Row({ icon: Icon, label, sub, value, onPress, right, danger, last }: {
  icon?: LucideIcon; label: string; sub?: string; value?: string; onPress?: () => void; right?: ReactNode; danger?: boolean; last?: boolean;
}) {
  return <Pressable onPress={onPress} accessibilityRole="button" style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: last ? 0 : 1, borderColor: colors.line }}>
    {Icon && <Icon size={20} color={danger ? colors.error : colors.ink900} strokeWidth={1.8} />}
    <View style={{ flex: 1 }}>
      <Text variant="button" color={danger ? colors.error : colors.ink900}>{label}</Text>
      {sub && <Text variant="caption" color={colors.muted}>{sub}</Text>}
    </View>
    {value && <Text variant="caption" color={colors.muted}>{value}</Text>}
    {right ?? (onPress && <ChevronRight size={18} color={colors.ink800} />)}
  </Pressable>;
}

export function Toggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  return <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.line, true: colors.gold }} thumbColor={colors.pearl} />;
}

export function Notice({ icon: Icon, text, tone = 'gold' }: { icon: LucideIcon; text: string; tone?: 'gold' | 'error' }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radii.input, backgroundColor: tone === 'error' ? colors.errorTint : colors.goldTint, padding: spacing.md }}>
    <Icon size={18} color={tone === 'error' ? colors.error : colors.ink900} />
    <Text variant="caption" style={{ flex: 1 }}>{text}</Text>
  </View>;
}

/* ---------- Settings ---------- */

export function SettingsPage({ onBack, go }: Nav & { go: (page: string) => void }) {
  return <Page title="Settings" onBack={onBack}>
    <Section label="BUSINESS">
      <Row icon={Building2} label="Business info" onPress={() => go('BusinessInfo')} />
      <Row icon={Tag} label="Booking policies" onPress={() => go('BookingPolicies')} />
      <Row icon={Landmark} label="Payout settings" value="Access ••4821" onPress={() => go('PayoutSettings')} />
      <Row icon={Users} label="Roles & permissions" onPress={() => go('Roles')} last />
    </Section>
    <Section label="APP">
      <Row icon={Bell} label="Notifications" onPress={() => go('NotificationSettings')} />
      <Row icon={Globe} label="Language" value="English" onPress={() => {}} />
      <Row icon={Shield} label="Security" onPress={() => go('Security')} last />
    </Section>
    <Section label="SUPPORT">
      <Row icon={HelpCircle} label="Help & support" onPress={() => {}} />
      <Row icon={FileText} label="Terms & privacy" onPress={() => {}} />
      <Row icon={LogOut} label="Log out" danger onPress={() => {}} last />
    </Section>
  </Page>;
}

export function BusinessInfoPage({ onBack, go }: Nav & { go: (page: string) => void }) {
  return <Page title="Business info" onBack={onBack}>
    <Section label="WORKS">
      <Row icon={ImageIcon} label="Works" sub="Photos of your work" onPress={() => go('Works')} />
      <Row icon={Star} label="Reviews" sub="What customers say" onPress={() => go('Reviews')} />
      <Row icon={Tag} label="Services" sub="What you offer and prices" onPress={() => go('Services')} last />
    </Section>
    <Section label="SUBSCRIPTION">
      <Row icon={CreditCard} label="Subscription" sub="Pro plan · renews 20 Nov" onPress={() => go('Subscription')} last />
    </Section>
  </Page>;
}

/* ---------- Booking policies ---------- */

export function BookingPoliciesPage({ onBack }: Nav) {
  const [mode, setMode] = useState<'Instant booking' | 'Request approval'>('Instant booking');
  const [deposit, setDeposit] = useState(true);
  const [messages, setMessages] = useState(true);
  return <Page title="Booking policies" onBack={onBack} footer={<Button label="Save policies" size="large" style={{ alignSelf: 'stretch' }} onPress={onBack} />}>
    <Text variant="caption" color={colors.muted}>New bookings are accepted</Text>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {(['Instant booking', 'Request approval'] as const).map(option => <Chip key={option} label={option} selected={mode === option} onPress={() => setMode(option)} />)}
    </View>
    <Section label="RULES">
      <Row label="Free cancellation" value="Up to 24 hours before" onPress={() => {}} />
      <Row label="Time between bookings" value="15 min" onPress={() => {}} />
      <Row label="Book up to" value="60 days ahead" onPress={() => {}} last />
    </Section>
    <Section label="DEPOSIT">
      <Row label="Require a deposit" sub="10% per booking, non-refundable" right={<Toggle value={deposit} onValueChange={setDeposit} />} last />
    </Section>
    <Notice icon={TriangleAlert} text="Free cancellation up to 24 hours before the booking." />
    <Section label="MESSAGES">
      <Row label="Customer messages" sub="Let customers message you" right={<Toggle value={messages} onValueChange={setMessages} />} last />
    </Section>
  </Page>;
}

/* ---------- Notifications ---------- */

export function NotificationSettingsPage({ onBack }: Nav) {
  const [on, setOn] = useState<Record<string, boolean>>({ requests: true, cancellations: true, messages: true, payments: true, payouts: true, billing: true, reviews: true, offers: false });
  const set = (k: string) => (v: boolean) => setOn(s => ({ ...s, [k]: v }));
  return <Page title="Notifications" onBack={onBack}>
    <Section label="BOOKINGS">
      <Row label="New booking requests" right={<Toggle value={on.requests} onValueChange={set('requests')} />} />
      <Row label="Cancellations" right={<Toggle value={on.cancellations} onValueChange={set('cancellations')} />} />
      <Row label="Customer messages" right={<Toggle value={on.messages} onValueChange={set('messages')} />} last />
    </Section>
    <Section label="MONEY">
      <Row label="Payments received" right={<Toggle value={on.payments} onValueChange={set('payments')} />} />
      <Row label="Payouts" right={<Toggle value={on.payouts} onValueChange={set('payouts')} />} />
      <Row label="Billing and plan" right={<Toggle value={on.billing} onValueChange={set('billing')} />} last />
    </Section>
    <Section label="REVIEWS AND OFFERS">
      <Row label="New reviews" right={<Toggle value={on.reviews} onValueChange={set('reviews')} />} />
      <Row label="Tips and offers from EdeBooking" right={<Toggle value={on.offers} onValueChange={set('offers')} />} last />
    </Section>
  </Page>;
}

/* ---------- Roles & permissions ---------- */

export function RolesPage({ onBack }: Nav) {
  const rows: [string, boolean, boolean, boolean][] = [
    ['View own bookings', true, true, true], ['Manage all bookings', true, true, false], ['Customer chats', true, true, false],
    ['Edit services & prices', true, false, false], ['View earnings', true, false, false], ['Request payouts', true, false, false],
    ['Manage team', true, false, false], ['Change policies', true, false, false],
  ];
  const mark = (on: boolean) => on ? <Check size={16} color={colors.success} strokeWidth={2.5} /> : <Text variant="caption" color={colors.line}>—</Text>;
  return <Page title="Roles & permissions" onBack={onBack}>
    <Card style={{ padding: 0 }}>
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.goldTint }}>
        <Text variant="overline" style={{ flex: 1 }}>PERMISSION</Text>
        {['Owner', 'Manager', 'Staff'].map(r => <Text key={r} variant="overline" style={{ width: 64, textAlign: 'center' }}>{r.toUpperCase()}</Text>)}
      </View>
      {rows.map(([label, a, b, c], i) => <View key={label} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, minHeight: 44, borderTopWidth: i ? 1 : 0, borderColor: colors.line }}>
        <Text variant="caption" style={{ flex: 1 }}>{label}</Text>
        {[a, b, c].map((on, j) => <View key={j} style={{ width: 64, alignItems: 'center' }}>{mark(on)}</View>)}
      </View>)}
    </Card>
    <Notice icon={TriangleAlert} text="Owners can adjust roles for each person." />
  </Page>;
}

/* ---------- Security ---------- */

export function SecurityPage({ onBack }: Nav) {
  const [twoFactor, setTwoFactor] = useState(true);
  const [face, setFace] = useState(false);
  const [alerts, setAlerts] = useState(true);
  return <Page title="Security" onBack={onBack}>
    <Section label="ACCOUNT">
      <Row label="Change password" sub="Last changed 3 months ago" onPress={() => {}} />
      <Row label="Two-factor authentication" sub="Authenticator app" right={<Toggle value={twoFactor} onValueChange={setTwoFactor} />} />
      <Row label="Face ID login" sub="Use Face ID to open the app" right={<Toggle value={face} onValueChange={setFace} />} />
      <Row label="Login alerts" sub="Email me on new sign-ins" right={<Toggle value={alerts} onValueChange={setAlerts} />} last />
    </Section>
    <Section label="SESSIONS">
      <Row label="Active sessions" value="2 devices" onPress={() => {}} last />
    </Section>
    <Section label="DANGER">
      <Row label="Delete business account" danger onPress={() => {}} last />
    </Section>
    <Notice icon={Shield} text="Customer data is isolated to your business and stays yours if you leave." />
  </Page>;
}

/* ---------- Locked feature (Premium) ---------- */

export function LockedStaffPage({ onBack }: Nav) {
  return <Page title="Staff" onBack={onBack} footer={<Button label="Upgrade to Premium" size="large" icon={Star} style={{ alignSelf: 'stretch' }} onPress={onBack} />}>
    <StateView icon={Lock} title="Manage your team with Premium" body="Add staff, assign bookings to each person and set their schedules." />
    <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
      {['Invite managers and staff', 'Assign bookings to each person', 'Individual schedules and permissions'].map(item => <View key={item} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Check size={16} color={colors.ink900} strokeWidth={2.5} /><Text variant="button">{item}</Text>
      </View>)}
    </Card>
  </Page>;
}

/* ---------- Empty and error states ---------- */

export function EmptyPage({ onBack, title, icon, heading, body, action, onAction, secondary, onSecondary }: Nav & {
  title: string; icon: LucideIcon; heading: string; body: string; action?: string; onAction?: () => void; secondary?: string; onSecondary?: () => void;
}) {
  return <Page title={title} onBack={onBack}>
    <StateView icon={icon} title={heading} body={body}
      primary={action && onAction ? { label: action, onPress: onAction } : undefined}
      secondary={secondary && onSecondary ? { label: secondary, onPress: onSecondary } : undefined} />
  </Page>;
}

export function OfflinePage({ onBack }: Nav) {
  return <Page title="Offline" onBack={onBack}>
    <View style={{ backgroundColor: colors.ink900, borderRadius: radii.input, padding: spacing.md }}><Text variant="caption" color={colors.pearl}>No internet connection</Text></View>
    <StateView icon={WifiOff} title="You're offline" body="You can still view today's bookings. Changes will sync when you reconnect online." primary={{ label: 'Try again', onPress: onBack }} secondary={{ label: 'View saved bookings', onPress: onBack }} />
    <Notice icon={RefreshCw} text="2 changes waiting to sync · Now · Tap to retry" />
  </Page>;
}

export function PayoutFailedPage({ onBack, onAccount }: Nav & { onAccount: () => void }) {
  return <Page title="Payouts" onBack={onBack}>
    <StateView tone="error" icon={TriangleAlert} title="Payout failed" body="Your bank couldn't accept the transfer. The ₦95,000 is safe in your balance."
      primary={{ label: 'Update bank account', onPress: onAccount }} secondary={{ label: 'Try again', onPress: onBack }} />
    <Notice icon={TriangleAlert} tone="error" text="Reason: account name doesn't match." />
  </Page>;
}

export function SubscriptionFailedPage({ onBack }: Nav) {
  return <Page title="Subscription" onBack={onBack}>
    <Notice icon={CreditCard} text="3 days left to update your card." />
    <StateView tone="error" icon={CreditCard} title="Payment didn't go through" body="We couldn't charge your card for Pro. Update it to keep your features."
      primary={{ label: 'Update card', onPress: onBack }} secondary={{ label: 'Contact support', onPress: onBack }} />
  </Page>;
}

export function UploadFailedPage({ onBack }: Nav) {
  return <Page title="Works" onBack={onBack} footer={<Button label="Upload photos" size="large" style={{ alignSelf: 'stretch' }} onPress={onBack} />}>
    <Notice icon={TriangleAlert} tone="error" text="1 photo couldn't upload. File is larger than 10 MB." />
    <Card style={{ padding: spacing.md, flexDirection: 'row', gap: 12 }}>
      <Badge label="Failed" status="Cancelled" small />
      <Text variant="caption" color={colors.muted}>Try a smaller image.</Text>
    </Card>
  </Page>;
}

export function BookingConflictPage({ onBack }: Nav) {
  return <Page title="New booking" onBack={onBack} footer={<Button label="Book anyway (double-book)" variant="outline" style={{ alignSelf: 'stretch' }} onPress={onBack} />}>
    <StateView tone="error" icon={TriangleAlert} title="This time overlaps a booking" body="You already have Chidi N. · Wash & style booked at 11:30 – 12:30 with Tolu."
      primary={{ label: 'Choose another time', onPress: onBack }} />
  </Page>;
}

export function StripeLostPage({ onBack }: Nav) {
  return <Page title="Payout settings" onBack={onBack}>
    <StateView tone="error" icon={Link2} title="Stripe connection lost" body="Customers can't pay you until the connection is restored."
      primary={{ label: 'Reconnect Stripe', onPress: onBack }} secondary={{ label: 'Contact support', onPress: onBack }} />
  </Page>;
}

