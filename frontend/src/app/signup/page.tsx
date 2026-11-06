"use client";


import { CompactLoader } from "@/components/ui/LoadingStates";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  ShieldCheck,
  Route,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://potholevision.onrender.com";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordStrength =
    password.length >= 12 && /[A-Z]/.test(password) &&
    /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)
      ? 4
      : password.length >= 8 && /[0-9]/.test(password)
      ? 3
      : password.length >= 8
      ? 2
      : password.length > 0
      ? 1
      : 0;

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pv-auth-page relative min-h-screen overflow-hidden bg-[#101317] text-[#F4E9D0]">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#A33A3A]/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#C8A96B]/10 blur-[130px]" />

      <div className="absolute left-7 top-7 z-20 sm:left-10 sm:top-9">
        <Link href="/" aria-label="PotholeVision home">
          <BrandLogo />
        </Link>
      </div>

      <Link
        href="/"
        className="group absolute right-6 top-8 z-20 inline-flex items-center gap-1 border border-[#343B43] px-2 py-1.5 text-[9px] font-medium tracking-normal text-[#AAB0B5] transition hover:border-[#C8A96B]/60 hover:text-[#C8A96B] sm:right-10 sm:gap-1.5 sm:px-3 sm:py-2 sm:text-[10px] sm:tracking-wide"
      >
        <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1 sm:h-[14px] sm:w-[14px]" />
        Back to Website
      </Link>

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative hidden min-h-screen flex-col justify-center overflow-hidden px-12 pb-16 pt-28 lg:flex xl:px-20">
          <div className="absolute inset-0">
            <img
              src="/images/road-auth.jpg"
              alt=""
              className="h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#101317]/95 via-[#101317]/65 to-[#101317]/90" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101317] via-transparent to-[#101317]/40" />
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#C8A96B]/25 bg-[#C8A96B]/[0.07] px-4 py-2 text-[10px] font-semibold tracking-[0.22em] text-[#C8A96B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A33A3A] shadow-[0_0_10px_#A33A3A]" />
              THE FUTURE OF ROAD INTELLIGENCE
            </div>

            <h1 className="text-5xl font-semibold leading-[1.13] tracking-tight xl:text-6xl">
              Build safer roads.
              <span className="mt-2 block text-[#C8A96B]">
                Together.
              </span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-8 text-[#A5ADB3]">
              Join the next generation of infrastructure intelligence.
              Detect road damage, understand risk and turn insights into
              meaningful action.
            </p>

            <div className="mt-12 grid max-w-md grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.09] bg-[#222831]/65 p-5 backdrop-blur-xl">
                <Route size={21} className="text-[#C8A96B]" />
                <p className="mt-5 text-sm font-semibold">AI-powered</p>
                <p className="mt-1 text-xs text-[#8B969E]">Road detection</p>
              </div>

              <div className="rounded-2xl border border-white/[0.09] bg-[#222831]/65 p-5 backdrop-blur-xl">
                <ShieldCheck size={21} className="text-[#C8A96B]" />
                <p className="mt-5 text-sm font-semibold">Smarter insights</p>
                <p className="mt-1 text-xs text-[#8B969E]">Infrastructure intelligence</p>
              </div>
            </div>

            <div className="mt-14 flex items-center gap-3 text-[10px] tracking-[0.22em] text-[#68737C]">
              <span className="h-px w-10 bg-[#A33A3A]" />
              SMARTER ROADS. SAFER TOMORROW.
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-5 pb-12 pt-28 sm:px-10 lg:px-12 lg:pt-20">
          <div className="w-full max-w-[460px]">
            <div className="mb-8 lg:hidden">
              <p className="text-[10px] font-semibold tracking-[0.25em] text-[#C8A96B]">
                ROAD INTELLIGENCE PLATFORM
              </p>
            </div>

            <div className="mb-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C8A96B]/25 bg-[#C8A96B]/[0.07] text-[#C8A96B]">
                <UserRound size={23} />
              </div>

              <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-[#C8A96B]">
                CREATE YOUR ACCOUNT
              </p>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Join PotholeVision
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#8B969E]">
                Start building a smarter road infrastructure ecosystem.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label htmlFor="signup-name" className="mb-2 block text-xs font-medium text-[#C5CBD0]">
                  Full name
                </label>
                <div className="pv-auth-input-wrap">
                  <UserRound size={17} />
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    required
                    minLength={2}
                    maxLength={150}
                    autoComplete="name"
                    className="pv-auth-input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-2 block text-xs font-medium text-[#C5CBD0]">
                  Email address
                </label>
                <div className="pv-auth-input-wrap">
                  <Mail size={17} />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="pv-auth-input"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="signup-password" className="text-xs font-medium text-[#C5CBD0]">
                    Password
                  </label>
                  <span className="text-[10px] text-[#68737C]">Minimum 8 characters</span>
                </div>

                <div className="pv-auth-input-wrap">
                  <LockKeyhole size={17} />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a secure password"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    className="pv-auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-[#8B969E] transition hover:text-[#C8A96B]"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                <div className="mt-3 flex gap-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength >= level
                          ? level <= 2 ? "bg-[#A33A3A]" : "bg-[#C8A96B]"
                          : "bg-[#343B43]"
                      }`}
                    />
                  ))}
                </div>
                {password.length > 0 && (
                  <p className="mt-2 text-[10px] text-[#8B969E]">
                    {["", "Too short", "Getting started", "Good password", "Strong password"][passwordStrength]}
                  </p>
                )}
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-[#A33A3A]/30 bg-[#A33A3A]/10 p-3 text-sm text-[#F1A0A0]">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] p-3 text-sm text-emerald-300">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-[#D9BB7F]/40 bg-gradient-to-r from-[#C8A96B] to-[#B28E4F] px-5 py-4 text-sm font-bold tracking-wide text-[#17191B] shadow-[0_8px_30px_rgba(200,169,107,0.13)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(200,169,107,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="rounded-lg border border-[#A33A3A]/30 bg-[#17191B] px-4 py-2">
                    <CompactLoader label="CREATING ACCOUNT" />
                  </span>
                ) : (
                  <>
                    Create your account
                    <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/[0.09]" />
              <span className="text-[10px] tracking-[0.2em] text-[#68737C]">ALREADY REGISTERED?</span>
              <div className="h-px flex-1 bg-white/[0.09]" />
            </div>

            <p className="text-center text-sm text-[#8B969E]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#C8A96B] transition hover:text-[#F4E9D0]">
                Sign in
              </Link>
            </p>

            <div className="mt-10 flex items-center justify-center gap-2 text-[10px] tracking-wider text-[#68737C]">
              <ShieldCheck size={13} />
              YOUR ACCOUNT. YOUR INFRASTRUCTURE INTELLIGENCE.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}






