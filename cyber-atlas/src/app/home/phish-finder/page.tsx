'use client'

import React, { useMemo, useState } from 'react'
import { create } from 'zustand'
import clsx from 'clsx'

// ------------------------ Types ------------------------
type ReasonKey =
  | 'link_shortener' | 'otp_request' | 'urgent_tone' | 'unknown_sender' | 'typos'
  | 'bank_details' | 'qr_code' | 'suspicious_domain' | 'attachment' | 'too_good'

export type MessageItem = {
  id: string
  sender: string
  subject: string
  body: string
  date: string
  meta?: { channel?: 'sms' | 'email' | 'whatsapp'; locale?: string }
  groundTruth: 'scam' | 'safe'
  explanation: string
  autoSignals?: Partial<Record<ReasonKey, boolean>>
}

// ------------------------ Dataset (50 items) ------------------------
const BASE: MessageItem[] = [
  { id: 'm1', sender: 'IncomeTax Dept <refund@itax-refund.in>', subject: 'Your ₹28,607 refund is ready', body: 'Verify your PAN and bank details. Click http://bit.ly/itax-verify within 30 minutes.', date: '2025-08-10 09:12', meta: { channel: 'sms' }, groundTruth: 'scam', explanation: 'Shortener + urgency + fake domain. IT Dept uses official portal only.', autoSignals: { link_shortener: true, urgent_tone: true, suspicious_domain: true } },
  { id: 'm2', sender: 'Bank Alerts <no-reply@hdfcbank.com>', subject: 'New login from Chrome', body: 'A new sign-in was detected. If this was not you, open NetBanking and change password. No links in this mail.', date: '2025-08-09 21:04', meta: { channel: 'email' }, groundTruth: 'safe', explanation: 'Legit domain, informational, no sensitive request.' },
  { id: 'm3', sender: 'Courier Service <support@speedship.co>', subject: 'Package held: address confirmation needed', body: 'Your package is on hold. Pay ₹49 re-delivery fee at https://speed-ship.co/confirm to release today.', date: '2025-08-08 12:30', meta: { channel: 'sms' }, groundTruth: 'scam', explanation: 'Tiny fee + lookalike domain + urgency.', autoSignals: { urgent_tone: true, suspicious_domain: true } },
  { id: 'm4', sender: 'HR <jobs@company.com>', subject: 'Interview Schedule', body: 'Hi, confirm if 4 PM IST tomorrow works. We will send a Google Meet invite.', date: '2025-08-07 18:22', meta: { channel: 'email' }, groundTruth: 'safe', explanation: 'Normal interview email; no OTP/money/links.' },
  { id: 'm5', sender: 'UPI CARE <notice@upi-help.com>', subject: 'Account Frozen', body: 'Your UPI will be blocked. Submit KYC and card PIN here: http://tinyurl.com/upi-restore', date: '2025-08-07 08:14', meta: { channel: 'sms' }, groundTruth: 'scam', explanation: 'Asks for PIN via shortened link. Genuine UPI never asks for PIN.', autoSignals: { otp_request: true, link_shortener: true, bank_details: true } },
  { id: 'm6', sender: 'Airtel Thanks', subject: 'Bonus 30GB for loyal users', body: 'Claim 30GB free by logging in app. Offer valid 7 days. No payment required.', date: '2025-08-06 11:45', meta: { channel: 'sms' }, groundTruth: 'safe', explanation: 'Telco promo; redeem inside official app.' },
  { id: 'm7', sender: 'PayVendor <pay@reliabill.co>', subject: 'Pending invoice #8821', body: 'Please see attached invoice and remit today.', date: '2025-08-05 10:19', meta: { channel: 'email' }, groundTruth: 'scam', explanation: 'Unknown vendor + unexpected attachment — phishing tactic.', autoSignals: { attachment: true, unknown_sender: true } },
  { id: 'm8', sender: 'College Admin', subject: 'Exam Hall Ticket', body: 'Hall tickets available in the college portal. Use official link only.', date: '2025-08-04 09:05', meta: { channel: 'email' }, groundTruth: 'safe', explanation: 'Legit internal process message.' },
  { id: 'm9', sender: 'Lottery Board', subject: 'Congratulations! You won ₹50,00,000', body: 'Send account details and pay ₹1,999 processing fee to claim.', date: '2025-08-03 16:40', meta: { channel: 'email' }, groundTruth: 'scam', explanation: 'Too-good-to-be-true + fee + bank details request.', autoSignals: { too_good: true, bank_details: true } },
  { id: 'm10', sender: 'PF Portal', subject: 'EPF passbook update', body: 'Your passbook is updated. Login to official epfindia.gov.in to view.', date: '2025-08-02 08:02', meta: { channel: 'email' }, groundTruth: 'safe', explanation: 'Directs to official site (no embedded link here).'},
  { id: 'm11', sender: 'Delivery <updates@delhivery-fast.co>', subject: 'Address needed', body: 'Your parcel stuck. Verify address: https://delhivery-fast.co/verify', date: '2025-08-01 14:12', meta: { channel: 'sms' }, groundTruth: 'scam', explanation: 'Lookalike domain; unsolicited verification.', autoSignals: { suspicious_domain: true } },
  { id: 'm12', sender: 'IT Helpdesk', subject: 'Password expires in 2 days', body: 'Change your password in the official portal. Do not share OTP with anyone.', date: '2025-07-31 10:50', meta: { channel: 'email' }, groundTruth: 'safe', explanation: 'Security reminder without phishing asks.' },
  { id: 'm13', sender: 'WhatsApp Business', subject: 'Account Verification Code', body: 'Your code is 348-221. Do not share this code with anyone.', date: '2025-07-30 07:21', meta: { channel: 'sms' }, groundTruth: 'safe', explanation: 'One-time code sent upon login; message itself is fine.' },
  { id: 'm14', sender: 'IRCTC Alert', subject: 'KYC update required', body: 'Update KYC at http://bit.ly/irctc-kyc to avoid ticket cancellations.', date: '2025-07-29 19:33', meta: { channel: 'sms' }, groundTruth: 'scam', explanation: 'Shortener + threat of cancellation; IRCTC uses official domain.', autoSignals: { link_shortener: true, urgent_tone: true } },
  { id: 'm15', sender: 'Friend', subject: 'Check this out!!', body: 'Hey, see this photo. http://tiny.cc/funnypic', date: '2025-07-29 12:10', meta: { channel: 'whatsapp' }, groundTruth: 'scam', explanation: 'Shortened link with no context is risky.', autoSignals: { link_shortener: true } },
  { id: 'm16', sender: 'Paytm', subject: 'KYC Complete', body: 'Your KYC is verified. You can now use all features.', date: '2025-07-28 17:05', meta: { channel: 'sms' }, groundTruth: 'safe', explanation: 'Typical wallet confirmation.' },
  { id: 'm17', sender: 'SBI Update <security@sb1.co.in>', subject: 'Your account is blocked', body: 'Click to unblock and enter ATM PIN to verify.', date: '2025-07-28 09:45', meta: { channel: 'email' }, groundTruth: 'scam', explanation: 'Lookalike domain + PIN ask.', autoSignals: { bank_details: true, suspicious_domain: true } },
  { id: 'm18', sender: 'Housing Society', subject: 'Maintenance due', body: 'Kind reminder: Please pay maintenance on the official portal or office.', date: '2025-07-27 11:30', meta: { channel: 'email' }, groundTruth: 'safe', explanation: 'Normal payment reminder without links.' },
  { id: 'm19', sender: 'DHL Express <track@dhl-track.help>', subject: 'Customs fee required', body: 'Pay ₹199 to release shipment. QR attached.', date: '2025-07-27 08:00', meta: { channel: 'email' }, groundTruth: 'scam', explanation: 'Lookalike domain + QR pay scam.', autoSignals: { qr_code: true, suspicious_domain: true } },
  { id: 'm20', sender: 'Zomato', subject: 'Order delivered', body: 'Your order #1139 was delivered. Rate your experience in app.', date: '2025-07-26 22:11', meta: { channel: 'email' }, groundTruth: 'safe', explanation: 'Transactional update.' },
]

// expand to 50 by creating plausible variations
const more: MessageItem[] = Array.from({ length: 30 }).map((_, i) => {
  const n = i + 21
  const scam = i % 2 === 0
  const sender = scam
    ? `Support <notify@secure-${n}.help>`
    : `Service Desk <no-reply@service-${n}.com>`
  const subject = scam
    ? `Urgent action needed #${1000 + n}`
    : `Monthly statement ${n}`
  const body = scam
    ? `Your account will be suspended in 24 hours. Verify now: http://bit.ly/verify-${n} and share OTP to continue.`
    : `Your monthly statement is ready in the official portal. Do not share passwords/OTP.`
  const explanation = scam
    ? 'Urgent tone + shortener + OTP ask; classic phish.'
    : 'Benign monthly statement instruction without links.'
  return {
    id: `m${n}`,
    sender,
    subject,
    body,
    date: `2025-07-${(26 - (i % 10)).toString().padStart(2, '0')} ${String(10 + (i % 10)).padStart(2, '0')}:${String(5 * (i % 10)).padStart(2, '0')}`,
    meta: { channel: scam ? 'sms' : 'email' },
    groundTruth: scam ? 'scam' : 'safe',
    explanation,
    autoSignals: scam ? { link_shortener: true, urgent_tone: true, otp_request: true } : {},
  }
})

const MESSAGES: MessageItem[] = [...BASE, ...more] // 50 total

// ------------------------ Rules Engine ------------------------
const REASON_WEIGHTS: Record<ReasonKey, number> = {
  link_shortener: 0.18,
  otp_request: 0.25,
  urgent_tone: 0.2,
  unknown_sender: 0.12,
  typos: 0.08,
  bank_details: 0.22,
  qr_code: 0.1,
  suspicious_domain: 0.22,
  attachment: 0.1,
  too_good: 0.18,
}

function computeRisk(selected: Set<ReasonKey>, autos?: Partial<Record<ReasonKey, boolean>>) {
  let score = 0
  selected.forEach((k) => (score += REASON_WEIGHTS[k] ?? 0))
  if (autos) Object.entries(autos).forEach(([k, v]) => { if (v) score += (REASON_WEIGHTS[k as ReasonKey] ?? 0) * 0.5 })
  return Math.max(0, Math.min(100, Math.round(score * 100)))
}

function evaluateGuess(score: number, playerLabel: 'scam' | 'safe', truth: 'scam' | 'safe') {
  const threshold = 55
  const modelLabel = score >= threshold ? 'scam' : 'safe'
  const correct = playerLabel === truth
  return { correct, modelLabel, threshold }
}

// ------------------------ Store ------------------------
interface GameState {
  list: MessageItem[]
  selectedId?: string
  answers: Record<string, { label: 'scam' | 'safe'; reasons: ReasonKey[]; score: number; correct: boolean }>
  reveal: boolean
  select: (id: string) => void
  answer: (payload: { label: 'scam' | 'safe'; reasons: ReasonKey[] }) => void
  next: () => void
  reset: () => void
}

const useGame = create<GameState>((set, get) => ({
  list: MESSAGES,
  selectedId: MESSAGES[0]?.id,
  answers: {},
  reveal: false,
  select: (id) => set({ selectedId: id, reveal: false }),
  answer: ({ label, reasons }) => {
    const { list, selectedId, answers } = get()
    const msg = list.find((m) => m.id === selectedId)!
    const score = computeRisk(new Set(reasons), msg.autoSignals)
    const { correct } = evaluateGuess(score, label, msg.groundTruth)
    set({ answers: { ...answers, [msg.id]: { label, reasons, score, correct } }, reveal: true })
  },
  next: () => {
    const { list, selectedId } = get()
    const idx = list.findIndex((m) => m.id === selectedId)
    const nxt = list[Math.min(list.length - 1, idx + 1)]
    set({ selectedId: nxt.id, reveal: false })
  },
  reset: () => set({ answers: {}, selectedId: MESSAGES[0]?.id, reveal: false }),
}))

// ------------------------ UI Bits ------------------------
const ALL_REASONS: { key: ReasonKey; label: string }[] = [
  { key: 'link_shortener', label: 'Shortened link' },
  { key: 'otp_request', label: 'Asks for OTP/PIN' },
  { key: 'urgent_tone', label: 'Urgent tone / countdown' },
  { key: 'unknown_sender', label: 'Unknown/spoofed sender' },
  { key: 'typos', label: 'Typos/poor grammar' },
  { key: 'bank_details', label: 'Requests bank details' },
  { key: 'qr_code', label: 'QR pay request' },
  { key: 'suspicious_domain', label: 'Lookalike domain' },
  { key: 'attachment', label: 'Unexpected attachment' },
  { key: 'too_good', label: 'Too good to be true' },
]

function ReasonPills({ value, onToggle }: { value: ReasonKey[]; onToggle: (k: ReasonKey) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_REASONS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onToggle(key)}
          className={clsx(
            'border rounded-full px-3 py-1 text-xs md:text-sm transition',
            value.includes(key)
              ? 'bg-emerald-400 text-gray-900 border-emerald-300'
              : 'bg-white/10 text-white border-cyan-500/30 hover:bg-white/20'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function InboxList() {
  const list = useGame((s) => s.list)
  const selectedId = useGame((s) => s.selectedId)
  const select = useGame((s) => s.select)
  const answers = useGame((s) => s.answers)

  return (
    <div className="h-full overflow-y-auto divide-y divide-cyan-500/10">
      {list.map((m) => {
        const a = answers[m.id]
        return (
          <button
            key={m.id}
            onClick={() => select(m.id)}
            className={clsx(
              'w-full text-left p-4 hover:bg-white/5 transition flex items-start gap-3',
              m.id === selectedId && 'bg-white/10'
            )}
          >
            <div className={clsx('mt-1 h-2 w-2 rounded-full', a ? (a.correct ? 'bg-emerald-400' : 'bg-rose-400') : 'bg-cyan-400')} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium text-white truncate mr-2">{m.subject}</div>
                <div className="text-xs text-cyan-200/70 whitespace-nowrap">{m.date}</div>
              </div>
              <div className="text-xs text-cyan-100/80 truncate">From: {m.sender}</div>
              <div className="text-xs text-cyan-50/70 line-clamp-1">{m.body}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function MessageView() {
  const list = useGame((s) => s.list)
  const selectedId = useGame((s) => s.selectedId)
  const answer = useGame((s) => s.answer)
  const reveal = useGame((s) => s.reveal)
  const answers = useGame((s) => s.answers)

  const item = list.find((m) => m.id === selectedId)!
  const [choices, setChoices] = useState<ReasonKey[]>([])
  const my = answers[item.id]
  const score = useMemo(() => computeRisk(new Set(choices), item.autoSignals), [choices, item.autoSignals])
  const riskLabel = score >= 70 ? 'High risk' : score >= 45 ? 'Medium risk' : 'Low risk'

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-cyan-500/20 p-4">
        <div className="text-sm text-cyan-100/80">From: {item.sender}</div>
        <h2 className="text-xl font-semibold text-white mt-1">{item.subject}</h2>
        <div className="text-xs text-cyan-200/70 mt-1">{item.meta?.channel?.toUpperCase() ?? 'MSG'} · {item.date}</div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="whitespace-pre-wrap leading-relaxed text-cyan-50/90">{item.body}</p>

        <div className="mt-4 space-y-2">
          <div className="text-sm text-cyan-50/90 font-medium">Pick the red flags you notice:</div>
          <ReasonPills
            value={choices}
            onToggle={(k) => setChoices((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))}
          />
        </div>

        <div className="mt-4">
          <div className="text-xs text-cyan-100/80">Risk score</div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-1">
            <div style={{ width: `${score}%` }} className={clsx('h-full', score >= 70 ? 'bg-rose-400' : score >= 45 ? 'bg-amber-300' : 'bg-emerald-400')} />
          </div>
          <div className="text-xs text-cyan-200/80 mt-1">{riskLabel} · {score}/100</div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => answer({ label: 'scam', reasons: choices })}
            disabled={reveal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 text-gray-900 font-semibold shadow"
          >Mark as Scam</button>
          <button
            onClick={() => answer({ label: 'safe', reasons: choices })}
            disabled={reveal}
            className="px-4 py-2 rounded-xl bg-transparent border border-cyan-500/40 text-white hover:bg-white/10"
          >Mark as Safe</button>
        </div>

        {my && (
          <div className={clsx('mt-4 rounded-xl p-4 border', my.correct ? 'border-emerald-300/50 bg-emerald-400/10' : 'border-rose-300/50 bg-rose-400/10')}>
            <div className="font-semibold text-white">
              {my.correct ? 'Correct ✅' : 'Not quite ❌'} — Truth: <span className="uppercase">{item.groundTruth}</span>
            </div>
            <div className="text-sm text-cyan-50/90 mt-1">{item.explanation}</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-cyan-500/20 p-3 flex items-center justify-between">
        <StatsBar />
        <NextButton />
      </div>
    </div>
  )}

function StatsBar() {
  const list = useGame((s) => s.list)
  const answers = useGame((s) => s.answers)
  const done = Object.keys(answers).length
  const correct = Object.values(answers).filter((a) => a.correct).length
  return (
    <div className="text-xs text-cyan-100/80">
      Done: {done}/{list.length} · Correct: {correct}
    </div>
  )
}

function NextButton() {
  const reveal = useGame((s) => s.reveal)
  const next = useGame((s) => s.next)
  return (
    <button onClick={next} disabled={!reveal} className={clsx('px-3 py-2 rounded-lg text-sm font-medium', reveal ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/50 cursor-not-allowed')}>Next</button>
  )
}

function ResultsDrawer() {
  const list = useGame((s) => s.list)
  const answers = useGame((s) => s.answers)
  const reset = useGame((s) => s.reset)
  const done = Object.keys(answers).length === list.length
  if (!done) return null
  const correct = Object.values(answers).filter((a) => a.correct).length
  const pct = Math.round((correct / list.length) * 100)

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] md:w-[780px] bg-black/60 border border-cyan-500/30 backdrop-blur rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="text-white text-lg font-semibold">Results — {pct}% accuracy</div>
        <button onClick={reset} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-green-500 text-gray-900 font-semibold">Play again</button>
      </div>
      <div className="mt-3 max-h-[40vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2">
        {list.map((m) => {
          const a = answers[m.id]
          return (
            <div key={m.id} className={clsx('rounded-lg p-3 border', a?.correct ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-rose-300/40 bg-rose-400/10')}>
              <div className="text-sm text-white font-medium truncate">{m.subject}</div>
              <div className="text-[10px] text-cyan-200/70 truncate">From: {m.sender}</div>
              <div className="text-[11px] text-cyan-100/80 mt-1">Your: {a?.label} · Score: {a?.score}</div>
              <div className="text-[11px] text-cyan-100/80">Reasons: {a?.reasons?.join(', ') || '—'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ------------------------ Page ------------------------
export default function ScamLabEmailAesthetic() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[80vh] md:h-[78vh] grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Inbox panel */}
        <div className="md:col-span-1 rounded-2xl bg-black/50 border border-cyan-500/20 backdrop-blur flex flex-col overflow-hidden shadow-lg">
          <div className="p-4 border-b border-cyan-500/20">
            <h1 className="text-2xl font-bold text-cyan-400">Mailbox Scam Lab</h1>
            <p className="text-xs text-cyan-100/80">Select a message and decide: Scam or Safe.</p>
          </div>
          <InboxList />
        </div>
        {/* Preview panel */}
        <div className="md:col-span-2 rounded-2xl bg-black/50 border border-cyan-500/20 backdrop-blur overflow-hidden shadow-lg">
          <MessageView />
        </div>
      </div>
      <ResultsDrawer />
    </div>
  )
}
