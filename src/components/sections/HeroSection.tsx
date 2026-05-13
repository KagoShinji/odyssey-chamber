import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, Briefcase, CheckCircle2, TrendingUp, Users } from "lucide-react";

/* ─── Animated counter ─── */
const useCounter = (target: number, duration = 2200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame = 0;
    const totalFrames = Math.round((duration / 1000) * 60);
    const step = () => {
      frame++;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (frame < totalFrames) requestAnimationFrame(step);
      else setCount(target);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
};

/* ─── Stat pill ─── */
const StatPill: React.FC<{ value: number; suffix: string; prefix?: string; label: string; icon: React.ElementType }> = ({
  value, suffix, prefix = "", label, icon: Icon,
}) => {
  const count = useCounter(value);
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="w-9 h-9 rounded-xl bg-green-700/30 border border-green-500/30 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-green-300" />
      </div>
      <div>
        <div className="text-xl font-heading font-bold text-white leading-none tabular-nums">
          {prefix}{count}{suffix}
        </div>
        <div className="text-[11px] text-green-200/70 mt-0.5 font-medium tracking-wide">{label}</div>
      </div>
    </div>
  );
};

/* ─── Floating badge card ─── */
const FloatingCard: React.FC = () => (
  <motion.div
    animate={{ y: [-10, 6, -10] }}
    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
    className="absolute -bottom-8 -left-10 z-20"
    aria-hidden="true"
  >
    {/* Double-bezel floating card */}
    <div className="bezel-outer shadow-diffuse-lg">
      <div className="bezel-inner px-5 py-4 flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-[calc(2rem-5px)] bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-diffuse">
            <Briefcase size={18} className="text-white" />
          </div>
          {/* Pulse ring */}
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white">
            <span className="absolute inset-0 rounded-full bg-green-400 animate-pulse-ring" />
          </span>
        </div>
        <div>
          <div className="font-heading font-bold text-gray-900 text-sm leading-tight">Local Business Growth</div>
          <div className="text-xs text-gray-500 mt-0.5">Driving Talisay's economy since 1998</div>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ─── Decorative mesh blobs ─── */
const MeshBlobs: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-radial from-green-900/40 to-transparent blur-3xl" />
    <div className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-radial from-emerald-950/50 to-transparent blur-3xl" />
    <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-green-800/20 blur-3xl animate-float-y" />
  </div>
);

/* ─── Trust badge row ─── */
const badges = ["DTI Accredited", "SEC Registered", "LGU-Endorsed", "PCCI Member"];

/* ─── Entry variants ─── */
const containerV: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] } },
};

/* ─── Hero Section ─── */
const HeroSection: React.FC = () => (
  <section
    className="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#0D1117]"
    aria-label="Hero – Talisay Chamber of Commerce"
  >
    {/* Background photo */}
    <div
      className="absolute inset-0 bg-cover bg-center opacity-[0.18]"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')" }}
      aria-hidden="true"
    />
    {/* Gradient vignette */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0D1117]/90 to-green-950/40" aria-hidden="true" />
    <MeshBlobs />

    <div className="relative z-10 container mx-auto px-4 md:px-10 max-w-7xl pt-28 pb-20">
      {/* ─── Asymmetric 60/40 grid ─── */}
      <div className="grid lg:grid-cols-[1fr_0.75fr] gap-16 xl:gap-24 items-center">

        {/* LEFT — Content */}
        <motion.div
          variants={containerV}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.div variants={itemV}>
            <span className="label-pill mb-6 inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
              Official Business Organization · Est. 1998
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={itemV}
            className="text-[clamp(2.75rem,6vw,5.25rem)] font-heading font-black text-white leading-[1.0] tracking-[-0.03em] mb-6"
          >
            Empowering{" "}
            <span className="gradient-text-green relative">
              Businesses
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M0 6 Q50 2 100 5 Q150 8 200 4" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" fill="none"
                  style={{ strokeDasharray: 1000, strokeDashoffset: 1000, animation: "drawLine 1.2s 0.8s cubic-bezier(0.32,0.72,0,1) forwards" }} />
              </svg>
            </span>
            {"."}<br />
            <span className="text-slate-300">Strengthening</span>{" "}
            <span className="text-white">Talisay.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={itemV}
            className="text-[1.0625rem] text-slate-400 max-w-[54ch] mb-10 leading-[1.75]"
          >
            The official business organization connecting entrepreneurs, industries, and
            opportunities in the City of Talisay — powering a stronger local economy.
          </motion.p>

          {/* CTAs — Button-in-Button pattern */}
          <motion.div variants={itemV} className="flex flex-wrap gap-4 mb-12">
            <button className="btn-premium bg-green-700 hover:bg-green-600 text-white shadow-diffuse hover:shadow-diffuse-lg hover:-translate-y-0.5">
              Join the Chamber
              <span className="btn-icon-wrap !bg-white/15">
                <ArrowRight size={14} />
              </span>
            </button>
            <button className="btn-premium glass-dark text-white hover:-translate-y-0.5">
              Explore Services
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={itemV} className="flex flex-wrap gap-x-5 gap-y-2">
            {badges.map((b) => (
              <span key={b} className="flex items-center gap-1.5 text-[12px] text-slate-500 font-medium">
                <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                {b}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — Visual stack */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="relative hidden lg:block"
        >
          {/* Main image — double-bezel */}
          <div className="bezel-outer border-white/10 bg-white/5 shadow-navy-diffuse relative">
            <div className="bezel-inner rounded-[calc(2rem-5px)]">
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=1600&auto=format&fit=crop"
                alt="Business professionals networking at a Talisay Chamber event"
                className="w-full h-[420px] object-cover"
              />
              {/* Inner gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-green-950/50 via-transparent to-transparent" />
            </div>
          </div>

          {/* Floating card */}
          <FloatingCard />

          {/* Decorative rings */}
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full border border-green-800/40 pointer-events-none" />
          <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full border border-gold/30 pointer-events-none" />

          {/* Stats column — pinned right of image */}
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 translate-x-full pl-5">
            <StatPill value={500} suffix="+" label="Active Members" icon={Users} />
            <StatPill value={50} suffix="+" label="Events/Year" icon={TrendingUp} />
            <StatPill value={27} suffix="yrs" label="Of Service" icon={Briefcase} />
          </div>
        </motion.div>
      </div>
    </div>

    {/* Bottom fade */}
    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#fafafa] to-transparent" aria-hidden="true" />
  </section>
);

export default HeroSection;
