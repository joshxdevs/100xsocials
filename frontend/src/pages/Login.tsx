import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import BrandMark from '../components/BrandMark';

function getPostLoginPath(role: 'MEMBER' | 'RECRUITER' | 'ADMIN', hasProfile: boolean) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'RECRUITER') return '/recruiter';
  return hasProfile ? '/explore' : '/onboarding';
}

function LoginField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block pl-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
        {label}
      </label>
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_88%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_34%,transparent)_100%)] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        {children}
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { user, loading, sendOtp, verifyOtp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [role, setRole] = useState<'MEMBER' | 'RECRUITER'>('MEMBER');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (!user) return;
    const nextPath = user.role === 'ADMIN'
      ? '/admin'
      : user.role === 'RECRUITER'
        ? '/recruiter'
        : '/explore';
    navigate(nextPath, { replace: true });
  }, [navigate, user]);

  useEffect(() => {
    if (role === 'MEMBER') {
      setCompanyName('');
      setWebsite('');
    }
  }, [role]);

  const getRecruiterPayload = () => ({
    companyName: role === 'RECRUITER' ? companyName.trim() : undefined,
    website: role === 'RECRUITER' ? website.trim() : undefined,
  });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (role === 'RECRUITER' && !companyName.trim()) {
      toast.error('Please enter your company name');
      return;
    }

    try {
      await sendOtp({
        email: email.trim(),
        role,
        ...getRecruiterPayload(),
      });
      setStep('OTP');
      toast.success('Code sent to your email');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send code');
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Enter 6-digit code');
      return;
    }
    if (role === 'RECRUITER' && !companyName.trim()) {
      toast.error('Please enter your company name');
      return;
    }

    try {
      const result = await verifyOtp({
        email: email.trim(),
        otp: code,
        role,
        ...getRecruiterPayload(),
      });
      toast.success('Welcome back!');
      navigate(getPostLoginPath(result.user.role, result.hasProfile), { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid code');
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value && Number.isNaN(Number(value))) return;
    const nextOtp = [...otp];
    nextOtp[index] = value.slice(-1);
    setOtp(nextOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-bg selection:bg-primary/20 flex flex-col lg:flex-row overflow-hidden">
      <div className="absolute right-6 top-6 z-20">
        <div className="flex items-center gap-3 rounded-full border border-border bg-surface/80 px-4 py-2 backdrop-blur-xl shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-surface-high text-muted transition-all duration-300 hover:border-border-hover hover:text-content"
            title="Switch theme"
          >
            {theme === 'light' ? (
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] select-none">
        <div className="absolute top-20 left-20 text-[20vw] font-black leading-none rotate-[-12deg] whitespace-nowrap">
          100X SOCIALS
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-6 py-10 sm:px-8 sm:py-12 lg:justify-center lg:py-20 relative z-10">
        <div className="w-full max-w-[420px] animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6 group cursor-default sm:mb-8">
            <div className="transition-transform duration-300 group-hover:scale-[1.04]">
              <BrandMark size="md" />
            </div>
            <div>
              <h2 className="font-heading font-black text-lg tracking-tight leading-none text-content">100X SOCIALS</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted/60 mt-1">Proof of Work Protocol</p>
            </div>
          </div>

          <div className="mb-8 sm:mb-10">
            <h1 className="text-4xl font-heading font-black tracking-tight text-content mb-3 italic">
              {step === 'EMAIL' ? 'Access Portal' : 'Final Step'}
            </h1>
            <p className="text-muted leading-relaxed font-medium">
              {step === 'EMAIL'
                ? 'Your professional journey continues here. Enter your credentials to enter the network.'
                : `We've dispatched a unique 6-digit conduit to ${email}.`}
            </p>
          </div>

          {step === 'EMAIL' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="p-1.5 bg-surface border border-border rounded-2xl flex gap-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setRole('MEMBER')}
                  className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                    role === 'MEMBER'
                      ? 'bg-primary text-bg shadow-lg'
                      : 'text-muted hover:text-content hover:bg-surface-high'
                  }`}
                >
                  Builder
                </button>
                <button
                  type="button"
                  onClick={() => setRole('RECRUITER')}
                  className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                    role === 'RECRUITER'
                      ? 'bg-primary text-bg shadow-lg'
                      : 'text-muted hover:text-content hover:bg-surface-high'
                  }`}
                >
                  Recruiter
                </button>
              </div>

              <LoginField label="Digital Identity (Email)">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[78px] w-full bg-transparent px-6 text-lg font-medium text-content outline-none transition-all placeholder:text-muted/45 focus:bg-surface/20"
                  placeholder="name@nexus.com"
                  required
                />
              </LoginField>

              {role === 'RECRUITER' && (
                <div className="space-y-4 animate-fade-in">
                  <LoginField label="Company Name">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-[78px] w-full bg-transparent px-6 text-lg font-medium text-content outline-none transition-all placeholder:text-muted/45 focus:bg-surface/20"
                      placeholder="TechCorp Inc."
                      required
                    />
                  </LoginField>

                  <LoginField label="Company Website (Optional)">
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="h-[78px] w-full bg-transparent px-6 text-lg font-medium text-content outline-none transition-all placeholder:text-muted/45 focus:bg-surface/20"
                      placeholder="https://company.com"
                    />
                  </LoginField>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-bg py-5 rounded-2xl font-heading font-black text-lg uppercase tracking-[0.2em] hover:brightness-95 transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Transmitting...' : 'Request Access'}
                {!loading && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-10 animate-fade-in">
              <div className="rounded-2xl border border-border bg-surface/30 px-5 py-4 text-sm text-muted">
                <span className="font-black uppercase tracking-[0.2em] text-content/80">Role</span>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span>{role === 'RECRUITER' ? companyName : 'Builder access'}</span>
                  {role === 'RECRUITER' && website && (
                    <span className="truncate text-xs text-muted/70">{website}</span>
                  )}
                </div>
              </div>

              <div className="mx-auto w-full max-w-[390px]">
                <div className="overflow-hidden rounded-[22px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_90%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_22%,transparent)_100%)] shadow-[0_18px_36px_rgba(0,0,0,0.1)]">
                  <div className="grid grid-cols-6">
                    {otp.map((digit, index) => (
                      <div
                        key={index}
                        className={`relative border-border transition-all duration-200 focus-within:bg-surface-high/65 focus-within:[box-shadow:inset_0_0_0_1px_var(--primary-border)] ${
                          index < otp.length - 1 ? 'border-r' : ''
                        }`}
                      >
                        <input
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !digit && index > 0) {
                              document.getElementById(`otp-${index - 1}`)?.focus();
                            }
                          }}
                          className="h-[60px] w-full bg-transparent text-center text-[22px] font-medium tracking-[-0.03em] text-content outline-none transition-colors placeholder:text-muted/20 focus:text-content"
                          placeholder="·"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <button
                  onClick={() => void handleVerifyOtp()}
                  disabled={loading || otp.some((digit) => !digit)}
                  className="w-full bg-primary text-bg py-6 rounded-2xl font-heading font-black text-lg uppercase tracking-[0.2em] hover:brightness-95 transition-all active:scale-[0.98] shadow-2xl disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Establish Connection'}
                </button>
                <button
                  onClick={() => {
                    setStep('EMAIL');
                    setOtp(['', '', '', '', '', '']);
                  }}
                  className="w-full text-center text-xs font-black uppercase tracking-widest text-muted hover:text-primary transition-colors py-2"
                >
                  Reset Protocol
                </button>
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-border/40 text-center sm:mt-12">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/50">
              End-to-End Encrypted Auth Session
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-surface items-center justify-center p-20 border-l border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-blue-500/5 blur-[100px] rounded-full" />

        <div className="w-full max-w-lg relative z-10 scale-110">
          <div className="card shadow-2xl border-white/5 p-0 overflow-hidden bg-[#121212] ring-1 ring-white/10">
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm shadow-[#FF5F57]/50" />
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-sm shadow-[#FEBC2E]/50" />
                <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm shadow-[#28C840]/50" />
              </div>
              <span className="text-[10px] font-mono font-black text-muted uppercase tracking-[0.2em] opacity-40">
                protocol_handshake.go
              </span>
            </div>
            <div className="p-8 font-mono text-[13px] leading-relaxed text-blue-100/90">
              <div className="flex gap-6 mb-1">
                <span className="text-muted/20 select-none w-4">01</span>
                <span><span className="text-purple-400">package</span> network</span>
              </div>
              <div className="flex gap-6 mb-1">
                <span className="text-muted/20 select-none w-4">02</span>
                <span className="text-muted/40">// Establishing secure builder node</span>
              </div>
              <div className="flex gap-6 mb-1">
                <span className="text-muted/20 select-none w-4">03</span>
                <span><span className="text-purple-400 italic">func</span> <span className="text-blue-400">InitializePeer</span>(id string) {'{'}</span>
              </div>
              <div className="flex gap-6 mb-1">
                <span className="text-muted/20 select-none w-4">04</span>
                <span className="pl-6">peer := protocol.<span className="text-blue-400">NewNode</span>(id)</span>
              </div>
              <div className="flex gap-6 mb-1">
                <span className="text-muted/20 select-none w-4">05</span>
                <span className="pl-6">peer.<span className="text-amber-400">SetAesthetic</span>(<span className="text-emerald-400">"PREMIUM"</span>)</span>
              </div>
              <div className="flex gap-6 mb-1">
                <span className="text-muted/20 select-none w-4">06</span>
                <span className="pl-6"><span className="text-purple-400">return</span> <span className="pl-1 text-blue-400 font-bold">peer.Connect()</span></span>
              </div>
              <div className="flex gap-6">
                <span className="text-muted/20 select-none w-4">07</span>
                <span>{'}'}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4 px-4">
            <div className="h-0.5 w-12 bg-primary rounded-full mb-6" />
            <h3 className="text-2xl font-heading font-black text-content italic leading-tight">
              Designed for the 1%.
              <br />
              Built for the future.
            </h3>
            <p className="text-muted font-medium text-sm max-w-sm leading-relaxed">
              Join a curated network of elite builders and recruiters. Verify your skills through proof of work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
