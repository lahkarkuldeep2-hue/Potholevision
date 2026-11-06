"use client";

import { useState } from "react";
import BrandLogo from "@/components/brand/BrandLogo";
import AIShowcase from "@/components/brand/AIShowcase";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  BrainCircuit,
  MapPinned,
  ClipboardCheck,
  Route,
  ShieldCheck,
  Building2,
  Menu,
  X,
  ScanLine,
  ChartNoAxesCombined,
  Workflow,
} from "lucide-react";

const capabilities = [
  {
    number: "01",
    icon: ScanLine,
    title: "AI-powered detection",
    description:
      "Identify potholes and road surface defects from images and video using intelligent computer vision.",
  },
  {
    number: "02",
    icon: MapPinned,
    title: "Location intelligence",
    description:
      "Connect every detected issue to its geographic location and build a clearer picture of road conditions.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Inspection management",
    description:
      "Coordinate field inspections, record findings and turn detected issues into actionable maintenance tasks.",
  },
  {
    number: "04",
    icon: ChartNoAxesCombined,
    title: "Infrastructure analytics",
    description:
      "Understand road conditions, monitor maintenance progress and make informed infrastructure decisions.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Detect",
    description: "AI identifies road defects from submitted road imagery.",
  },
  {
    number: "02",
    title: "Locate",
    description: "GPS information connects each issue to its road location.",
  },
  {
    number: "03",
    title: "Inspect",
    description: "Field teams verify, assess and prioritize reported issues.",
  },
  {
    number: "04",
    title: "Resolve",
    description: "Maintenance teams track work orders through completion.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#101317] text-[#F4E9D0]">
      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-50 border-b border-white/10">
        <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-6 md:px-10 xl:px-16">
          <Link href="/" onClick={closeMenu}>
  <BrandLogo />
</Link>

          <nav className="hidden items-center gap-9 lg:flex">
            <a href="#platform" className="text-[12px] text-[#B5B6B2] transition hover:text-[#C8A96B]">Platform</a>
            <a href="#capabilities" className="text-[12px] text-[#B5B6B2] transition hover:text-[#C8A96B]">Capabilities</a>
            <a href="#workflow" className="text-[12px] text-[#B5B6B2] transition hover:text-[#C8A96B]">How it works</a>
            <a href="#impact" className="text-[12px] text-[#B5B6B2] transition hover:text-[#C8A96B]">Our vision</a>
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <Link href="/dashboard" className="text-[12px] text-[#C4C3BD] transition hover:text-white">
              Platform login
            </Link>
            <a href="#contact" className="group flex items-center gap-3 bg-[#C8A96B] px-5 py-3 text-[11px] font-semibold tracking-wide text-[#101317] transition hover:bg-[#E0C58E]">
              Explore platform
              <ArrowUpRight size={15} />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center sm:h-10 sm:w-10 justify-center border border-white/15 text-[#F4E9D0] lg:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#15191E] px-6 py-6 lg:hidden">
            <nav className="flex flex-col gap-5">
              <a onClick={closeMenu} href="#platform" className="text-sm text-[#D7D2C7]">Platform</a>
              <a onClick={closeMenu} href="#capabilities" className="text-sm text-[#D7D2C7]">Capabilities</a>
              <a onClick={closeMenu} href="#workflow" className="text-sm text-[#D7D2C7]">How it works</a>
              <a onClick={closeMenu} href="#impact" className="text-sm text-[#D7D2C7]">Our vision</a>
              <Link onClick={closeMenu} href="/dashboard" className="border border-[#C8A96B]/50 px-4 py-3 text-center text-sm text-[#C8A96B]">
                Platform login
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[760px] items-center pt-[82px] md:min-h-[850px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2400&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101317] via-[#101317]/90 to-[#101317]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101317] via-transparent to-[#101317]/30" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#C8A96B]/50 to-transparent" />

        <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-16 px-6 pb-28 pt-24 md:px-10 lg:grid-cols-12 lg:px-16">
          <div className="lg:col-span-8 xl:col-span-7">
            <div className="mb-8 flex items-center gap-3">
              <span className="h-px w-10 bg-[#C8A96B]" /><span className="h-1.5 w-1.5 rounded-full bg-[#A33A3A]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#C8A96B]">
                Intelligent road infrastructure
              </span>
            </div>

            <h1 className="max-w-[850px] font-serif text-[48px] leading-[1.08] tracking-[-0.035em] text-[#F4E9D0] sm:text-[62px] md:text-[76px] xl:text-[88px]">
              Building better
              <br />
              roads through
              <br />
              <span className="italic text-[#C8A96B]">intelligence.</span>
            </h1>

            <div className="mb-7 mt-7 flex items-center gap-3">
              <span className="h-[3px] w-16 bg-[#A33A3A]" />
              <span className="h-[3px] w-5 bg-[#C8A96B]" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#A33A3A]">Intelligence for safer roads</span>
            </div>

            <p className="mt-8 max-w-[530px] text-[14px] leading-8 text-[#C0C0B9] md:text-[15px]">
              A smarter approach to road infrastructure. Detect road damage,
              understand its location and coordinate maintenance through one
              connected intelligence platform.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a href="#platform" className="group flex items-center justify-center gap-5 bg-[#C8A96B] px-7 py-4 text-[11px] font-semibold tracking-wide text-[#101317] transition hover:bg-[#E0C58E]">
                Discover the platform
                <ArrowUpRight size={16} />
              </a>
              <Link href="/dashboard" className="flex items-center justify-center gap-4 border border-white/25 px-7 py-4 text-[11px] font-medium tracking-wide text-[#F4E9D0] transition hover:border-[#C8A96B] hover:text-[#C8A96B]">
                Explore dashboard
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/15 pt-7">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#C8A96B]" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#A5AAA9]">AI-powered detection</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#A33A3A]" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#A5AAA9]">Location intelligence</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:col-span-4 lg:flex lg:justify-end xl:col-span-5">
            <div className="w-full max-w-[300px] border border-white/20 border-t-[3px] border-t-[#A33A3A] border-l-[2px] border-l-[#A33A3A]/70 bg-[#101317]/65 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#AEB3B1]">Platform overview</span>
                <Activity size={16} className="text-[#C8A96B]" />
              </div>
              <div className="py-8">
                <p className="font-serif text-4xl text-[#F4E9D0]">01<span className="text-[#C8A96B]">.</span></p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#AEB3B1]">Connected intelligence</p>
                <p className="mt-5 text-xs leading-6 text-[#B8BBB6]">
                  From initial detection to verified maintenance resolution.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-white/15 pt-4">
                <span className="text-[9px] tracking-[0.15em] text-[#AEB3B1]">ROAD INFRASTRUCTURE</span>
                <span className="text-[9px] text-[#C8A96B]">POTHOLEVISION</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden items-center gap-4 lg:flex">
          <span className="text-[9px] uppercase tracking-[0.22em] text-white/45">Scroll to explore</span>
          <div className="h-10 w-px bg-[#C8A96B]/70" />
        </div>
      </section>

      {/* Intro */}
      <section id="platform" className="bg-[#F4E9D0] py-24 text-[#171B1F] md:py-32">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-6 md:px-10 lg:grid-cols-12 lg:px-16">
          <div className="lg:col-span-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#947747]">01 / The platform</p>
            <h2 className="mt-7 font-serif text-[42px] leading-[1.12] tracking-[-0.03em] md:text-[56px]">
              Roads deserve
              <br />
              <span className="italic text-[#9B7941]">better intelligence.</span>
            </h2>
          </div>
          <div className="flex flex-col justify-end lg:col-span-6 lg:col-start-7">
            <p className="text-[15px] leading-8 text-[#55534D]">
              Road damage is more than a surface problem. It affects mobility,
              safety and the way communities connect. PotholeVision brings
              detection, location data and maintenance coordination into a
              unified infrastructure workflow.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <span className="h-px w-12 bg-[#A33A3A]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6D6250]">
                From road data to meaningful action
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="bg-[#151A20] py-24 md:py-32">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C8A96B]">02 / Core capabilities</p>
              <h2 className="mt-6 max-w-[650px] font-serif text-[42px] leading-[1.13] tracking-[-0.03em] text-[#F4E9D0] md:text-[58px]">
                One platform.
                <br />
                <span className="italic text-[#C8A96B]">Connected possibilities.</span>
              </h2>
            </div>
            <p className="max-w-[330px] text-[13px] leading-7 text-[#9DA4A7]">
              Technology designed to help infrastructure teams see problems
              clearly and manage the response with confidence.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 border-l border-t border-white/10 sm:grid-cols-2">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.number} className="group border-b border-r border-white/10 p-8 transition duration-300 hover:bg-white/[0.025] md:p-10">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] tracking-[0.2em] ${item.number === "02" ? "text-[#A33A3A]" : "text-[#C8A96B]"}`}>{item.number}</span>
                    <Icon size={23} strokeWidth={1.3} className="text-[#C8A96B] transition group-hover:-translate-y-1" />
                  </div>
                  <h3 className="mt-12 font-serif text-[27px] text-[#F4E9D0]">{item.title}</h3>
                  <p className="mt-4 max-w-[420px] text-[13px] leading-7 text-[#9DA4A7]">{item.description}</p>
                  <div className="mt-8 h-px w-10 bg-[#A33A3A] transition-all group-hover:w-20" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <AIShowcase />
      {/* Workflow */}
      <section id="workflow" className="relative overflow-hidden bg-[#101317] py-28 md:py-36">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#A33A3A]/10" />

        <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-[760px]">
              <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C8A96B]">
                <span className="h-[2px] w-8 bg-[#A33A3A]" />
                03 / How it works
              </p>

              <h2 className="mt-7 font-serif text-[43px] leading-[1.12] tracking-[-0.035em] text-[#F4E9D0] md:text-[64px]">
                From road damage
                <br />
                <span className="italic text-[#C8A96B]">to meaningful action.</span>
              </h2>
            </div>

            <p className="max-w-[390px] pb-2 text-[13px] leading-7 text-[#AEB4B7]">
              One connected process brings road observations, location data,
              field inspections and maintenance teams together.
            </p>
          </div>

          <div className="relative mt-14 grid grid-cols-2 gap-0 lg:mt-16 lg:grid-cols-4">
            {workflow.map((step, index) => {
              const icons = [ScanLine, MapPinned, ClipboardCheck, ShieldCheck];
              const StepIcon = icons[index];

              return (
                <div
                  key={step.number}
                  className="group relative border-t border-white/10 px-3 py-5 transition-colors duration-300 hover:bg-white/[0.025] sm:px-5 sm:py-6 lg:border-l lg:border-t-0 lg:px-6 lg:py-6 first:lg:border-l-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-[25px] text-[#C8A96B]/80 sm:text-[30px]">
                      {step.number}
                    </span>
                    <div className="flex h-9 w-9 items-center sm:h-10 sm:w-10 justify-center border border-[#C8A96B]/25 text-[#C8A96B] transition-colors duration-300 group-hover:border-[#A33A3A]/70 group-hover:text-[#A33A3A]">
                      <StepIcon size={19} strokeWidth={1.4} />
                    </div>
                  </div>

                  <h3 className="mt-5 font-serif text-[21px] sm:mt-7 sm:text-[25px] text-[#F4E9D0]">
                    {step.title}
                  </h3>

                  <p className="mt-2 min-h-[72px] max-w-[240px] text-[11px] leading-5 sm:mt-3 sm:min-h-[56px] sm:text-[12px] sm:leading-6 text-[#9DA6AA]">
                    {step.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2">
                    <span className="h-[2px] w-7 bg-[#A33A3A]" />
                    <span className="h-px w-7 bg-[#C8A96B]/50" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
            <p className="text-[9px] uppercase tracking-[0.18em] text-[#8B969E]">
              One connected road intelligence ecosystem
            </p>
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.16em] text-[#C8A96B]">
              <span className="h-2 w-2 rounded-full bg-[#A33A3A]" />
              Detection to resolution
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="relative overflow-hidden bg-[#F4E9D0] py-24 text-[#171B1F] md:py-32">
        <div className="absolute -right-24 -top-24 h-[450px] w-[450px] rounded-full border border-[#A58C5D]/15" />
        <div className="absolute -right-12 -top-12 h-[330px] w-[330px] rounded-full border border-[#A58C5D]/15" />
        <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-6 md:px-10 lg:grid-cols-12 lg:px-16">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#947747]">04 / Our vision</p>
            <h2 className="mt-7 max-w-[720px] font-serif text-[44px] leading-[1.1] tracking-[-0.035em] md:text-[64px]">
              Better road data.
              <br />
              <span className="italic text-[#9B7941]">Better decisions.</span>
              <br />
              Safer journeys.
            </h2>
            <p className="mt-8 max-w-[550px] text-[14px] leading-8 text-[#55534D]">
              We envision a future where road infrastructure can be monitored,
              understood and maintained through connected data and intelligent
              operations.
            </p>
          </div>
          <div className="grid content-center gap-8 border-t border-[#B8A987] pt-8 lg:col-span-4 lg:col-start-9 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div>
              <BrainCircuit size={25} className="text-[#9B7941]" strokeWidth={1.4} />
              <h3 className="mt-4 font-serif text-[22px]">Intelligence first</h3>
              <p className="mt-2 text-[12px] leading-6 text-[#686257]">Turn observations into structured infrastructure information.</p>
            </div>
            <div>
              <Workflow size={25} className="text-[#9B7941]" strokeWidth={1.4} />
              <h3 className="mt-4 font-serif text-[22px]">Connected operations</h3>
              <p className="mt-2 text-[12px] leading-6 text-[#686257]">Bring detection, inspection and maintenance into one workflow.</p>
            </div>
            <div>
              <ShieldCheck size={25} className="text-[#9B7941]" strokeWidth={1.4} />
              <h3 className="mt-4 font-serif text-[22px]">Safer infrastructure</h3>
              <p className="mt-2 text-[12px] leading-6 text-[#686257]">Support more informed road maintenance decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="relative overflow-hidden bg-[#101317] py-24 md:py-32">
        <div className="absolute inset-0 opacity-[0.13]" style={{ backgroundImage: "linear-gradient(115deg, transparent 48%, #C8A96B 48.1%, transparent 48.3%), linear-gradient(25deg, transparent 65%, #C8A96B 65.1%, transparent 65.3%)" }} />
        <div className="relative mx-auto flex max-w-[1440px] flex-col justify-between gap-12 px-6 md:px-10 lg:flex-row lg:items-end lg:px-16">
          <div className="max-w-[720px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C8A96B]">PotholeVision / The next step</p>
            <h2 className="mt-7 font-serif text-[44px] leading-[1.1] text-[#F4E9D0] md:text-[66px]">
              Make every road
              <br />
              <span className="italic text-[#C8A96B]">count.</span>
            </h2>
            <p className="mt-6 max-w-[500px] text-[13px] leading-7 text-[#AEB4B7]">
              Explore the PotholeVision platform and discover a more connected
              approach to road infrastructure management.
            </p>
          </div>
          <Link href="/dashboard" className="group inline-flex w-fit items-center gap-8 border border-[#C8A96B] px-7 py-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C8A96B] transition hover:bg-[#C8A96B] hover:text-[#101317]">
            Enter the platform
            <ArrowUpRight size={17} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0C0F12]">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-10 px-6 py-12 md:px-10 lg:flex-row lg:items-center lg:px-16">
          <Link href="/">
  <BrandLogo compact />
</Link>

          <div className="flex flex-wrap gap-x-7 gap-y-3 text-[10px] text-[#8B969E]">
            <a href="#platform" className="transition hover:text-[#C8A96B]">Platform</a>
            <a href="#capabilities" className="transition hover:text-[#C8A96B]">Capabilities</a>
            <a href="#workflow" className="transition hover:text-[#C8A96B]">Workflow</a>
            <Link href="/dashboard" className="transition hover:text-[#C8A96B]">Dashboard</Link>
          </div>

          <p className="text-[10px] text-[#68727A]">© {new Date().getFullYear()} PotholeVision. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}







