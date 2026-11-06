"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Cpu,
  Gauge,
  MapPin,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

const detections = [
  { id: "01", name: "Pothole detected", confidence: "95%", severity: "HIGH", position: "left-[12%] top-[35%] w-[34%] h-[35%]" },
  { id: "02", name: "Surface damage", confidence: "86%", severity: "MEDIUM", position: "left-[53%] top-[18%] w-[23%] h-[25%]" },
  { id: "03", name: "Road defect", confidence: "78%", severity: "LOW", position: "right-[8%] top-[48%] w-[19%] h-[23%]" },
];

export default function AIShowcase() {
  return (
    <section className="relative overflow-hidden bg-[#151A20] py-24 md:py-32">
      <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-[#A33A3A]/15" />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">

        <div className="mb-14 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-10 bg-[#A33A3A]" />
            <span className="text-[10px] uppercase tracking-[0.27em] text-[#C8A96B]">
              05 / Intelligence in action
            </span>
          </div>
          <span className="border border-[#A33A3A]/40 px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-[#C98B8B]">
            Product demonstration
          </span>
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-12">

          <div className="lg:col-span-5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#A33A3A]">
              Computer vision / Road inspection
            </p>

            <h2 className="mt-6 font-serif text-[43px] leading-[1.12] tracking-tight text-[#F4E9D0] md:text-[56px]">
              See the damage.
              <br />
              <span className="italic text-[#C8A96B]">
                Understand the road.
              </span>
            </h2>

            <p className="mt-7 max-w-[440px] text-[13px] leading-8 text-[#AEB4B7]">
              Transform road imagery into structured infrastructure
              intelligence. Identify surface defects, understand their
              location and support informed maintenance decisions.
            </p>

            <div className="mt-10 space-y-7">
              {[
                {
                  icon: ScanLine,
                  title: "AI-powered detection",
                  description: "Identify visible potholes and road surface defects.",
                },
                {
                  icon: MapPin,
                  title: "Geographic intelligence",
                  description: "Connect road damage with location and inspection records.",
                },
                {
                  icon: Activity,
                  title: "Maintenance intelligence",
                  description: "Turn inspection findings into actionable workflows.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#A33A3A]/40 bg-[#A33A3A]/10 text-[#C8A96B]">
                      <Icon size={19} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold text-[#F4E9D0]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-[11px] leading-6 text-[#929DA2]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <a
              href="#workflow"
              className="mt-10 inline-flex items-center gap-4 bg-[#A33A3A] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FFF3E9] transition hover:bg-[#8F3030]"
            >
              Explore the workflow
              <ArrowUpRight size={15} />
            </a>
          </div>

          <div className="lg:col-span-7">
            <div className="overflow-hidden border border-white/15 bg-[#101317] shadow-2xl">

              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#A33A3A]" />
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#D6D0C5]">
                    Visual inspection preview
                  </span>
                </div>
                <span className="flex items-center gap-2 text-[9px] text-[#C8A96B]">
                  <Cpu size={13} />
                  DEMO MODE
                </span>
              </div>

              <div className="relative aspect-[1.4] overflow-hidden bg-[#30363B]">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "linear-gradient(0deg,rgba(8,12,15,.55),rgba(8,12,15,.12)),url('/images/pothole-road.jpg')",
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#101317]/50 to-transparent" />

                <div className="absolute left-4 top-4 border border-white/20 bg-[#101317]/85 px-3 py-2">
                  <span className="text-[9px] uppercase tracking-[0.13em] text-white">
                    Road damage analysis
                  </span>
                </div>

                {detections.map((item) => (
                  <div
                    key={item.id}
                    className={`absolute ${item.position} border-2 border-[#A33A3A]`}
                  >
                    <div className="absolute -top-[23px] left-[-2px] flex whitespace-nowrap">
                      <span className="bg-[#A33A3A] px-2 py-1 text-[8px] font-semibold text-white">
                        {item.name}
                      </span>
                      <span className="bg-[#C8A96B] px-2 py-1 text-[8px] font-semibold text-[#101317]">
                        {item.confidence}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="absolute bottom-4 left-4 flex items-center gap-2 border border-white/15 bg-[#101317]/85 px-3 py-2">
                  <ShieldCheck size={13} className="text-[#C8A96B]" />
                  <span className="text-[8px] uppercase tracking-wider text-[#F4E9D0]">
                    Illustrative detection
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
                {[
                  { label: "Observations", value: "03", icon: ScanLine },
                  { label: "Max confidence", value: "95%", icon: Gauge },
                  { label: "Priority", value: "High", icon: AlertTriangle },
                  { label: "Location", value: "GPS-linked", icon: MapPin },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="p-4 sm:p-5">
                      <Icon size={15} className="text-[#C8A96B]" />
                      <p className="mt-3 font-serif text-xl text-[#F4E9D0]">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[8px] uppercase tracking-wider text-[#8B969E]">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-3 text-right text-[9px] text-[#748087]">
              Conceptual interface · Sample values · Not live model output
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

