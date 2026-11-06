"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, LockKeyhole } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import { CompactLoader } from "@/components/ui/LoadingStates";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://potholevision.onrender.com";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/");
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
    <main className="min-h-screen bg-[#101317] text-[#F4E9D0] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* LEFT: BRAND EXPERIENCE */}
      <section className="relative hidden min-h-screen overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(16,19,23,0.82), rgba(16,19,23,0.45)), url('/images/road-hero.jpg')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#101317] via-transparent to-[#101317]/30" />

        <div className="relative z-10 p-12 xl:p-16">
          <Link href="/" className="inline-flex">
            <BrandLogo />
          </Link>
        </div>

        <div className="relative z-10 max-w-2xl px-12 pb-20 xl:px-16 xl:pb-24">
          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-10 bg-[#C8A96B]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#C8A96B]">
              Intelligent Infrastructure
            </span>
          </div>

          <h1 className="max-w-xl text-5xl font-medium leading-[1.13] tracking-[-0.045em] text-[#F4E9D0] xl:text-6xl">
            Building better roads through{" "}
            <span className="text-[#C8A96B]">intelligence.</span>
          </h1>

          <p className="mt-7 max-w-md text-sm leading-7 text-[#C1C4C5]">
            A smarter approach to road monitoring, pothole detection and
            infrastructure maintenance — all in one connected platform.
          </p>

          <div className="mt-12 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#8B969E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C8A96B]" />
            Smarter Roads. Safer Tomorrow.
          </div>
        </div>

        <div className="relative z-10 flex justify-between border-t border-white/10 px-12 py-6 text-[10px] tracking-[0.12em] text-[#8B969E] xl:px-16">
          <span>© {new Date().getFullYear()} POTHOLEVISION</span>
          <span>ROAD INTELLIGENCE PLATFORM</span>
        </div>
      </section>

      {/* RIGHT: LOGIN FORM */}
      <section className="flex min-h-screen flex-col justify-between px-6 py-7 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex justify-end">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 border border-[#343B43] px-2.5 py-2 text-[10px] font-medium tracking-normal text-[#AAB0B5] transition hover:border-[#C8A96B]/60 hover:text-[#C8A96B] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[11px] sm:tracking-wide"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1 sm:h-[14px] sm:w-[14px]" />
            Back to Website
          </Link>
        </div>

        <div className="lg:hidden">
          <Link href="/" className="inline-flex">
            <BrandLogo />
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-14">
          <div className="mb-10">
            <div className="mb-8 flex h-12 w-12 items-center justify-center border border-[#C8A96B]/30 bg-[#C8A96B]/[0.07] text-[#C8A96B]">
              <LockKeyhole size={21} strokeWidth={1.5} />
            </div>

            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-[#C8A96B]">
              Welcome Back
            </p>

            <h2 className="text-3xl font-medium tracking-[-0.04em] text-[#F4E9D0] sm:text-4xl">
              Sign in to your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#8B969E]">
              Access your road intelligence workspace.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2.5 block text-xs font-medium tracking-wide text-[#D5D0C5]"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                required
                autoComplete="email"
                className="h-13 w-full border border-[#343B43] bg-[#222831] px-4 text-sm text-[#F4E9D0] outline-none transition placeholder:text-[#68737C] hover:border-[#59616A] focus:border-[#C8A96B]"
              />
            </div>

            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium tracking-wide text-[#D5D0C5]"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="h-13 w-full border border-[#343B43] bg-[#222831] px-4 pr-12 text-sm text-[#F4E9D0] outline-none transition placeholder:text-[#68737C] hover:border-[#59616A] focus:border-[#C8A96B]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 flex h-13 w-12 items-center justify-center text-[#8B969E] transition hover:text-[#C8A96B]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="border border-[#A33A3A]/30 bg-[#A33A3A]/10 px-4 py-3 text-sm text-[#E6A09A]"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex h-13 w-full items-center justify-center gap-3 bg-[#C8A96B] px-5 text-sm font-semibold tracking-wide text-[#101317] transition hover:bg-[#D7BA80] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <CompactLoader label="AUTHENTICATING" /> : "Sign In"}
              {!loading && (
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#343B43]" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#68737C]">
              Secure Access
            </span>
            <div className="h-px flex-1 bg-[#343B43]" />
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#8B969E]">
            <ShieldCheck size={15} className="text-[#C8A96B]" />
            Your workspace is protected by secure authentication.
          </div>

          <p className="mt-10 text-center text-sm text-[#8B969E]">
            New to PotholeVision?{" "}
            <Link
              href="/signup"
              className="font-medium text-[#C8A96B] underline-offset-4 transition hover:text-[#E2C58D] hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        <div className="text-center text-[10px] tracking-wide text-[#68737C]">
          Smarter Roads. Safer Tomorrow.
        </div>
      </section>
    </main>
  );
}




