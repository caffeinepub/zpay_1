import { Eye, EyeOff, Gift, Lock, Phone, Tag, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export interface UserProfile {
  name: string;
  phone: string;
  password: string;
  referral: string;
  isAdmin?: boolean;
}

interface LoginScreenProps {
  onAuth: (profile: UserProfile, isNewUser: boolean) => void;
}

function inputStyle() {
  return {
    background: "oklch(0.12 0.02 255)",
    border: "1px solid oklch(0.30 0.03 255)",
    color: "oklch(0.92 0.01 240)",
  };
}

export default function LoginScreen({ onAuth }: LoginScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [regSuccess, setRegSuccess] = useState("");

  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regReferral, setRegReferral] = useState("");
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [regError, setRegError] = useState("");

  const handleLogin = () => {
    if (!loginPhone.trim() || !loginPassword.trim()) {
      setLoginError("Please enter your phone number and password.");
      return;
    }
    // Admin shortcut
    if (loginPhone.trim() === "admin" && loginPassword.trim() === "admin") {
      setLoginError("");
      localStorage.setItem("zpay_auth", "admin");
      const adminProfile: UserProfile = {
        name: "Admin",
        phone: "admin",
        password: "admin",
        referral: "",
        isAdmin: true,
      };
      onAuth(adminProfile, false);
      return;
    }
    const key = `zpay_user_${loginPhone.trim()}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const profile: UserProfile = JSON.parse(stored);
      if (profile.password === loginPassword.trim()) {
        setLoginError("");
        localStorage.setItem("zpay_auth", loginPhone.trim());
        onAuth(profile, false);
        return;
      }
      setLoginError("Incorrect password.");
      return;
    }
    setLoginError("No account found. Please register first.");
  };

  const handleRegister = () => {
    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setRegError("Please fill in all required fields.");
      return;
    }
    const profile: UserProfile = {
      name: regName.trim(),
      phone: regPhone.trim(),
      password: regPassword.trim(),
      referral: regReferral.trim(),
    };
    const key = `zpay_user_${regPhone.trim()}`;
    localStorage.setItem(key, JSON.stringify(profile));
    // Mark as new user who gets bonus
    localStorage.setItem(`zpay_new_${regPhone.trim()}`, "1");
    // Reset form and redirect to login
    setRegName("");
    setRegPhone("");
    setRegPassword("");
    setRegReferral("");
    setRegError("");
    setRegSuccess("Account created! Please login to continue.");
    setMode("login");
    setLoginPhone("");
    setLoginPassword("");
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "oklch(0.75 0.18 80 / 0.8)";
    e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.75 0.18 80 / 0.12)";
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "oklch(0.30 0.03 255)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div
      className="min-h-screen bg-black flex items-start justify-center"
      data-ocid="auth.page"
    >
      <div
        className="relative w-full min-h-screen flex flex-col items-center justify-center px-5 py-10"
        style={{
          maxWidth: 430,
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.22 0.04 80 / 0.4) 0%, oklch(0.10 0.015 255) 60%)",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.75 0.18 80 / 0.12) 0%, transparent 70%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-8 relative z-10"
        >
          <img
            src="/assets/uploads/image_f9b2be02-1.png"
            alt="ZPay Logo"
            className="w-36 h-36 object-contain"
            style={{
              filter: "drop-shadow(0 0 24px oklch(0.75 0.18 80 / 0.7))",
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="w-full relative z-10"
          style={{
            background: "oklch(0.16 0.025 255)",
            border: "1px solid oklch(0.28 0.05 80 / 0.4)",
            borderRadius: 20,
            boxShadow:
              "0 8px 40px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.75 0.18 80 / 0.08)",
          }}
        >
          <div
            className="flex rounded-t-[20px] overflow-hidden"
            style={{ borderBottom: "1px solid oklch(0.28 0.03 255)" }}
          >
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setLoginError("");
                  setRegError("");
                  if (m === "login") setRegSuccess("");
                }}
                className="flex-1 py-3.5 text-sm font-bold transition-colors relative"
                style={{
                  color:
                    mode === m ? "oklch(0.75 0.18 80)" : "oklch(0.55 0.02 240)",
                  background:
                    mode === m ? "oklch(0.20 0.035 80 / 0.3)" : "transparent",
                }}
                data-ocid="auth.tab"
              >
                {m === "login" ? "Login" : "Register"}
                {mode === m && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: "oklch(0.75 0.18 80)" }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2
                    className="text-xl font-bold mb-5"
                    style={{ color: "oklch(0.92 0.01 240)" }}
                  >
                    Welcome back 👋
                  </h2>

                  {regSuccess && (
                    <div
                      className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl"
                      style={{
                        background: "oklch(0.55 0.20 145 / 0.12)",
                        border: "1px solid oklch(0.55 0.20 145 / 0.3)",
                      }}
                    >
                      <Gift
                        size={14}
                        style={{ color: "oklch(0.65 0.20 145)" }}
                      />
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "oklch(0.65 0.20 145)" }}
                      >
                        {regSuccess}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <label
                      htmlFor="login-phone"
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "oklch(0.6 0.02 240)" }}
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: "oklch(0.55 0.02 240)" }}
                      />
                      <input
                        id="login-phone"
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={inputStyle()}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                        data-ocid="auth.input"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "oklch(0.6 0.02 240)" }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: "oklch(0.55 0.02 240)" }}
                      />
                      <input
                        id="login-password"
                        type={showLoginPwd ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                        style={inputStyle()}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                        data-ocid="auth.input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPwd((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5"
                        style={{ color: "oklch(0.55 0.02 240)" }}
                      >
                        {showLoginPwd ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <p
                      className="text-xs mb-4 px-3 py-2 rounded-lg"
                      style={{
                        color: "oklch(0.65 0.22 25)",
                        background: "oklch(0.65 0.22 25 / 0.1)",
                        border: "1px solid oklch(0.65 0.22 25 / 0.2)",
                      }}
                      data-ocid="auth.error_state"
                    >
                      {loginError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleLogin}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.78 0.18 82), oklch(0.68 0.20 68))",
                      color: "oklch(0.12 0.02 80)",
                      boxShadow: "0 4px 20px oklch(0.75 0.18 80 / 0.35)",
                    }}
                    data-ocid="auth.submit_button"
                  >
                    Login
                  </button>

                  <p
                    className="text-center text-xs mt-4"
                    style={{ color: "oklch(0.55 0.02 240)" }}
                  >
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="font-bold transition-colors"
                      style={{ color: "oklch(0.75 0.18 80)" }}
                      data-ocid="auth.link"
                    >
                      Register
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2
                    className="text-xl font-bold mb-5"
                    style={{ color: "oklch(0.92 0.01 240)" }}
                  >
                    Create account ✨
                  </h2>

                  {[
                    {
                      id: "reg-name",
                      label: "Full Name",
                      icon: (
                        <User
                          size={16}
                          style={{ color: "oklch(0.55 0.02 240)" }}
                        />
                      ),
                      value: regName,
                      setter: setRegName,
                      type: "text",
                      placeholder: "Enter your full name",
                    },
                    {
                      id: "reg-phone",
                      label: "Phone Number",
                      icon: (
                        <Phone
                          size={16}
                          style={{ color: "oklch(0.55 0.02 240)" }}
                        />
                      ),
                      value: regPhone,
                      setter: setRegPhone,
                      type: "tel",
                      placeholder: "Enter your phone number",
                    },
                  ].map((f) => (
                    <div key={f.id} className="mb-4">
                      <label
                        htmlFor={f.id}
                        className="block text-xs font-semibold mb-1.5"
                        style={{ color: "oklch(0.6 0.02 240)" }}
                      >
                        {f.label}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                          {f.icon}
                        </span>
                        <input
                          id={f.id}
                          type={f.type}
                          value={f.value}
                          onChange={(e) => f.setter(e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                          style={inputStyle()}
                          onFocus={focusStyle}
                          onBlur={blurStyle}
                          data-ocid="auth.input"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="mb-4">
                    <label
                      htmlFor="reg-password"
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "oklch(0.6 0.02 240)" }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: "oklch(0.55 0.02 240)" }}
                      />
                      <input
                        id="reg-password"
                        type={showRegPwd ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create a password"
                        className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                        style={inputStyle()}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                        data-ocid="auth.input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPwd((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5"
                        style={{ color: "oklch(0.55 0.02 240)" }}
                      >
                        {showRegPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label
                      htmlFor="reg-referral"
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "oklch(0.6 0.02 240)" }}
                    >
                      Referral Code{" "}
                      <span style={{ color: "oklch(0.45 0.02 240)" }}>
                        (Optional)
                      </span>
                    </label>
                    <div className="relative">
                      <Tag
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: "oklch(0.55 0.02 240)" }}
                      />
                      <input
                        id="reg-referral"
                        type="text"
                        value={regReferral}
                        onChange={(e) => setRegReferral(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                        placeholder="Referral Code (Optional)"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={inputStyle()}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                        data-ocid="auth.input"
                      />
                    </div>
                  </div>

                  {regError && (
                    <p
                      className="text-xs mb-4 px-3 py-2 rounded-lg"
                      style={{
                        color: "oklch(0.65 0.22 25)",
                        background: "oklch(0.65 0.22 25 / 0.1)",
                        border: "1px solid oklch(0.65 0.22 25 / 0.2)",
                      }}
                      data-ocid="auth.error_state"
                    >
                      {regError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleRegister}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.78 0.18 82), oklch(0.68 0.20 68))",
                      color: "oklch(0.12 0.02 80)",
                      boxShadow: "0 4px 20px oklch(0.75 0.18 80 / 0.35)",
                    }}
                    data-ocid="auth.submit_button"
                  >
                    Create Account
                  </button>

                  <p
                    className="text-center text-xs mt-4"
                    style={{ color: "oklch(0.55 0.02 240)" }}
                  >
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="font-bold transition-colors"
                      style={{ color: "oklch(0.75 0.18 80)" }}
                      data-ocid="auth.link"
                    >
                      Login
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p
          className="text-center text-xs mt-8"
          style={{ color: "oklch(0.40 0.02 240)" }}
        >
          &copy; {new Date().getFullYear()}. Built with ❤ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "oklch(0.58 0.18 255)" }}
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
