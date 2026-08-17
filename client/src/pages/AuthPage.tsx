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
  const [codeSentTo, setCodeSentTo] = useState("");
  const utils = trpc.useUtils();

  const sendCode = trpc.auth.requestRegistrationCode.useMutation({
    onSuccess(data) {
      setCodeSentTo(email.trim());
      toast.success("验证码已发送，请检查收件箱");
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
    onSuccess: async () => { await utils.auth.me.invalidate(); toast.success("账号已创建，可以开始浏览了"); navigate(nextPath()); },
    onError(error) { toast.error(error.message); },
  });
  const pending = sendCode.isPending || login.isPending || register.isPending;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "login") return login.mutate({ email, password });
    if (password !== confirmPassword) return toast.error("两次输入的密码不一致");
    register.mutate({ email, code, password, name: name || undefined });
  };

  return <section className="mx-auto grid min-h-[calc(100vh-17rem)] max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/[0.14] bg-[#202630]/76 shadow-2xl shadow-black/15 lg:grid-cols-[0.88fr_1.12fr]">
    <aside className="flex flex-col justify-between border-b border-white/[0.12] bg-[#252c37]/76 p-7 sm:p-10 lg:border-b-0 lg:border-r">
      <div><button type="button" onClick={() => navigate("/")} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-[#bce8eb]"><ArrowLeft size={15} /> 返回首页</button><p className="mt-12 text-sm text-slate-300">MorroBlog 账号</p><h1 className="display-title mt-5 text-4xl leading-[1.14] sm:text-5xl">用邮箱，<br /><span className="display-accent">确认是你。</span></h1><p className="copy-lede mt-6 max-w-sm">注册前先验证你填写的收件邮箱，再设置密码。账号只用于站内登录、文章和评论权限。</p></div>
      <div className="mt-12 rounded-2xl border border-white/[0.12] bg-white/[0.045] p-4 text-xs leading-6 text-slate-300"><p className="font-medium text-slate-100">账号安全提示</p><p className="mt-2">验证码仅用于这一次注册，10 分钟后失效。请不要把验证码或密码提供给任何人；密码会加密保存，不以明文留存。</p></div>
    </aside>
    <div className="p-7 sm:p-10 lg:p-14"><div className="inline-flex rounded-xl bg-[#15191f] p-1" role="tablist" aria-label="认证方式">{(["login", "register"] as Mode[]).map(item => <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => setMode(item)} className={`rounded-lg px-4 py-2 text-sm transition-colors ${mode === item ? "bg-[#bce8eb] text-[#152126]" : "text-slate-300 hover:text-white"}`}>{item === "login" ? "登录" : "注册"}</button>)}</div>
      <form onSubmit={submit} className="mt-8 max-w-md space-y-5">
        {mode === "register" && <label className="block"><span className="text-sm font-medium text-slate-200">昵称 <span className="text-slate-400">（可选）</span></span><div className="quiet-input mt-2 flex h-11 items-center gap-3 px-3"><UserRound size={16} className="text-slate-300" /><input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400" value={name} onChange={event => setName(event.target.value)} maxLength={80} autoComplete="name" placeholder="评论区显示的名字" /></div></label>}
        <label className="block"><span className="text-sm font-medium text-slate-200">邮箱</span><div className="quiet-input mt-2 flex h-11 items-center gap-3 px-3"><Mail size={16} className="text-slate-300" /><input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" placeholder="name@example.com" required /></div></label>
        {mode === "register" && <label className="block"><span className="text-sm font-medium text-slate-200">邮箱验证码</span><div className="mt-2 flex gap-2"><div className="quiet-input flex h-11 min-w-0 flex-1 items-center gap-3 px-3"><CheckCircle2 size={16} className="shrink-0 text-slate-300" /><input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="输入 6 位数字" required /></div><button type="button" onClick={() => sendCode.mutate({ email })} disabled={!email || cooldown > 0 || sendCode.isPending} aria-label="发送邮箱验证码" className="editorial-button shrink-0 whitespace-nowrap px-3 text-xs disabled:cursor-not-allowed disabled:opacity-40 sm:px-4">{cooldown > 0 ? `${cooldown}s 后重试` : <><Send size={13} className="mr-1" /><span className="sm:hidden">发送</span><span className="hidden sm:inline">发送验证码</span></>}</button></div><p className="mt-2 text-xs text-slate-400">{codeSentTo ? `验证码已发送到 ${codeSentTo}，请在 10 分钟内完成验证。` : "验证码会发送到上方填写的邮箱；同一邮箱 60 秒内只能请求一次。"}</p></label>}
        <label className="block"><span className="text-sm font-medium text-slate-200">密码</span><div className="quiet-input mt-2 flex h-11 items-center gap-3 px-3"><KeyRound size={16} className="text-slate-300" /><input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 10 : undefined} placeholder={mode === "register" ? "至少 10 个字符" : "输入密码"} required /></div></label>
        {mode === "register" && <label className="block"><span className="text-sm font-medium text-slate-200">确认密码</span><div className="quiet-input mt-2 flex h-11 items-center gap-3 px-3"><KeyRound size={16} className="text-slate-300" /><input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={10} placeholder="再次输入密码" required /></div></label>}
        <button type="submit" disabled={pending} className="editorial-button editorial-button-primary mt-3 w-full justify-center disabled:cursor-wait disabled:opacity-60">{pending ? "正在处理…" : mode === "login" ? "登录并继续浏览" : "验证并创建账号"}</button>
      </form><p className="mt-8 max-w-md text-xs leading-6 text-slate-400">{mode === "login" ? "还没有账号？切换到“注册”，先完成邮箱验证。" : "已有账号？切换到“登录”即可继续浏览。"}</p>
    </div>
  </section>;
}
