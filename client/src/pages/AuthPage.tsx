import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, Send, UserRound } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type Mode = "login" | "register";

function nextPath() {
  const target = new URLSearchParams(window.location.search).get("next");
  return target?.startsWith("/") ? target : "/";
}

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>(() => new URLSearchParams(window.location.search).get("mode") === "register" ? "register" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const utils = trpc.useUtils();

  const sendCode = trpc.auth.requestRegistrationCode.useMutation({
    onSuccess(data) {
      toast.success("验证码已发送，请检查邮箱");
      setCooldown(data.cooldownSeconds);
      const timer = window.setInterval(() => setCooldown(current => {
        if (current <= 1) { window.clearInterval(timer); return 0; }
        return current - 1;
      }), 1000);
    },
    onError(error) { toast.error(error.message); },
  });
  const login = trpc.auth.login.useMutation({
    onSuccess: async () => { await utils.auth.me.invalidate(); navigate(nextPath()); },
    onError(error) { toast.error(error.message); },
  });
  const register = trpc.auth.register.useMutation({
    onSuccess: async () => { await utils.auth.me.invalidate(); toast.success("邮箱验证完成，欢迎来到 MorroBlog"); navigate(nextPath()); },
    onError(error) { toast.error(error.message); },
  });
  const pending = sendCode.isPending || login.isPending || register.isPending;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "login") return login.mutate({ email, password });
    if (password !== confirmPassword) return toast.error("两次输入的密码不一致");
    register.mutate({ email, code, password, name: name || undefined });
  };

  return <section className="mx-auto grid min-h-[calc(100vh-17rem)] max-w-5xl border border-white/[0.14] lg:grid-cols-[0.88fr_1.12fr]">
    <aside className="flex flex-col justify-between border-b border-white/[0.14] bg-[#151613] p-7 sm:p-10 lg:border-b-0 lg:border-r">
      <div><button type="button" onClick={() => navigate("/")} className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-stone-500 transition-colors hover:text-[#c6edf0]"><ArrowLeft size={13} /> RETURN TO INDEX</button><p className="editorial-kicker mt-14">PRIVATE ACCESS / ISSUE 01</p><h1 className="display-title mt-5 text-4xl leading-[1.08] sm:text-5xl">用自己的<br /><span className="display-accent">邮箱进入。</span></h1><p className="copy-lede mt-6 max-w-sm">注册先验证邮箱，再设置密码。本站不再跳转第三方账号页面，资料只用于站内身份、文章和评论权限。</p></div>
      <div className="mt-12 border-t border-white/[0.12] pt-5 text-xs leading-6 text-stone-500"><p className="font-mono text-[10px] tracking-[0.12em] text-stone-400">EMAIL-FIRST AUTHENTICATION</p><p className="mt-2">验证码仅在注册时使用，10 分钟失效；密码不会以明文保存。</p></div>
    </aside>
    <div className="p-7 sm:p-10 lg:p-14"><div className="flex border-b border-white/[0.14]" role="tablist" aria-label="认证方式">{(["login", "register"] as Mode[]).map(item => <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => setMode(item)} className={`mr-7 -mb-px border-b pb-3 text-sm transition-colors ${mode === item ? "border-[#c6edf0] text-[#c6edf0]" : "border-transparent text-stone-500 hover:text-stone-200"}`}>{item === "login" ? "密码登录" : "创建账号"}</button>)}</div>
      <form onSubmit={submit} className="mt-9 max-w-md space-y-5">
        {mode === "register" && <label className="block"><span className="editorial-kicker">DISPLAY NAME / 可选</span><div className="quiet-input mt-2 flex items-center gap-3"><UserRound size={16} /><input value={name} onChange={event => setName(event.target.value)} maxLength={80} autoComplete="name" placeholder="在刊物中显示的名字" /></div></label>}
        <label className="block"><span className="editorial-kicker">EMAIL</span><div className="quiet-input mt-2 flex items-center gap-3"><Mail size={16} /><input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" placeholder="name@example.com" required /></div></label>
        {mode === "register" && <label className="block"><span className="editorial-kicker">VERIFICATION CODE</span><div className="mt-2 flex gap-2"><div className="quiet-input flex flex-1 items-center gap-3"><CheckCircle2 size={16} /><input value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="6 位验证码" required /></div><button type="button" onClick={() => sendCode.mutate({ email })} disabled={!email || cooldown > 0 || sendCode.isPending} className="editorial-button border border-[#c6edf0]/50 px-3 text-xs text-[#c6edf0] disabled:cursor-not-allowed disabled:opacity-40">{cooldown > 0 ? `${cooldown}s` : <><Send size={13} /> 获取</>}</button></div><p className="mt-2 text-xs text-stone-600">同一邮箱 60 秒内只能请求一次验证码。</p></label>}
        <label className="block"><span className="editorial-kicker">PASSWORD</span><div className="quiet-input mt-2 flex items-center gap-3"><KeyRound size={16} /><input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 10 : undefined} placeholder={mode === "register" ? "至少 10 个字符" : "输入密码"} required /></div></label>
        {mode === "register" && <label className="block"><span className="editorial-kicker">CONFIRM PASSWORD</span><div className="quiet-input mt-2 flex items-center gap-3"><KeyRound size={16} /><input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={10} placeholder="再次输入密码" required /></div></label>}
        <button type="submit" disabled={pending} className="editorial-button editorial-button-primary mt-3 w-full justify-center disabled:cursor-wait disabled:opacity-60">{pending ? "处理中…" : mode === "login" ? "进入阅读室" : "验证邮箱并创建账号"}</button>
      </form><p className="mt-8 max-w-md border-t border-white/[0.1] pt-5 text-xs leading-6 text-stone-600">{mode === "login" ? "还没有账号？切换到“创建账号”，先获取邮箱验证码。" : "已有账号？切换到“密码登录”即可进入。"}</p>
    </div>
  </section>;
}
