"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

import { useAppContext } from "@/components/providers/AppProvider";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();
  const { authAccounts, setUser } = useAppContext();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const normalizedEmail = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    if (!normalizedEmail || !enteredPassword) {
      setLoading(false);
      return;
    }

    if (enteredPassword.length > 18) {
      setError("Password must not exceed 18 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password: enteredPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.localStorage.setItem("slpm:token", data.token);
        setUser({
            id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role as any,
            title: data.user.title,
            requiresPasswordChange: Boolean(data.user.requiresPasswordChange),
        });
        router.push("/overview");
      } else {
        setError(data.message || "Incorrect email or password. Please try again.");
      }
    } catch (err) {
      setError(
        "Failed to connect to the backend server. Confirm NEXT_PUBLIC_API_URL in .env.local matches your API (including port) and that the API is running."
      );
    }
    setLoading(false);
  }

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center px-4 py-9 overflow-hidden"
      style={{
        backgroundColor: "#0a1120",
        backgroundImage:
          "linear-gradient(rgba(96,144,227,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(96,144,227,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('https://www.ibm.com/adobe/dynamicmedia/deliver/dm-aid--817da868-3731-402e-8579-050306016562/22-27-p-gorodenkoff-549.jpg?preferwebp=true')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#070d1a]/75" aria-hidden />

      {/* Outer glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07] blur-[120px]"
          style={{
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, #6090E3, transparent)",
          }}
        />
      </div>

      <div className="relative w-full max-w-5xl flex rounded-[28px] overflow-hidden shadow-[0_28px_70px_rgba(8,15,30,0.45)]">
        {/* ── LEFT PANEL ── */}
        <div className="relative hidden w-[44%] shrink-0 items-center justify-center px-5 py-6 backdrop-blur-xl lg:flex">
          {/* Dot texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.22]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Glow accents */}
          <div className="absolute -top-16 left-1/4 h-64 w-64 rounded-full bg-sky-300/6 blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-cyan-200/4 blur-3xl" />
          <div
            className="absolute top-1/2 -right-24 w-50 -translate-y-1/2 rounded-full blur-[80px] pointer-events-none opacity-16"
            style={{
              height: "400px",
              background: "linear-gradient(to bottom, #6090E3, transparent)",
            }}
          />

          <div className="relative z-10 flex h-full w-full flex-col justify-between gap-11 rounded-3xl p-10">
            {/* Logo */}
            <div className="relative z-10 flex items-center gap-3">
              <Image
                          src="/starlink.svg"
                          alt="Starlink"
                          width={140}
                          height={31}
                          className="h-[50px] w-auto"
                          priority
                        />
            </div>

            {/* Spacer for justify-between */}
            <div />

            {/* Headline block */}
            <div className="relative z-10 space-y-7 self-start">
              <div className="relative">
                <div
                  className="absolute -inset-6 rounded-3xl blur-3xl opacity-30 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse, rgba(96,144,227,0.85), transparent 70%)",
                  }}
                />
                <h1
                  className="relative text-white font-bold leading-[1.12] tracking-tight"
                  style={{ fontSize: "2.6rem" }}
                >
                  Project
                  <br />
                  Management
                </h1>
              </div>

              {/* <p className="max-w-[250px] text-[13.5px] leading-[1.7] text-slate-200/85">
                Intelligent project management for the modern enterprise —
                monitor, track, and deliver your infrastructure projects.
              </p> */}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="relative flex-1 flex items-center justify-center px-6 py-15 backdrop-blur-xl sm:px-10 lg:px-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-16 left-1/4 h-64 w-64 rounded-full bg-sky-300/6 blur-3xl" />
            <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-cyan-200/4 blur-3xl" />
          </div>

          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/3 p-7 shadow-[0_14px_38px_rgba(2,10,25,0.24)] backdrop-blur-2xl sm:p-8">
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-[36px] font-bold leading-tight  tracking-tight text-white">
                Sign In
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-200/90">
                Sign in to access your dashboard 
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-200/90">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="h-11 rounded-xl border-white/[0.14] bg-white/4 pl-11 pr-4 text-sm text-white placeholder:text-slate-300 focus-visible:border-sky-300 focus-visible:bg-white/[0.07] focus-visible:ring-4 focus-visible:ring-sky-300/8"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-200/90">
                  Password
                </label>
                        <div className="relative">
                          <Lock
                            size={15}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                          />
                          <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="h-11 rounded-xl border-white/[0.14] bg-white/4 pl-11 pr-4 text-sm text-white placeholder:text-slate-300 focus-visible:border-sky-300 focus-visible:bg-white/[0.07] focus-visible:ring-4 focus-visible:ring-sky-300/8"
                          />
                        </div>
              </div>

              {!API_URL && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-400/35 bg-amber-500/15 px-4 py-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  <p className="text-[13px] font-medium text-amber-50">
                    Missing <code className="rounded bg-black/20 px-1">NEXT_PUBLIC_API_URL</code> in{" "}
                    <code className="rounded bg-black/20 px-1">.env.local</code> — must match your API
                    origin (for example{" "}
                    <code className="rounded bg-black/20 px-1">http://localhost:3002</code>
                    {" "}if the API listens on port 3002).
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <p className="text-[13px] font-medium text-red-100">
                    {error}
                  </p>
                </div>
              )}

              {/* CTA Button */}
              <Button
                type="submit"
                disabled={loading}
                className="group h-12 w-full gap-2.5 rounded-xl text-sm font-semibold tracking-wide text-white shadow-[0_3px_10px_rgba(10,37,64,0.28),0_1px_2px_rgba(10,37,64,0.18),inset_0_1px_0_rgba(255,255,255,0.07)] transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #0e2a4e 0%, #1a4680 100%)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    {/* <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    /> */}
                  </>
                )}
              </Button>
            </form>

            {/* Demo credentials info */}
            {/* <div className="mt-6 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-[12px] text-slate-200/90">
              <p className="font-semibold">Current Accounts</p>
              <div className="mt-2 space-y-1">
                {authAccounts.map((account) => (
                  <p key={account.email} className="text-slate-200/90">
                    {account.role}: {account.email} / {account.password}
                  </p>
                ))}
              </div>
            </div> */}

            <p className="mt-9 text-center text-[11px] text-slate-300/85">
              © 2026 StarLink. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
