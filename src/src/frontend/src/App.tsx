import {
  Activity,
  AlertTriangle,
  BarChart2,
  Bot,
  CheckCircle,
  Copy,
  CreditCard,
  DollarSign,
  Gift,
  HelpCircle,
  History,
  Home,
  ImageIcon,
  LogOut,
  MessageCircle,
  Pin,
  Plus,
  QrCode,
  Send,
  Shield,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState, useEffect, useRef } from "react";
import LoginScreen, { type UserProfile } from "./components/LoginScreen";

// ─── Types ───────────────────────────────────────────────────────────────────
type ModalType = "usdt" | "activity" | "help" | "chat" | "pin" | null;
type ActiveTab = "home" | "payment" | "tools" | "team" | "my" | "admin";

interface ChatMessage {
  id: number;
  from: "bot" | "user";
  text: string;
}

export interface UpiEntry {
  id: number;
  upiId: string;
  limit: number;
}

interface Order {
  orderId: string;
  amount: number;
  income: number;
  category: "200-400" | "401-600" | "601-1000";
}

interface ProcessingOrder {
  orderId: string;
  amount: number;
  income: number;
  timestamp: string;
  completesAt: number;
  utrNumber?: string;
  screenshotUrl?: string;
  status: "processing" | "completed";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CASHBACK_PCT = 9.8;
const BONUS_AMOUNT = 180;

function genOrderId(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

function genOrders(count: number): Order[] {
  return Array.from({ length: count }, () => {
    const amount =
      Math.random() < 0.6
        ? Math.floor(Math.random() * 201) + 200
        : Math.floor(Math.random() * 601) + 400;
    const category: Order["category"] =
      amount <= 400 ? "200-400" : amount <= 600 ? "401-600" : "601-1000";
    return {
      orderId: genOrderId(),
      amount,
      income: Math.round((amount * CASHBACK_PCT) / 100),
      category,
    };
  });
}

const SUPPORT_EMAIL_POOL = [
  "support1@zpay.in",
  "agent2@zpay.in",
  "help3@zpay.in",
  "care4@zpay.in",
  "assist5@zpay.in",
  "team6@zpay.in",
  "zpay7@support.in",
  "agenthelp8@zpay.in",
  "service9@zpay.in",
  "desk10@zpay.in",
  "support11@zpay.in",
  "agent12@zpay.in",
];
function getRandomEmails(count: number): string[] {
  return [...SUPPORT_EMAIL_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

const STATS = [
  { label: "Today Sell", value: "0", colorClass: "text-zpay-red" },
  { label: "Today Deposits", value: "0", colorClass: "text-zpay-blue" },
  { label: "Total Sell", value: "0", colorClass: "text-zpay-red" },
  { label: "Total Deposits", value: "0", colorClass: "text-zpay-blue" },
];

const DEPOSIT_BOXES = [
  { label: "Deposit 1", amount: "₹0.00", status: "Pending" },
  { label: "Deposit 2", amount: "₹0.00", status: "Pending" },
];

const REFERRAL_LEVELS = [
  {
    level: 1,
    pct: "1%",
    label: "Direct Referral",
    desc: "Earn 1% on every transaction made by your direct referrals.",
  },
  {
    level: 2,
    pct: "0.8%",
    label: "Level 2",
    desc: "Earn 0.8% on transactions made by your Level 2 network.",
  },
  {
    level: 3,
    pct: "0.5%",
    label: "Level 3",
    desc: "Earn 0.5% on transactions made by your Level 3 network.",
  },
];

const USDT_METHODS = [
  {
    icon: "₹",
    name: "UPI",
    desc: "Pay instantly via any UPI app",
    color: "#4CAF50",
  },
];

// ─── Splash Screen ────────────────────────────────────────────────────────────
function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
      style={{ maxWidth: 430, margin: "0 auto" }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 260 }}
        className="flex flex-col items-center gap-4"
      >
        <img
          src="/assets/uploads/image_f9b2be02-1.png"
          alt="ZPay Logo"
          className="w-24 h-24 object-contain"
        />
        <p
          className="text-2xl font-bold tracking-widest"
          style={{ color: "oklch(0.75 0.18 80)" }}
        >
          ZPay
        </p>
      </motion.div>
    </div>
  );
}

// ─── Bonus Popup ──────────────────────────────────────────────────────────────
function BonusPopup({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-5"
      style={{ maxWidth: 430, margin: "0 auto" }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative mx-5 rounded-2xl p-6 text-center w-full"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(251,191,36,0.4)",
          boxShadow:
            "0 0 40px rgba(251,191,36,0.15), 0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <div className="w-16 h-16 rounded-full bg-zpay-green/10 flex items-center justify-center mx-auto mb-4">
          <Gift size={28} className="text-zpay-green" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Bonus Added!</h3>
        <div
          className="text-4xl font-bold mb-2"
          style={{ color: "oklch(0.62 0.18 80)" }}
        >
          +₹{Number(localStorage.getItem("zpay_admin_bonus") || BONUS_AMOUNT)}
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Welcome bonus has been added to your account!
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-sm"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.18 82), oklch(0.68 0.20 68))",
            color: "oklch(0.12 0.02 80)",
          }}
        >
          Claim Bonus
        </button>
      </motion.div>
    </div>
  );
}

// ─── ModalWrapper ─────────────────────────────────────────────────────────────
function ModalWrapper({
  onClose,
  children,
}: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ maxWidth: 430, margin: "0 auto" }}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
      />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full rounded-t-2xl p-5 max-h-[88vh] overflow-y-auto"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function ModalHeader({
  title,
  onClose,
}: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
      >
        <X size={16} className="text-muted-foreground" />
      </button>
    </div>
  );
}

// ─── USDT Modal ───────────────────────────────────────────────────────────────
function UsdtModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrapper onClose={onClose}>
      <div data-ocid="usdt.modal">
        <ModalHeader title="Select Payment Method" onClose={onClose} />
        <div className="space-y-3">
          {USDT_METHODS.map((m) => (
            <div
              key={m.name}
              className="flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border cursor-pointer hover:border-zpay-blue/50 transition-colors"
              data-ocid="usdt.item"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: m.color }}
              >
                {m.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {m.name}
                </p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl bg-secondary border border-border text-foreground font-semibold text-sm"
          data-ocid="usdt.close_button"
        >
          Close
        </button>
      </div>
    </ModalWrapper>
  );
}

// ─── Activity Modal ───────────────────────────────────────────────────────────
function ActivityModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrapper onClose={onClose}>
      <div data-ocid="activity.modal">
        <ModalHeader title="Referral Rewards" onClose={onClose} />
        <p className="text-xs text-muted-foreground mb-4">
          Earn passive rewards from your referral network across 3 levels.
        </p>
        <div className="space-y-3">
          {REFERRAL_LEVELS.map((l) => (
            <div
              key={l.level}
              className="p-4 rounded-xl bg-secondary border border-border flex items-start gap-3"
              data-ocid={`activity.item.${l.level}`}
            >
              <div className="w-10 h-10 rounded-full bg-zpay-blue/10 flex items-center justify-center flex-shrink-0">
                <span className="text-zpay-green font-bold text-base">
                  {l.pct}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Level {l.level} — {l.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl bg-secondary border border-border text-foreground font-semibold text-sm"
          data-ocid="activity.close_button"
        >
          Close
        </button>
      </div>
    </ModalWrapper>
  );
}

// ─── Pin Modal ────────────────────────────────────────────────────────────────
function PinModal({
  onClose,
  userId,
}: { onClose: () => void; userId: string }) {
  return (
    <ModalWrapper onClose={onClose}>
      <div data-ocid="pin.modal">
        <ModalHeader title="Pinned" onClose={onClose} />
        <div className="flex flex-col items-center py-4 gap-3">
          <div className="w-14 h-14 rounded-full bg-zpay-blue/10 flex items-center justify-center">
            <Pin size={24} className="text-zpay-blue" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            User ID: {userId}
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Your ID has been refreshed and pinned successfully.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-zpay-blue text-white font-semibold text-sm"
          data-ocid="pin.close_button"
        >
          OK
        </button>
      </div>
    </ModalWrapper>
  );
}

// ─── Help Modal ───────────────────────────────────────────────────────────────
function HelpModal({ onClose }: { onClose: () => void }) {
  const [emails] = useState(() => getRandomEmails(5));
  const [copied, setCopied] = useState<string | null>(null);
  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email).catch(() => {});
    setCopied(email);
    setTimeout(() => setCopied(null), 2000);
  };
  return (
    <ModalWrapper onClose={onClose}>
      <div data-ocid="help.modal">
        <ModalHeader title="Agent Support" onClose={onClose} />
        <p className="text-xs text-muted-foreground mb-4">
          Contact any of our support agents below:
        </p>
        <div className="space-y-3">
          {emails.map((email, i) => (
            <div
              key={email}
              className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border"
              data-ocid={`help.item.${i + 1}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zpay-blue/10 flex items-center justify-center">
                  <User size={14} className="text-zpay-blue" />
                </div>
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-foreground hover:text-zpay-blue transition-colors"
                >
                  {email}
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(email)}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                data-ocid={`help.button.${i + 1}`}
              >
                {copied === email ? (
                  <CheckCircle size={16} className="text-zpay-green" />
                ) : (
                  <Copy size={16} className="text-muted-foreground" />
                )}
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl bg-secondary border border-border text-foreground font-semibold text-sm"
          data-ocid="help.close_button"
        >
          Close
        </button>
      </div>
    </ModalWrapper>
  );
}

// ─── Chat Modal ───────────────────────────────────────────────────────────────
function ChatModal({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      from: "bot",
      text: "Welcome to ZPay Support! 👋 Please provide your Order ID to continue.",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll-on-message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const isOrderId = (text: string) => /^#?\d{4,}$/.test(text.trim());
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: nextId.current++,
      from: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      const botText = isOrderId(trimmed)
        ? `Thank you! I've received Order ID ${trimmed.startsWith("#") ? trimmed : `#${trimmed}`}. Our agent will contact you shortly. ✅`
        : "Please enter your Order ID (e.g. #12345) so I can assist you.";
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, from: "bot", text: botText },
      ]);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      style={{ maxWidth: 430, margin: "0 auto" }}
      data-ocid="chat.modal"
    >
      <div
        className="flex items-center justify-between px-4 py-4 border-b border-border"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zpay-blue/10 flex items-center justify-center">
            <Bot size={18} className="text-zpay-blue" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              ZPay Support Bot
            </p>
            <p className="text-xs text-zpay-green">● Online</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary"
          data-ocid="chat.close_button"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.from === "bot" && (
              <div className="w-7 h-7 rounded-full bg-zpay-blue/10 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <Bot size={14} className="text-zpay-blue" />
              </div>
            )}
            <div
              className={
                msg.from === "bot" ? "chat-bubble-bot" : "chat-bubble-user"
              }
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div
        className="px-4 py-3 border-t border-border flex items-center gap-2"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <input
          className="flex-1 bg-secondary border border-border rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-zpay-blue transition-colors"
          placeholder="Type your Order ID or message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          data-ocid="chat.input"
        />
        <button
          type="button"
          onClick={handleSend}
          className="w-10 h-10 rounded-full bg-zpay-blue flex items-center justify-center flex-shrink-0"
          data-ocid="chat.submit_button"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}

// ─── Processing Timer ─────────────────────────────────────────────────────────
function ProcessingTimer({ completesAt }: { completesAt: number }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, completesAt - Date.now()),
  );

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => {
      setRemaining(Math.max(0, completesAt - Date.now()));
    }, 1000);
    return () => clearInterval(t);
  }, [completesAt, remaining]);

  if (remaining <= 0) {
    return (
      <span className="text-[10px] font-semibold text-zpay-green">
        Completing...
      </span>
    );
  }

  const totalSecs = Math.floor(remaining / 1000);
  const mins = String(Math.floor(totalSecs / 60)).padStart(2, "0");
  const secs = String(totalSecs % 60).padStart(2, "0");

  return (
    <span className="text-[10px] font-mono font-semibold text-amber-600">
      ⏱ {mins}:{secs}
    </span>
  );
}

// ─── Order History Screen ─────────────────────────────────────────────────────
function OrderHistoryScreen({
  onClose,
  processingOrders,
}: { onClose: () => void; processingOrders: ProcessingOrder[] }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filtered, setFiltered] = useState(false);
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
      style={{ maxWidth: 430, margin: "0 auto" }}
      data-ocid="history.panel"
    >
      <div
        className="flex items-center gap-3 px-4 py-4 border-b border-border"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
          data-ocid="history.close_button"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
        <h2 className="text-base font-bold text-foreground">Order History</h2>
      </div>
      <div
        className="px-4 py-3 border-b border-border"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
          Filter by Date
        </p>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label
              htmlFor="from-date"
              className="text-xs text-muted-foreground mb-1 block"
            >
              From
            </label>
            <input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-zpay-blue transition-colors"
              data-ocid="history.input"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="to-date"
              className="text-xs text-muted-foreground mb-1 block"
            >
              To
            </label>
            <input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-zpay-blue transition-colors"
              data-ocid="history.input"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => setFiltered(true)}
            className="flex-1 py-2 rounded-lg bg-zpay-blue text-white text-sm font-semibold"
            data-ocid="history.primary_button"
          >
            Apply Filter
          </button>
          <button
            type="button"
            onClick={() => {
              setFromDate("");
              setToDate("");
              setFiltered(false);
            }}
            className="px-4 py-2 rounded-lg bg-secondary border border-border text-muted-foreground text-sm font-semibold"
            data-ocid="history.secondary_button"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {processingOrders.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Processing Orders
              </p>
            </div>
            {processingOrders.map((po) => (
              <div
                key={po.orderId}
                className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{
                  background: "rgba(251,191,36,0.08)",
                  border: "1px solid rgba(251,191,36,0.3)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                <div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {po.orderId}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    ₹{po.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-amber-600">
                    +₹{po.income.toLocaleString("en-IN")} cashback
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {po.timestamp}
                  </p>
                  <ProcessingTimer completesAt={po.completesAt} />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold border border-amber-200">
                  Processing
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="history.empty_state"
          >
            <History size={40} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {filtered ? "No orders in this date range" : "No orders yet"}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Claim Page ───────────────────────────────────────────────────────────────
function ClaimPage({
  order,
  onComplete,
  onClose,
}: {
  order: Order;
  onComplete: (po: ProcessingOrder) => void;
  onClose: () => void;
}) {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(true);
  const [utrNumber, setUtrNumber] = useState("");
  const [_screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const UPI_ID =
    localStorage.getItem("zpay_admin_upi") || "pubgopop@freecharge";

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID).catch(() => {});
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCompleteClick = () => {
    if (completed || loading) return;
    setShowPaymentForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setScreenshotFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setScreenshotPreview(url);
    } else {
      setScreenshotPreview(null);
    }
  };

  const handleSubmitPayment = () => {
    if (!utrNumber.trim() || loading) return;
    setLoading(true);
    setTimeout(() => {
      setCompleted(true);
      setLoading(false);
      const cashbackPct = Number(
        localStorage.getItem("zpay_admin_cashback") || CASHBACK_PCT,
      );
      const income = Math.round((order.amount * cashbackPct) / 100);
      onComplete({
        orderId: order.orderId,
        amount: order.amount,
        income,
        timestamp: new Date().toLocaleString("en-IN"),
        completesAt: Date.now() + 5 * 60 * 1000,
        utrNumber: utrNumber.trim(),
        screenshotUrl: screenshotPreview ?? undefined,
        status: "processing",
      });
    }, 500);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
      style={{ maxWidth: 430, margin: "0 auto" }}
      data-ocid="claim.page"
    >
      <div
        className="flex items-center justify-between px-4 py-4 border-b border-border"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
        <h2 className="text-base font-bold text-foreground">
          Complete Payment
        </h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Order ID */}
        <div
          className="rounded-xl p-4 border"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <p className="text-xs text-muted-foreground mb-1">Order ID</p>
          <p className="text-sm font-bold font-mono text-foreground tracking-wider">
            {order.orderId}
          </p>
        </div>

        {/* UPI */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <p className="text-xs text-muted-foreground mb-2">Pay via UPI</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">{UPI_ID}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tap the icon to copy
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-zpay-blue/10"
              data-ocid="claim.copy_upi"
            >
              {copiedUpi ? (
                <CheckCircle size={18} className="text-zpay-green" />
              ) : (
                <Copy size={18} className="text-zpay-blue" />
              )}
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <p className="text-xs text-muted-foreground mb-3">
            Scan QR Code to Pay
          </p>
          <img
            src="/assets/uploads/img_2612-019d2002-0af6-738b-aa60-64b3a013a363-1.jpeg"
            alt="UPI QR Code"
            className="w-48 h-48 mx-auto rounded-xl object-contain"
          />
          <p className="text-xs text-muted-foreground mt-2">
            pubgopop@freecharge
          </p>
        </div>

        {/* Amount */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <p className="text-xs text-muted-foreground mb-1">Payment Amount</p>
          <p className="text-2xl font-bold text-foreground">
            ₹{order.amount.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-zpay-green mt-1">
            Cashback: +₹{order.income.toLocaleString("en-IN")}
          </p>
        </div>

        {/* UTR + Screenshot form (shown after clicking COMPLETE) */}
        <AnimatePresence>
          {showPaymentForm && !completed && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="rounded-2xl p-4 space-y-4"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
              data-ocid="claim.payment_form"
            >
              <p className="text-sm font-bold text-foreground">
                Confirm Payment
              </p>
              {/* UTR Number */}
              <div>
                <label
                  htmlFor="utr-input"
                  className="text-xs font-semibold text-foreground block mb-1.5"
                >
                  Enter UTR Number <span className="text-zpay-red">*</span>
                </label>
                <input
                  id="utr-input"
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 123456789012"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-zpay-blue transition-colors font-mono"
                  data-ocid="claim.utr_input"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Enter the UTR/Reference number from your payment receipt
                </p>
              </div>

              {/* Screenshot */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-1.5">
                  Attach Screenshot{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  data-ocid="claim.upload_button"
                />
                {screenshotPreview ? (
                  <div className="relative">
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot"
                      className="w-full max-h-40 object-cover rounded-xl border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotFile(null);
                        setScreenshotPreview(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow"
                    >
                      <X size={14} className="text-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground hover:border-zpay-blue/40 hover:text-zpay-blue transition-colors"
                    data-ocid="claim.dropzone"
                  >
                    <ImageIcon size={16} />
                    <span className="text-xs font-medium">
                      Tap to attach screenshot
                    </span>
                  </button>
                )}
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmitPayment}
                disabled={!utrNumber.trim() || loading}
                className="w-full py-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50"
                style={{
                  background:
                    !utrNumber.trim() || loading
                      ? "oklch(0.82 0.02 240)"
                      : "linear-gradient(135deg, oklch(0.55 0.20 145), oklch(0.45 0.18 155))",
                  color:
                    !utrNumber.trim() || loading
                      ? "oklch(0.55 0.03 255)"
                      : "white",
                  boxShadow:
                    utrNumber.trim() && !loading
                      ? "0 4px 20px oklch(0.55 0.20 145 / 0.35)"
                      : "none",
                }}
                data-ocid="claim.submit_button"
              >
                {loading ? "Submitting..." : "Submit Payment"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COMPLETE button — shown only before payment form */}
        {!showPaymentForm && (
          <button
            type="button"
            onClick={handleCompleteClick}
            disabled={completed}
            className="w-full py-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50"
            style={{
              background: completed
                ? "oklch(0.45 0.15 145)"
                : "linear-gradient(135deg, oklch(0.55 0.20 145), oklch(0.45 0.18 155))",
              color: "white",
              boxShadow: completed
                ? "none"
                : "0 4px 20px oklch(0.55 0.20 145 / 0.35)",
            }}
            data-ocid="claim.complete_button"
          >
            {completed ? "✓ Submitted" : "COMPLETE"}
          </button>
        )}

        {/* Success state */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full py-4 rounded-xl font-bold text-base text-center"
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
              color: "oklch(0.45 0.18 145)",
            }}
            data-ocid="claim.success_state"
          >
            ✓ Payment Submitted — Under Processing
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Live Ticker (Realistic Surfing) ─────────────────────────────────────────
function LiveTicker() {
  const defaultPhrases = [
    "₹847 order claimed by user",
    "₹623 order processing",
    "₹991 new order matched",
    "₹412 cashback added",
    "₹756 order confirmed",
    "₹534 payment received",
    "₹880 order matched",
    "₹320 bonus credited",
  ];
  const storedTickers = localStorage.getItem("zpay_admin_tickers");
  const phrases = storedTickers
    ? (JSON.parse(storedTickers) as string[])
    : defaultPhrases;
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(t);
  }, [phrases.length]);

  return (
    <div
      className="mx-4 mt-2 flex items-center gap-2 px-3 py-2 rounded-xl overflow-hidden"
      style={{
        background: "rgba(34,197,94,0.06)",
        border: "1px solid rgba(34,197,94,0.2)",
      }}
    >
      <TrendingUp size={12} className="text-zpay-green flex-shrink-0" />
      <motion.p
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-xs text-zpay-green font-medium truncate"
      >
        {phrases[idx]}
      </motion.p>
      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-zpay-green animate-pulse" />
    </div>
  );
}

// ─── Home Tab (Cashback / Orders) ────────────────────────────────────────────
function HomeTab({
  balance,
  onComplete,
  processingOrders,
}: {
  balance: number;
  onComplete: (po: ProcessingOrder) => void;
  processingOrders: ProcessingOrder[];
}) {
  const VISIBLE = 20;
  const [totalCount, setTotalCount] = useState(
    () => Math.floor(Math.random() * 1001) + 3000,
  );
  const [orders, setOrders] = useState<Order[]>(() => genOrders(VISIBLE));
  const [filter, setFilter] = useState<
    "all" | "200-400" | "401-600" | "601-1000"
  >("all");
  const [claimOrder, setClaimOrder] = useState<Order | null>(null);
  const [loadingClaim, setLoadingClaim] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setTotalCount(Math.floor(Math.random() * 1001) + 3000);
      setOrders((prev) => {
        const next = [...prev];
        const replaceCount = Math.floor(Math.random() * 5) + 2;
        for (let i = 0; i < replaceCount; i++) {
          const idx = Math.floor(Math.random() * next.length);
          const amount =
            Math.random() < 0.6
              ? Math.floor(Math.random() * 201) + 200
              : Math.floor(Math.random() * 601) + 400;
          const category: Order["category"] =
            amount <= 400 ? "200-400" : amount <= 600 ? "401-600" : "601-1000";
          next[idx] = {
            orderId: genOrderId(),
            amount,
            income: Math.round((amount * CASHBACK_PCT) / 100),
            category,
          };
        }
        return [...next];
      });
    }, 10000);
    return () => clearInterval(t);
  }, []);

  const cat200 = orders.filter((o) => o.category === "200-400").length;
  const cat401 = orders.filter((o) => o.category === "401-600").length;
  const cat601 = orders.filter((o) => o.category === "601-1000").length;

  const visible =
    filter === "all" ? orders : orders.filter((o) => o.category === filter);

  const filterTabs: { key: typeof filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: totalCount },
    { key: "200-400", label: "200-400", count: cat200 },
    { key: "401-600", label: "401-600", count: cat401 },
    { key: "601-1000", label: "601-1000", count: cat601 },
  ];

  const handleClaimClick = (order: Order) => {
    setLoadingClaim(order.orderId);
    setTimeout(() => {
      setLoadingClaim(null);
      setClaimOrder(order);
    }, 500);
  };

  return (
    <>
      {claimOrder && (
        <AnimatePresence>
          <ClaimPage
            order={claimOrder}
            onComplete={(po) => {
              onComplete(po);
              setClaimOrder(null);
            }}
            onClose={() => setClaimOrder(null)}
          />
        </AnimatePresence>
      )}

      <div className="flex-1 overflow-y-auto pb-24" data-ocid="home.tab">
        {/* Processing Orders Section */}
        {processingOrders.length > 0 && (
          <div className="mx-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Under Processing ({processingOrders.length})
              </p>
            </div>
            <div className="space-y-2">
              {processingOrders.map((po) => (
                <div
                  key={po.orderId}
                  className="rounded-xl px-3 py-3 flex items-center justify-between"
                  style={{
                    background: "rgba(251,191,36,0.08)",
                    border: "1px solid rgba(251,191,36,0.3)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }}
                >
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {po.orderId}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      ₹{po.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-amber-600">
                      +₹{po.income.toLocaleString("en-IN")} pending
                    </p>
                    <ProcessingTimer completesAt={po.completesAt} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold border border-amber-200">
                      Processing
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      {po.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Cashback Card */}
        <div
          className="mx-4 mt-4 rounded-2xl p-4 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.50 0.20 155), oklch(0.38 0.18 165))",
            boxShadow: "0 4px 20px oklch(0.50 0.20 155 / 0.3)",
          }}
        >
          <div className="absolute top-3 right-3 opacity-20">
            <BarChart2 size={52} className="text-white" />
          </div>
          <p className="text-white/80 text-sm font-semibold">Cashback</p>
          <p className="text-white text-4xl font-bold mt-1">{CASHBACK_PCT}%</p>
          <div className="mt-4 flex gap-3">
            <div className="flex-1 rounded-xl p-3 bg-white/10">
              <p className="text-white/60 text-xs uppercase tracking-wider">
                Balance
              </p>
              <p className="text-white font-bold text-base mt-1">
                ₹
                {balance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="rounded-xl p-3 bg-white/10 min-w-[90px]">
              <p className="text-white/60 text-xs uppercase tracking-wider">
                Reward
              </p>
              <p className="text-white font-bold text-base mt-1">₹0</p>
            </div>
          </div>
          <div className="mt-2 rounded-xl p-3 bg-white/10">
            <p className="text-white/70 text-xs uppercase tracking-wider">
              Pending
            </p>
            <p className="text-white font-bold text-base mt-1">₹0</p>
          </div>
        </div>

        {/* Live Ticker */}
        <LiveTicker />

        {/* Notice */}
        <div
          className="mx-4 mt-2 flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{
            background: "rgba(234,179,8,0.06)",
            border: "1px solid rgba(234,179,8,0.2)",
          }}
        >
          <AlertTriangle
            size={14}
            style={{ color: "oklch(0.62 0.18 80)" }}
            className="flex-shrink-0"
          />
          <p className="text-xs" style={{ color: "oklch(0.52 0.15 80)" }}>
            Please use Freecharge or Mobikwik wallet for payment!
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mx-4 mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                filter === tab.key
                  ? "bg-zpay-green text-white border-zpay-green"
                  : "bg-secondary text-muted-foreground border-border"
              }`}
              data-ocid={`home.filter.${tab.key}`}
            >
              {tab.label}({tab.count})
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="mx-4 mt-3 space-y-3 pb-4">
          {visible.map((order, i) => (
            <motion.div
              key={order.orderId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
              data-ocid="home.order_card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">INR</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Amount:{" "}
                    <span className="text-foreground font-semibold">
                      ₹{order.amount.toLocaleString("en-IN")}
                    </span>
                  </p>
                  <p className="text-xs mt-0.5">
                    Income:{" "}
                    <span className="text-zpay-green font-semibold">
                      +₹{order.income.toLocaleString("en-IN")}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary">
                    <span className="text-xs text-muted-foreground">CODE</span>
                    <span className="text-xs font-mono font-bold text-foreground">
                      {order.orderId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClaimClick(order)}
                    disabled={loadingClaim === order.orderId}
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.55 0.20 145), oklch(0.45 0.18 155))",
                      boxShadow: "0 2px 10px oklch(0.55 0.20 145 / 0.3)",
                    }}
                    data-ocid="home.claim_button"
                  >
                    {loadingClaim === order.orderId ? "..." : "CLAIM"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── My Screen ────────────────────────────────────────────────────────────────
function MyScreen({
  sellOn,
  setSellOn,
  openModal,
  onLogout,
  profile,
  balance,
  totalDeposit,
  setActiveTab,
}: {
  sellOn: boolean;
  setSellOn: (v: boolean) => void;
  openModal: (m: ModalType) => void;
  onLogout: () => void;
  profile: UserProfile | null;
  balance: number;
  totalDeposit: number;
  setActiveTab: (t: ActiveTab) => void;
}) {
  const userId = profile?.phone ? `ZP${profile.phone.slice(-6)}` : "2250586";

  const otherIcons = [
    {
      id: "usdt",
      label: "USDT",
      icon: <DollarSign size={20} className="text-yellow-600" />,
      bg: "rgba(234,179,8,0.1)",
      action: () => openModal("usdt"),
    },
    {
      id: "history",
      label: "History",
      icon: <History size={20} className="text-blue-500" />,
      bg: "rgba(59,130,246,0.1)",
      action: () => openModal(null),
    },
    {
      id: "order",
      label: "Order",
      icon: <ShoppingCart size={20} className="text-green-600" />,
      bg: "rgba(34,197,94,0.1)",
      action: () => setActiveTab("home"),
    },
    {
      id: "payment",
      label: "Payment",
      icon: <CreditCard size={20} className="text-purple-500" />,
      bg: "rgba(168,85,247,0.1)",
      action: () => setActiveTab("payment"),
    },
    {
      id: "message",
      label: "Message",
      icon: <MessageCircle size={20} className="text-teal-500" />,
      bg: "rgba(20,184,166,0.1)",
      action: () => openModal("chat"),
    },
    {
      id: "help",
      label: "Help",
      icon: <HelpCircle size={20} className="text-orange-500" />,
      bg: "rgba(249,115,22,0.1)",
      action: () => openModal("help"),
    },
    {
      id: "pin",
      label: "Pin",
      icon: <Pin size={20} className="text-red-500" />,
      bg: "rgba(239,68,68,0.1)",
      action: () => openModal("pin"),
    },
    {
      id: "activity",
      label: "Activity",
      icon: <Activity size={20} className="text-pink-500" />,
      bg: "rgba(236,72,153,0.1)",
      action: () => openModal("activity"),
    },
  ];

  return (
    <>
      <div className="px-4 pt-10 pb-2">
        <h1 className="text-xl font-bold text-foreground">My</h1>
      </div>

      {/* User Card */}
      <div
        className="mx-4 mt-3 p-4 rounded-2xl relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.40 0.18 255), oklch(0.28 0.16 265))",
          boxShadow: "0 4px 20px oklch(0.40 0.18 255 / 0.3)",
        }}
      >
        <div className="absolute top-3 right-3 opacity-30">
          <BarChart2 size={28} className="text-white" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base">
              {profile?.name || "User"}
            </p>
            <p className="text-white/60 text-xs">{profile?.phone || ""}</p>
          </div>
        </div>
        <p className="text-white text-2xl font-bold">
          ₹
          {balance.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-white/70 text-xs mt-1">
          Total Deposit: ₹{totalDeposit.toLocaleString("en-IN")}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-white/60 text-xs">User ID:</span>
          <span className="text-white/90 text-xs font-mono">{userId}</span>
        </div>
        {profile?.referral && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-white/60 text-xs">Ref:</span>
            <span className="text-white/90 text-xs font-mono">
              {profile.referral}
            </span>
          </div>
        )}
      </div>

      {/* Sell Toggle */}
      <div
        className="mx-4 mt-3 p-4 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground font-bold text-base">Sell</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              {sellOn ? "ON" : "OFF"}
            </p>
          </div>
          <label className="sell-toggle" data-ocid="sell.toggle">
            <input
              type="checkbox"
              checked={sellOn}
              onChange={(e) => setSellOn(e.target.checked)}
            />
            <span className="sell-toggle-slider" />
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-4 mt-3 grid grid-cols-2 gap-3">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className="p-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            data-ocid={`stats.item.${i + 1}`}
          >
            <p className="text-muted-foreground text-xs mb-1">{stat.label}</p>
            <p className={`text-lg font-bold ${stat.colorClass}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Sell Deposit Boxes */}
      <div className="mx-4 mt-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
          Sell Deposits
        </p>
        <div className="grid grid-cols-2 gap-3">
          {DEPOSIT_BOXES.map((d, i) => (
            <div
              key={d.label}
              className="p-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              data-ocid={`deposit.item.${i + 1}`}
            >
              <p className="text-xs text-muted-foreground">{d.label}</p>
              <p className="text-base font-bold text-foreground mt-1">
                {d.amount}
              </p>
              <span className="text-xs text-zpay-red mt-1 block">
                {d.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Other */}
      <div className="mx-4 mt-5">
        <p className="text-sm font-bold text-foreground mb-3">Other</p>
        <div className="grid grid-cols-4 gap-3">
          {otherIcons.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className="flex flex-col items-center gap-1.5"
              data-ocid={`other.${item.id}.button`}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: item.bg,
                  border: "1px solid rgba(0,0,0,0.06)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                {item.icon}
              </div>
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="mx-4 mt-6 mb-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3.5 rounded-xl bg-secondary border border-border text-muted-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:border-zpay-red/40 hover:text-zpay-red transition-colors"
          data-ocid="logout.button"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>

      <div className="text-center pb-2">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with ❤ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-zpay-blue hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </>
  );
}

// ─── Team Screen ──────────────────────────────────────────────────────────────
function TeamScreen() {
  return (
    <div className="flex-1 overflow-y-auto pb-24" data-ocid="team.panel">
      <div className="px-4 pt-10 pb-2">
        <h1 className="text-xl font-bold text-foreground">My Team</h1>
      </div>
      <div
        className="mx-4 mt-3 p-4 rounded-2xl flex items-center gap-3"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div className="w-10 h-10 rounded-full bg-zpay-blue/10 flex items-center justify-center">
          <Users size={20} className="text-zpay-blue" />
        </div>
        <div>
          <p className="text-foreground font-bold text-base">0 Members</p>
          <p className="text-muted-foreground text-xs">Your referral network</p>
        </div>
      </div>
      <div
        className="mx-4 mt-4 p-6 rounded-2xl flex flex-col items-center gap-3 text-center"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
        data-ocid="team.empty_state"
      >
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <Users size={28} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          No team available yet
        </p>
        <p className="text-xs text-muted-foreground">
          Invite friends to grow your team and start earning referral rewards.
        </p>
      </div>
    </div>
  );
}

// ─── Tools Screen ─────────────────────────────────────────────────────────────
function ToolsScreen({
  upiList,
  setUpiList,
}: {
  upiList: UpiEntry[];
  setUpiList: React.Dispatch<React.SetStateAction<UpiEntry[]>>;
}) {
  const [upiInput, setUpiInput] = useState("");
  const nextUpiId = useRef(upiList.length + 1);

  const handleAddUpi = () => {
    const trimmed = upiInput.trim();
    if (!trimmed) return;
    setUpiList((prev) => [
      ...prev,
      { id: nextUpiId.current++, upiId: trimmed, limit: 10000 },
    ]);
    setUpiInput("");
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24" data-ocid="tools.panel">
      <div className="px-4 pt-10 pb-2 flex items-center gap-2">
        <Wrench size={20} className="text-zpay-blue" />
        <h1 className="text-xl font-bold text-foreground">Tools</h1>
      </div>
      <div
        className="mx-4 mt-3 p-4 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <p className="text-sm font-bold text-foreground mb-3">Bind UPI ID</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={upiInput}
            onChange={(e) => setUpiInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddUpi()}
            placeholder="Enter UPI ID (e.g. name@upi)"
            className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-zpay-blue transition-colors"
            data-ocid="tools.input"
          />
          <button
            type="button"
            onClick={handleAddUpi}
            className="px-3 py-2.5 rounded-lg bg-zpay-blue text-white flex items-center gap-1.5 text-sm font-semibold flex-shrink-0"
            data-ocid="tools.primary_button"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>
      {upiList.length > 0 && (
        <div className="mx-4 mt-3 space-y-3">
          {upiList.map((entry, i) => (
            <div
              key={entry.id}
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
              data-ocid={`tools.item.${i + 1}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
                    style={{ boxShadow: "0 0 6px 2px rgba(239, 68, 68, 0.7)" }}
                  />
                  <span className="text-xs text-red-500 font-semibold">
                    Enabled
                  </span>
                  <span className="text-sm text-foreground font-medium ml-1">
                    {entry.upiId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setUpiList((prev) => prev.filter((u) => u.id !== entry.id))
                  }
                  className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-zpay-red/10 transition-colors"
                  data-ocid={`tools.delete_button.${i + 1}`}
                >
                  <Trash2 size={14} className="text-muted-foreground" />
                </button>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-muted-foreground">
                    Per UPI Limit
                  </span>
                  <span className="text-xs font-semibold text-zpay-blue">
                    ₹{entry.limit.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={100000}
                  value={entry.limit}
                  onChange={(e) =>
                    setUpiList((prev) =>
                      prev.map((u) =>
                        u.id === entry.id
                          ? { ...u, limit: Number(e.target.value) }
                          : u,
                      ),
                    )
                  }
                  className="w-full accent-zpay-blue"
                  data-ocid={`tools.slider.${i + 1}`}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">₹100</span>
                  <span className="text-xs text-muted-foreground">
                    ₹1,00,000
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Payment Tab ──────────────────────────────────────────────────────────────
function PaymentTab({
  sellOn,
  setSellOn,
  balance,
  upiList,
  completedOrders,
  processingOrders,
  isAdmin,
  phone,
}: {
  sellOn: boolean;
  setSellOn: (v: boolean) => void;
  balance: number;
  upiList: UpiEntry[];
  completedOrders: ProcessingOrder[];
  processingOrders: ProcessingOrder[];
  isAdmin: boolean;
  phone: string;
}) {
  const [upiSending, setUpiSending] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`zpay_upi_sending_${phone}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [sellMessage, setSellMessage] = useState<"success" | "low" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const handleToggle = (checked: boolean) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (checked) {
        if (balance >= 200) {
          setSellOn(true);
          setSellMessage("success");
        } else {
          setSellMessage("low");
        }
      } else {
        setSellOn(false);
        setSellMessage(null);
      }
    }, 500);
  };

  const boundUpi = upiList[0]?.upiId || null;

  const [_tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto pb-24" data-ocid="payment.tab">
      <div className="px-4 pt-10 pb-2">
        <h1 className="text-xl font-bold text-foreground">Payment</h1>
      </div>

      {/* Bound UPI Display */}
      {boundUpi ? (
        <div
          className="mx-4 mt-3 p-4 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
            Bound UPI ID
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zpay-green/10 flex items-center justify-center">
              <span className="text-zpay-green font-bold text-base">₹</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{boundUpi}</p>
              <p className="text-xs text-muted-foreground">Active UPI</p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="mx-4 mt-3 p-4 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <p className="text-xs text-muted-foreground">
            No UPI ID bound. Go to Tools tab to add one.
          </p>
        </div>
      )}

      {/* Big Sell Switch */}
      <div
        className="mx-4 mt-4 p-6 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <p className="text-sm font-bold text-foreground mb-1">Selling Status</p>
        <p className="text-xs text-muted-foreground mb-6">
          Toggle to start or stop selling
        </p>

        <div className="flex flex-col items-center gap-5">
          {/* Big Switch */}
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={() => !loading && handleToggle(!sellOn)}
              disabled={loading}
              className="relative w-36 h-20 rounded-full transition-all duration-500 focus:outline-none"
              style={{
                background: sellOn
                  ? "linear-gradient(135deg, oklch(0.50 0.20 145), oklch(0.40 0.18 155))"
                  : "linear-gradient(135deg, oklch(0.45 0.20 25), oklch(0.35 0.18 30))",
                boxShadow: sellOn
                  ? "0 0 30px oklch(0.55 0.20 145 / 0.5), 0 4px 20px oklch(0 0 0 / 0.15)"
                  : "0 0 30px oklch(0.50 0.20 25 / 0.4), 0 4px 20px oklch(0 0 0 / 0.15)",
              }}
              data-ocid="payment.sell_switch"
            >
              <motion.div
                animate={{ x: sellOn ? 56 : 4 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="absolute top-3 w-14 h-14 rounded-full bg-white flex items-center justify-center"
                style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                ) : (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      background: sellOn
                        ? "oklch(0.50 0.20 145)"
                        : "oklch(0.50 0.20 25)",
                    }}
                  />
                )}
              </motion.div>
              <span
                className="absolute text-xs font-bold text-white/90"
                style={{
                  left: sellOn ? "12px" : "auto",
                  right: sellOn ? "auto" : "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                {sellOn ? "ON" : "OFF"}
              </span>
            </button>
          </div>

          {/* Status Label */}
          <div className="text-center">
            <p
              className="text-lg font-bold"
              style={{
                color: sellOn ? "oklch(0.45 0.20 145)" : "oklch(0.45 0.20 25)",
              }}
            >
              {sellOn ? "Start Selling" : "Stop Selling"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {sellOn ? "Selling is active" : "Selling is paused"}
            </p>
          </div>

          {/* Feedback Messages */}
          <AnimatePresence>
            {sellMessage === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex items-center gap-3 p-4 rounded-xl"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.25)",
                }}
              >
                <CheckCircle
                  size={20}
                  className="text-zpay-green flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-zpay-green">
                    Start Selling Successful!
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your UPI is now active for receiving payments.
                  </p>
                </div>
              </motion.div>
            )}
            {sellMessage === "low" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex items-center gap-3 p-4 rounded-xl"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
                data-ocid="payment.error_state"
              >
                <AlertTriangle
                  size={20}
                  className="text-zpay-red flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-zpay-red">
                    Minimum 200 required
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add funds to your balance to start selling.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active Selling Orders */}
      {processingOrders.filter((o) => o.status === "processing").length > 0 && (
        <div className="mx-4 mt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
            Active Selling Orders
          </p>
          <div className="space-y-2">
            {processingOrders
              .filter(
                (o) => o.status === "processing" && Date.now() < o.completesAt,
              )
              .map((o, i) => {
                const secsLeft = Math.max(
                  0,
                  Math.floor((o.completesAt - Date.now()) / 1000),
                );
                const mm = Math.floor(secsLeft / 60);
                const ss = secsLeft % 60;
                return (
                  <div
                    key={o.orderId}
                    className="p-3 rounded-2xl flex items-center justify-between"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                    }}
                    data-ocid={`payment.selling.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: "rgba(245,158,11,0.15)",
                          color: "oklch(0.55 0.18 70)",
                        }}
                      >
                        Selling
                      </span>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          #{o.orderId}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          ₹{o.amount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <p
                      className="text-xs font-mono font-bold"
                      style={{ color: "oklch(0.55 0.18 70)" }}
                    >
                      {mm}:{ss.toString().padStart(2, "0")}
                    </p>
                  </div>
                );
              })}
            {upiList.length > 0 &&
              processingOrders
                .filter(
                  (o) =>
                    o.status === "processing" && Date.now() >= o.completesAt,
                )
                .map((o, i) => (
                  <div
                    key={o.orderId}
                    className="p-3 rounded-2xl flex items-center justify-between"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                    }}
                    data-ocid={`payment.selling_upi.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: "rgba(99,102,241,0.12)",
                          color: "oklch(0.45 0.18 265)",
                        }}
                      >
                        Selling in Progress to UPI
                      </span>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          #{o.orderId}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          ₹{o.amount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {upiList[0].upiId}
                    </p>
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* Order Complete */}
      {completedOrders.length > 0 && (
        <div className="mx-4 mt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
            Order Complete
          </p>
          <div className="space-y-2">
            {completedOrders.slice(0, 5).map((o, i) => (
              <div
                key={o.orderId}
                className="p-3 rounded-xl flex items-center justify-between"
                style={{
                  background: "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.18)",
                }}
                data-ocid={`payment.complete.${i + 1}`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle
                    size={16}
                    className="text-zpay-green flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Order #{o.orderId}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {o.timestamp}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-zpay-green">
                    +₹{(o.amount + o.income).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    ₹{o.amount} + {o.income} bonus
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sell Deposits */}
      <div className="mx-4 mt-4 pb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
          Sell Deposits
        </p>
        {completedOrders.length === 0 ? (
          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
            data-ocid="payment.empty_state"
          >
            <p className="text-sm text-muted-foreground">
              No completed deposits yet
            </p>
          </div>
        ) : (
          <div className="space-y-3" data-ocid="payment.list">
            {completedOrders.map((o, i) => (
              <div
                key={o.orderId}
                className="p-3 rounded-xl flex items-center justify-between"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                data-ocid={`payment.item.${i + 1}`}
              >
                <div>
                  <p className="text-xs font-mono text-muted-foreground">
                    {o.orderId}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    ₹{o.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-zpay-green">
                    +₹{o.income.toLocaleString("en-IN")} cashback
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {o.timestamp}
                  </p>
                </div>
                {upiSending.has(o.orderId) ? (
                  isAdmin ? (
                    <div className="flex flex-col items-center gap-1">
                      <svg
                        role="img"
                        aria-label="Success"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-[9px] text-green-600 font-bold text-center">
                        Sell Successful!
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <svg
                        role="img"
                        aria-label="Loading"
                        className="animate-spin h-4 w-4 text-green-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span className="text-[9px] text-green-600 font-semibold text-center">
                        Selling to UPI
                        <br />
                        started...
                      </span>
                    </div>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setUpiSending((prev) => {
                        const next = new Set([...prev, o.orderId]);
                        try {
                          localStorage.setItem(
                            `zpay_upi_sending_${phone}`,
                            JSON.stringify([...next]),
                          );
                        } catch {}
                        return next;
                      })
                    }
                    className="text-[10px] px-2 py-1 rounded-full bg-green-500 text-white font-semibold border border-green-600 hover:bg-green-600 transition-colors"
                  >
                    Send Money to UPI
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Tab ────────────────────────────────────────────────────────────────
function AdminTab({ onLogout }: { onLogout: () => void }) {
  const [users, setUsers] = useState<
    { phone: string; name: string; balance: number }[]
  >([]);
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [processingAll, setProcessingAll] = useState<
    { phone: string; orders: ProcessingOrder[] }[]
  >([]);

  const loadProcessingOrders = () => {
    const result: { phone: string; orders: ProcessingOrder[] }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("zpay_processing_")) {
        const phone = key.replace("zpay_processing_", "");
        try {
          const orders: ProcessingOrder[] = JSON.parse(
            localStorage.getItem(key) || "[]",
          );
          const active = orders.filter((o) => o.status === "processing");
          if (active.length > 0) result.push({ phone, orders: active });
        } catch {
          /* skip */
        }
      }
    }
    setProcessingAll(result);
  };

  const handleInstantComplete = (phone: string, orderId: string) => {
    const procKey = `zpay_processing_${phone}`;
    const compKey = `zpay_completed_${phone}`;
    const balKey = `zpay_balance_${phone}`;
    const depKey = `zpay_totaldeposit_${phone}`;

    const procOrders: ProcessingOrder[] = JSON.parse(
      localStorage.getItem(procKey) || "[]",
    );
    const order = procOrders.find((o) => o.orderId === orderId);
    if (!order) return;

    // Update balance: amount + income
    const currentBal = Number(localStorage.getItem(balKey) || 0);
    const newBal = currentBal + order.amount + order.income;
    localStorage.setItem(balKey, String(newBal));

    // Update total deposit
    const currentDep = Number(localStorage.getItem(depKey) || 0);
    localStorage.setItem(depKey, String(currentDep + order.amount));

    // Move to completed
    const completedOrder = { ...order, status: "completed" as const };
    const compOrders: ProcessingOrder[] = JSON.parse(
      localStorage.getItem(compKey) || "[]",
    );
    localStorage.setItem(
      compKey,
      JSON.stringify([completedOrder, ...compOrders]),
    );

    // Remove from processing
    const remaining = procOrders.filter((o) => o.orderId !== orderId);
    localStorage.setItem(procKey, JSON.stringify(remaining));

    // Update user list balance
    setUsers((prev) =>
      prev.map((u) => (u.phone === phone ? { ...u, balance: newBal } : u)),
    );
    loadProcessingOrders();
  };

  // App settings
  const [upiSetting, setUpiSetting] = useState(
    () => localStorage.getItem("zpay_admin_upi") || "pubgopop@freecharge",
  );
  const [cashbackSetting, setCashbackSetting] = useState(
    () => localStorage.getItem("zpay_admin_cashback") || "9.8",
  );
  const [bonusSetting, setBonusSetting] = useState(
    () => localStorage.getItem("zpay_admin_bonus") || "180",
  );
  const [tickersSetting, setTickersSetting] = useState(() => {
    const stored = localStorage.getItem("zpay_admin_tickers");
    return (
      stored ||
      JSON.stringify([
        "₹847 order claimed by user",
        "₹623 order processing",
        "₹412 cashback added",
      ])
    );
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    const loadedUsers: { phone: string; name: string; balance: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("zpay_user_")) {
        const phone = key.replace("zpay_user_", "");
        if (phone === "admin") continue;
        try {
          const profile = JSON.parse(localStorage.getItem(key) || "{}");
          const bal = Number(
            localStorage.getItem(`zpay_balance_${phone}`) || 0,
          );
          loadedUsers.push({
            phone,
            name: profile.name || phone,
            balance: bal,
          });
        } catch {
          /* skip */
        }
      }
    }
    setUsers(loadedUsers);
    // inline load processing orders
    const procResult2: { phone: string; orders: ProcessingOrder[] }[] = [];
    for (let j = 0; j < localStorage.length; j++) {
      const pkey = localStorage.key(j);
      if (pkey?.startsWith("zpay_processing_")) {
        const pphone = pkey.replace("zpay_processing_", "");
        try {
          const porders: ProcessingOrder[] = JSON.parse(
            localStorage.getItem(pkey) || "[]",
          );
          const active = porders.filter((o) => o.status === "processing");
          if (active.length > 0)
            procResult2.push({ phone: pphone, orders: active });
        } catch {
          /* skip */
        }
      }
    }
    setProcessingAll(procResult2);
  }, []);

  const handleSaveBalance = (phone: string) => {
    const newBal = Number(editBalance);
    if (Number.isNaN(newBal)) return;
    localStorage.setItem(`zpay_balance_${phone}`, String(newBal));
    setUsers((prev) =>
      prev.map((u) => (u.phone === phone ? { ...u, balance: newBal } : u)),
    );
    setEditingPhone(null);
    setEditBalance("");
  };

  const handleClearOrders = (phone: string) => {
    localStorage.removeItem(`zpay_processing_${phone}`);
    localStorage.removeItem(`zpay_completed_${phone}`);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("zpay_admin_upi", upiSetting);
    localStorage.setItem("zpay_admin_cashback", cashbackSetting);
    localStorage.setItem("zpay_admin_bonus", bonusSetting);
    try {
      JSON.parse(tickersSetting);
      localStorage.setItem("zpay_admin_tickers", tickersSetting);
    } catch {
      /* invalid JSON, skip */
    }
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const goldBorder = { border: "1px solid oklch(0.62 0.18 80 / 0.3)" };
  const cardStyle = {
    background: "rgba(255,255,255,0.9)",
    ...goldBorder,
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24" data-ocid="admin.tab">
      <div
        className="px-4 pt-10 pb-4 flex items-center gap-3"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.62 0.18 80 / 0.08), transparent)",
          borderBottom: "1px solid oklch(0.62 0.18 80 / 0.15)",
        }}
      >
        <Shield size={22} style={{ color: "oklch(0.62 0.18 80)" }} />
        <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
      </div>

      {/* User Management */}
      <div className="mx-4 mt-4">
        <p
          className="text-xs uppercase tracking-wider font-bold mb-3"
          style={{ color: "oklch(0.62 0.18 80)" }}
        >
          User Management
        </p>
        {users.length === 0 ? (
          <div
            className="p-4 rounded-2xl text-center"
            style={cardStyle}
            data-ocid="admin.empty_state"
          >
            <p className="text-sm text-muted-foreground">
              No registered users found
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u, i) => (
              <div
                key={u.phone}
                className="p-4 rounded-2xl"
                style={cardStyle}
                data-ocid={`admin.item.${i + 1}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {u.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.phone}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-bold"
                      style={{ color: "oklch(0.62 0.18 80)" }}
                    >
                      ₹{u.balance.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Balance</p>
                  </div>
                </div>

                {editingPhone === u.phone ? (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      placeholder="New balance"
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-secondary text-sm outline-none"
                      data-ocid="admin.input"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveBalance(u.phone)}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-white"
                      style={{ background: "oklch(0.62 0.18 80)" }}
                      data-ocid="admin.save_button"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPhone(null)}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-secondary border border-border text-muted-foreground"
                      data-ocid="admin.cancel_button"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPhone(u.phone);
                        setEditBalance(String(u.balance));
                      }}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold border"
                      style={{
                        borderColor: "oklch(0.62 0.18 80 / 0.4)",
                        color: "oklch(0.62 0.18 80)",
                      }}
                      data-ocid="admin.edit_button"
                    >
                      Edit Balance
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearOrders(u.phone)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-50 border border-red-200 text-red-600"
                      data-ocid="admin.delete_button"
                    >
                      Clear Orders
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App Settings */}
      <div className="mx-4 mt-6">
        <p
          className="text-xs uppercase tracking-wider font-bold mb-3"
          style={{ color: "oklch(0.62 0.18 80)" }}
        >
          App Settings
        </p>
        <div className="p-4 rounded-2xl space-y-4" style={cardStyle}>
          <div>
            <label
              htmlFor="admin-upi"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              UPI ID
            </label>
            <input
              id="admin-upi"
              type="text"
              value={upiSetting}
              onChange={(e) => setUpiSetting(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-secondary text-sm outline-none focus:border-yellow-400 transition-colors"
              data-ocid="admin.input"
            />
          </div>
          <div>
            <label
              htmlFor="admin-cashback"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Cashback % (default 9)
            </label>
            <input
              id="admin-cashback"
              type="number"
              value={cashbackSetting}
              onChange={(e) => setCashbackSetting(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-secondary text-sm outline-none focus:border-yellow-400 transition-colors"
              data-ocid="admin.input"
            />
          </div>
          <div>
            <label
              htmlFor="admin-bonus"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Sign-up Bonus ₹ (default 180)
            </label>
            <input
              id="admin-bonus"
              type="number"
              value={bonusSetting}
              onChange={(e) => setBonusSetting(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-secondary text-sm outline-none focus:border-yellow-400 transition-colors"
              data-ocid="admin.input"
            />
          </div>
          <div>
            <label
              htmlFor="admin-tickers"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Live Ticker Messages (JSON array)
            </label>
            <textarea
              id="admin-tickers"
              value={tickersSetting}
              onChange={(e) => setTickersSetting(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-secondary text-sm outline-none focus:border-yellow-400 transition-colors font-mono resize-none"
              data-ocid="admin.textarea"
            />
          </div>
          <button
            type="button"
            onClick={handleSaveSettings}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.18 82), oklch(0.68 0.20 68))",
            }}
            data-ocid="admin.submit_button"
          >
            {settingsSaved ? "✓ Saved!" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Order Management */}
      <div className="mx-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-xs uppercase tracking-wider font-bold"
            style={{ color: "oklch(0.62 0.18 80)" }}
          >
            Processing Orders
          </p>
          <button
            type="button"
            onClick={loadProcessingOrders}
            className="text-xs px-3 py-1 rounded-lg border font-semibold"
            style={{
              borderColor: "oklch(0.62 0.18 80 / 0.4)",
              color: "oklch(0.62 0.18 80)",
            }}
          >
            Refresh
          </button>
        </div>
        {processingAll.length === 0 ? (
          <div
            className="p-4 rounded-2xl text-center"
            style={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: 16,
            }}
          >
            <p className="text-sm text-muted-foreground">
              No processing orders
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {processingAll.map(({ phone, orders }) =>
              orders.map((order, i) => (
                <div
                  key={`${order.orderId}-${phone}`}
                  className="p-4 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: 16,
                  }}
                  data-ocid={`admin.order.${i + 1}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        #{order.orderId}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {phone}
                      </p>
                    </div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "oklch(0.62 0.18 80)" }}
                    >
                      ₹{order.amount} + ₹{order.income}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInstantComplete(phone, order.orderId)}
                    className="w-full py-2 rounded-xl text-xs font-bold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.50 0.20 145), oklch(0.45 0.18 145))",
                    }}
                    data-ocid="admin.complete_order_button"
                  >
                    Complete Instantly
                  </button>
                </div>
              )),
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="mx-4 mt-6 mb-6">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3 rounded-xl bg-secondary border border-border text-muted-foreground font-semibold text-sm flex items-center justify-center gap-2"
          data-ocid="logout.button"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const MAINTENANCE_UNTIL = new Date("2020-01-01T00:00:00Z").getTime();
  const [maintenanceNow, setMaintenanceNow] = React.useState(Date.now());
  React.useEffect(() => {
    const mt = setInterval(() => setMaintenanceNow(Date.now()), 1000);
    return () => clearInterval(mt);
  }, []);

  const [splash, setSplash] = useState(true);
  const [showBonus, setShowBonus] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<string | null>(() =>
    localStorage.getItem("zpay_auth"),
  );
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const phone = localStorage.getItem("zpay_auth");
    if (!phone) return null;
    const stored = localStorage.getItem(`zpay_user_${phone}`);
    return stored ? JSON.parse(stored) : null;
  });
  const [balance, setBalance] = useState<number>(() => {
    const phone = localStorage.getItem("zpay_auth");
    if (!phone) return 0;
    const stored = localStorage.getItem(`zpay_balance_${phone}`);
    return stored ? Number(stored) : 0;
  });
  const [sellOn, setSellOn] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [upiList, setUpiList] = useState<UpiEntry[]>([]);
  const [processingOrders, setProcessingOrders] = useState<ProcessingOrder[]>(
    () => {
      const phone = localStorage.getItem("zpay_auth");
      if (!phone) return [];
      const stored = localStorage.getItem(`zpay_processing_${phone}`);
      return stored ? JSON.parse(stored) : [];
    },
  );
  const [completedOrders, setCompletedOrders] = useState<ProcessingOrder[]>(
    () => {
      const phone = localStorage.getItem("zpay_auth");
      if (!phone) return [];
      const stored = localStorage.getItem(`zpay_completed_${phone}`);
      return stored ? JSON.parse(stored) : [];
    },
  );
  const [totalDeposit, setTotalDeposit] = useState<number>(() => {
    const phone = localStorage.getItem("zpay_auth");
    if (!phone) return 0;
    const stored = localStorage.getItem(`zpay_totaldeposit_${phone}`);
    return stored ? Number(stored) : 0;
  });
  const [tabLoading, setTabLoading] = useState(false);

  // Splash screen for 0.5 seconds
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 500);
    return () => clearTimeout(t);
  }, []);

  // Auto-complete orders after 30 minutes
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setProcessingOrders((prev) => {
        const toComplete = prev.filter(
          (o) => o.status === "processing" && o.completesAt <= now,
        );
        if (toComplete.length === 0) return prev;
        const totalIncome = toComplete.reduce((sum, o) => sum + o.income, 0);
        const totalAmount = toComplete.reduce((sum, o) => sum + o.amount, 0);
        setBalance((b) => {
          const newBalance = b + totalAmount + totalIncome;
          if (userProfile?.phone) {
            localStorage.setItem(
              `zpay_balance_${userProfile.phone}`,
              String(newBalance),
            );
          }
          return newBalance;
        });
        setTotalDeposit((td) => {
          const newTotalDeposit = td + totalAmount;
          if (userProfile?.phone) {
            localStorage.setItem(
              `zpay_totaldeposit_${userProfile.phone}`,
              String(newTotalDeposit),
            );
          }
          return newTotalDeposit;
        });
        const completedItems = toComplete.map((o) => ({
          ...o,
          status: "completed" as const,
        }));
        setCompletedOrders((prev2) => {
          const updated = [...completedItems, ...prev2];
          if (userProfile?.phone) {
            localStorage.setItem(
              `zpay_completed_${userProfile.phone}`,
              JSON.stringify(updated),
            );
          }
          return updated;
        });
        const remaining = prev.filter(
          (o) => !(o.status === "processing" && o.completesAt <= now),
        );
        if (userProfile?.phone) {
          localStorage.setItem(
            `zpay_processing_${userProfile.phone}`,
            JSON.stringify(remaining),
          );
        }
        return remaining;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [userProfile?.phone]);

  const closeModal = () => setActiveModal(null);

  const handleLogout = () => {
    localStorage.removeItem("zpay_auth");
    setIsAuthenticated(null);
    setUserProfile(null);
    setBalance(0);
    setProcessingOrders([]);
    setCompletedOrders([]);
    setTotalDeposit(0);
  };

  const handleAuth = (profile: UserProfile, _isNewUser: boolean) => {
    setIsAuthenticated(profile.phone);
    setUserProfile(profile);

    const storedBalance = localStorage.getItem(`zpay_balance_${profile.phone}`);
    let currentBalance = storedBalance ? Number(storedBalance) : 0;

    const bonusKey = `zpay_bonus_given_${profile.phone}`;
    const bonusAlreadyGiven = localStorage.getItem(bonusKey);
    if (!bonusAlreadyGiven) {
      const bonusAmt = Number(
        localStorage.getItem("zpay_admin_bonus") || BONUS_AMOUNT,
      );
      currentBalance += bonusAmt;
      localStorage.setItem(
        `zpay_balance_${profile.phone}`,
        String(currentBalance),
      );
      localStorage.setItem(bonusKey, "1");
      setTimeout(() => setShowBonus(true), 600);
    }

    setBalance(currentBalance);

    const storedUpi = localStorage.getItem(`zpay_upi_${profile.phone}`);
    setUpiList(storedUpi ? JSON.parse(storedUpi) : []);

    const storedProc = localStorage.getItem(`zpay_processing_${profile.phone}`);
    const allProc: ProcessingOrder[] = storedProc ? JSON.parse(storedProc) : [];
    const storedCompleted = localStorage.getItem(
      `zpay_completed_${profile.phone}`,
    );
    const allCompleted: ProcessingOrder[] = storedCompleted
      ? JSON.parse(storedCompleted)
      : [];
    // Deduplicate: filter out any processing orders that are already in completed
    const completedIds = new Set(allCompleted.map((o) => o.orderId));
    const dedupedProc = allProc.filter((o) => !completedIds.has(o.orderId));
    setProcessingOrders(dedupedProc);
    setCompletedOrders(allCompleted);

    const storedDeposit = localStorage.getItem(
      `zpay_totaldeposit_${profile.phone}`,
    );
    setTotalDeposit(storedDeposit ? Number(storedDeposit) : 0);
  };

  const handleComplete = (po: ProcessingOrder) => {
    setProcessingOrders((prev) => {
      // Deduplicate: do not add if orderId already exists
      if (prev.some((o) => o.orderId === po.orderId)) return prev;
      const updated = [po, ...prev];
      if (userProfile?.phone) {
        localStorage.setItem(
          `zpay_processing_${userProfile.phone}`,
          JSON.stringify(updated),
        );
      }
      return updated;
    });
  };

  // Persist upiList
  useEffect(() => {
    if (userProfile?.phone) {
      localStorage.setItem(
        `zpay_upi_${userProfile.phone}`,
        JSON.stringify(upiList),
      );
    }
  }, [upiList, userProfile?.phone]);

  if (splash) return <SplashScreen />;

  if (!isAuthenticated) {
    return <LoginScreen onAuth={handleAuth} />;
  }

  const maintenanceRemaining = Math.max(0, MAINTENANCE_UNTIL - maintenanceNow);
  const maintenanceActive = maintenanceRemaining > 0;
  const mh = Math.floor(maintenanceRemaining / 3600000);
  const mm = Math.floor((maintenanceRemaining % 3600000) / 60000);
  const ms = Math.floor((maintenanceRemaining % 60000) / 1000);

  if (maintenanceActive) {
    return (
      <div
        className="relative flex flex-col min-h-screen bg-white items-center justify-center"
        style={{ maxWidth: 430, margin: "0 auto" }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(16px)",
            borderRadius: 24,
            border: "1px solid rgba(212,175,55,0.3)",
            boxShadow: "0 8px 32px rgba(212,175,55,0.15)",
            padding: "2.5rem 2rem",
            textAlign: "center",
            maxWidth: 340,
            width: "90%",
          }}
        >
          <img
            src="/assets/uploads/image_f9b2be02-1.png"
            alt="ZPay"
            style={{ height: 72, margin: "0 auto 1.5rem" }}
          />
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#b8860b",
              marginBottom: 8,
            }}
          >
            Under Maintenance
          </div>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
            The app is currently under maintenance. We{"'"}ll be back shortly.
          </div>
          <div
            style={{
              background: "rgba(212,175,55,0.1)",
              borderRadius: 16,
              padding: "1rem 1.5rem",
              display: "inline-block",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#b8860b",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Resuming in
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "#b8860b",
                letterSpacing: 2,
              }}
            >
              {String(mh).padStart(2, "0")}:{String(mm).padStart(2, "0")}:
              {String(ms).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userId = userProfile?.phone
    ? `ZP${userProfile.phone.slice(-6)}`
    : "2250586";

  const isAdmin = userProfile?.isAdmin === true;
  const tabs = [
    { id: "home" as ActiveTab, label: "Home", icon: <Home size={20} /> },
    {
      id: "payment" as ActiveTab,
      label: "Payment",
      icon: <CreditCard size={20} />,
    },
    { id: "tools" as ActiveTab, label: "", icon: <QrCode size={22} /> },
    { id: "team" as ActiveTab, label: "Team", icon: <Users size={20} /> },
    { id: "my" as ActiveTab, label: "My", icon: <User size={20} /> },
    ...(isAdmin
      ? [
          {
            id: "admin" as ActiveTab,
            label: "Admin",
            icon: <Shield size={20} />,
          },
        ]
      : []),
  ];

  return (
    <div
      className="relative flex flex-col min-h-screen bg-white"
      style={{ maxWidth: 430, margin: "0 auto" }}
    >
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "home" && (
          <HomeTab
            balance={balance}
            onComplete={handleComplete}
            processingOrders={processingOrders}
          />
        )}
        {activeTab === "payment" && (
          <PaymentTab
            sellOn={sellOn}
            setSellOn={setSellOn}
            balance={balance}
            upiList={upiList}
            completedOrders={completedOrders}
            processingOrders={processingOrders}
            isAdmin={isAdmin}
            phone={isAuthenticated || ""}
          />
        )}
        {activeTab === "tools" && (
          <ToolsScreen upiList={upiList} setUpiList={setUpiList} />
        )}
        {activeTab === "team" && <TeamScreen />}
        {activeTab === "admin" && isAdmin && (
          <AdminTab onLogout={handleLogout} />
        )}
        {activeTab === "my" && (
          <div className="flex-1 overflow-y-auto pb-24">
            <MyScreen
              sellOn={sellOn}
              setSellOn={setSellOn}
              openModal={(m) => {
                if (m === null) {
                  setHistoryOpen(true);
                  return;
                }
                setActiveModal(m);
              }}
              onLogout={handleLogout}
              profile={userProfile}
              balance={balance}
              totalDeposit={totalDeposit}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
      </div>

      {/* Tab Loading Overlay */}
      {tabLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.92)",
            maxWidth: 430,
            margin: "0 auto",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin"
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              aria-label="Loading"
              role="img"
            >
              <title>Loading</title>
              <circle
                cx="18"
                cy="18"
                r="15"
                stroke="rgba(251,191,36,0.2)"
                strokeWidth="3"
              />
              <path
                d="M18 3 A15 15 0 0 1 33 18"
                stroke="oklch(0.62 0.18 80)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      )}
      {/* Bottom Nav */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full flex items-end justify-around px-2 pb-2 pt-2 z-40"
        style={{
          maxWidth: 430,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isCenter = tab.id === "tools";
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === activeTab) return;
                setTabLoading(true);
                setTimeout(() => {
                  setActiveTab(tab.id);
                  setTabLoading(false);
                }, 800);
              }}
              className={`flex flex-col items-center gap-0.5 transition-all ${
                isCenter ? "relative -top-4" : ""
              }`}
              data-ocid={`nav.${tab.id}`}
            >
              {isCenter ? (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, oklch(0.55 0.20 145), oklch(0.45 0.18 155))"
                      : "linear-gradient(135deg, oklch(0.40 0.18 255), oklch(0.30 0.16 265))",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  <span style={{ color: "white" }}>{tab.icon}</span>
                </div>
              ) : (
                <>
                  <span
                    style={{
                      color: isActive
                        ? "oklch(0.62 0.18 80)"
                        : "oklch(0.60 0.02 240)",
                    }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label && (
                    <span
                      className="text-[10px] font-semibold"
                      style={{
                        color: isActive
                          ? "oklch(0.62 0.18 80)"
                          : "oklch(0.60 0.02 240)",
                      }}
                    >
                      {tab.label}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === "usdt" && <UsdtModal onClose={closeModal} />}
        {activeModal === "activity" && <ActivityModal onClose={closeModal} />}
        {activeModal === "help" && <HelpModal onClose={closeModal} />}
        {activeModal === "chat" && <ChatModal onClose={closeModal} />}
        {activeModal === "pin" && (
          <PinModal onClose={closeModal} userId={userId} />
        )}
        {historyOpen && (
          <OrderHistoryScreen
            onClose={() => setHistoryOpen(false)}
            processingOrders={processingOrders}
          />
        )}
      </AnimatePresence>

      {/* Bonus Popup */}
      <AnimatePresence>
        {showBonus && <BonusPopup onClose={() => setShowBonus(false)} />}
      </AnimatePresence>
    </div>
  );
}
