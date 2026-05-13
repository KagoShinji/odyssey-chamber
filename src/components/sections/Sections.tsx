import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Lightbulb, Shield, Target, Users, TrendingUp, Building2,
  Landmark, Handshake, Megaphone, Globe, CheckCircle2, ArrowUpRight
} from "lucide-react";
import { Button } from "../ui/button";

const spring: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.75, delay: i * 0.09, ease: [0.32, 0.72, 0, 1] }
  }),
};

/* ═══════════════════════════════════════════
   ABOUT SECTION — Z-Axis offset asymmetry
═══════════════════════════════════════════ */
export const AboutSection: React.FC = () => (
  <section className="py-32 bg-[#fafafa]" aria-label="About the Chamber">
    <div className="container mx-auto px-4 md:px-10 max-w-7xl">
      {/* Left-aligned header — breaks center bias */}
      <div className="max-w-2xl mb-16">
        <motion.span
          custom={0} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="label-pill mb-5 inline-flex"
        >
          About Us
        </motion.span>
        <motion.h2
          custom={1} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-[clamp(2rem,4vw,3.5rem)] font-heading font-black text-[#0D1117] leading-tight"
        >
          Championing business excellence in Talisay
        </motion.h2>
      </div>

      {/* Asymmetric grid: 55/45 */}
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-start">

        {/* Left: prose + buttons */}
        <div>
          <motion.p custom={2} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-[1.0625rem] text-gray-600 mb-4 leading-[1.8] max-w-[58ch]">
            The City of Talisay Chamber of Commerce, Trade and Industry Inc. is the premier
            business networking organization dedicated to fostering economic vitality and
            supporting local enterprises since 1998.
          </motion.p>
          <motion.p custom={3} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-gray-500 mb-10 leading-[1.8] max-w-[58ch]">
            We bridge the business community and local government, ensuring policies support
            sustainable growth and innovation across every industry in Talisay.
          </motion.p>

          {/* Stat row */}
          <motion.div custom={4} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex flex-wrap gap-8 mb-10 pt-8 border-t border-gray-100">
            {[
              { num: "500+", label: "Active Members" },
              { num: "₱2B+", label: "Economic Impact" },
              { num: "27yrs", label: "Years of Service" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="text-2xl font-heading font-black text-[#0D1117] tabular-nums">{num}</div>
                <div className="text-xs text-gray-400 mt-1 font-medium tracking-wide uppercase">{label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div custom={5} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex gap-3">
            <button className="btn-premium bg-[#0D1117] hover:bg-navy-mid text-white shadow-navy-diffuse hover:-translate-y-0.5">
              Our History
              <span className="btn-icon-wrap !bg-white/10"><ArrowUpRight size={13} /></span>
            </button>
            <Button variant="ghost" className="rounded-full h-12 px-6 text-green-700 hover:bg-green-50 font-heading font-semibold cursor-pointer spring-fast">
              Meet the Board
            </Button>
          </motion.div>
        </div>

        {/* Right: 2×2 spotlight cards — offset stagger */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Lightbulb, title: "Our Vision", color: "#166534", bg: "bg-green-50",
              text: "A progressive, globally competitive, and sustainable business community in Talisay." },
            { icon: Shield, title: "Our Mission", color: "#1D4ED8", bg: "bg-blue-50",
              text: "Empower businesses through advocacy, networking, and strategic partnerships.", offset: true },
            { icon: Target, title: "Core Values", color: "#92400E", bg: "bg-amber-50",
              text: "Integrity, excellence, innovation, collaboration, and community guide everything we do.", offset: false },
            { icon: Users, title: "Our Goal", color: "#6B21A8", bg: "bg-purple-50",
              text: "1,000 thriving local businesses by 2030 through programs, mentorship, and linkages.", offset: true },
          ].map(({ icon: Icon, title, color, bg, text, offset }, i) => (
            <motion.div
              key={title}
              custom={i} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className={`spotlight-card p-7 ${offset ? "sm:mt-8" : ""}`}
            >
              <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center mb-5`} style={{ color }}>
                <Icon size={20} />
              </div>
              <h3 className="font-heading font-bold text-[#0D1117] text-[1.0625rem] mb-2 leading-snug">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════
   SERVICES — Bento asymmetric grid
   Replaces generic 3-column equal layout
═══════════════════════════════════════════ */
const services = [
  { icon: Users,       title: "Business Networking",   desc: "Connect with Talisay's top entrepreneurs, industry leaders, and decision-makers at curated events.", span: "lg:col-span-2" },
  { icon: TrendingUp,  title: "Investment Promotion",  desc: "Positioning Talisay as Cebu's premier investment corridor for local and foreign capital.", span: "" },
  { icon: Building2,   title: "Business Registration", desc: "Streamlined permit assistance and licensing guidance for new and growing ventures.", span: "" },
  { icon: Megaphone,   title: "Trade Events & Expos",  desc: "High-impact local and national exhibitions that put your brand in front of decision-makers.", span: "" },
  { icon: Lightbulb,   title: "SME Support",           desc: "Incubation, mentorship, and funding connections for small and medium enterprises.", span: "lg:col-span-2" },
  { icon: Landmark,    title: "Legal & Compliance",    desc: "Stay current on government regulations, tax compliance, and business law changes.", span: "" },
  { icon: Globe,       title: "Marketing Access",      desc: "Amplify your brand via our digital platforms, publications, and partner networks.", span: "" },
  { icon: Handshake,   title: "Partnership Programs",  desc: "Strategic alliances between businesses, LGUs, DTI, and national organizations.", span: "" },
  { icon: Shield,      title: "Community Outreach",    desc: "CSR programs and community development led by our member businesses.", span: "" },
];

export const ServicesSection: React.FC = () => (
  <section className="py-32 bg-white relative overflow-hidden" aria-label="Services">
    {/* Background gradient accent */}
    <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-green-50/60 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" aria-hidden="true" />

    <div className="relative container mx-auto px-4 md:px-10 max-w-7xl">
      {/* Left-aligned header */}
      <div className="max-w-xl mb-16">
        <motion.span custom={0} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="label-pill mb-5 inline-flex">What We Do</motion.span>
        <motion.h2 custom={1} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-[clamp(1.875rem,3.5vw,3rem)] font-heading font-black text-[#0D1117] mb-4">
          Comprehensive business services
        </motion.h2>
        <motion.p custom={2} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-gray-500 text-[1.0625rem] leading-relaxed">
          We equip members with tools, resources, and connections to thrive in today's market.
        </motion.p>
      </div>

      {/* Bento grid — asymmetric */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(({ icon: Icon, title, desc, span }, i) => (
          <motion.div
            key={title}
            custom={i} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className={`group spotlight-card p-8 cursor-pointer ${span}`}
          >
            <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100/80 flex items-center justify-center text-gray-400 mb-6 spring group-hover:bg-green-700 group-hover:border-green-700 group-hover:text-white">
              <Icon size={20} />
            </div>
            <h3 className="font-heading font-bold text-[#0D1117] text-[1.0625rem] mb-2 leading-snug">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            <div className="mt-5 flex items-center gap-1.5 text-xs font-heading font-semibold text-gray-300 group-hover:text-green-600 spring">
              Learn more <ArrowUpRight size={12} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════
   MEMBERSHIP — Premium pricing with emphasis
   Replaces generic 3-tower identical layout
═══════════════════════════════════════════ */
const plans = [
  {
    name: "Individual",
    price: "₱1,500",
    period: "/yr",
    desc: "For solo entrepreneurs starting their journey.",
    features: ["Networking access", "Event invitations", "Member directory listing"],
    highlight: false,
  },
  {
    name: "SME",
    price: "₱5,000",
    period: "/yr",
    desc: "Most popular for growing small and medium businesses.",
    features: ["All Individual benefits", "Business promotion", "Training & seminars access", "Priority support"],
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Corporate",
    price: "₱15,000",
    period: "/yr",
    desc: "For established corporations seeking maximum visibility.",
    features: ["All SME benefits", "Board meeting access", "Co-branding rights", "VIP event seating"],
    highlight: false,
  },
];

export const MembershipSection: React.FC = () => (
  <section className="py-32 bg-[#fafafa]" aria-label="Membership plans">
    <div className="container mx-auto px-4 md:px-10 max-w-6xl">
      <div className="text-center max-w-xl mx-auto mb-16">
        <motion.span custom={0} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="label-pill mb-5 inline-flex">Membership</motion.span>
        <motion.h2 custom={1} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-[clamp(1.875rem,3.5vw,3rem)] font-heading font-black text-[#0D1117] mb-4">
          Join the Chamber today
        </motion.h2>
        <motion.p custom={2} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-gray-500 leading-relaxed">
          Choose a plan and unlock Talisay's most powerful business network.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 items-start">
        {plans.map(({ name, price, period, desc, features, highlight, badge }, i) => (
          <motion.div
            key={name}
            custom={i} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className={`relative rounded-[2rem] p-8 flex flex-col spring-fast ${
              highlight
                ? "bg-green-700 shadow-diffuse-lg scale-[1.03]"
                : "bg-white spotlight-card"
            }`}
          >
            {badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-white text-[10px] font-heading font-bold rounded-full tracking-widest uppercase shadow-sm">
                {badge}
              </div>
            )}

            {/* Plan name */}
            <div className={`text-[10px] font-heading font-bold uppercase tracking-[0.2em] mb-3 ${highlight ? "text-green-200" : "text-gray-400"}`}>
              {name}
            </div>

            {/* Price */}
            <div className="flex items-end gap-1.5 mb-2">
              <span className={`text-[2.75rem] font-heading font-black leading-none ${highlight ? "text-white" : "text-[#0D1117]"}`}>
                {price}
              </span>
              <span className={`text-sm mb-1 ${highlight ? "text-green-200" : "text-gray-400"}`}>{period}</span>
            </div>

            {/* Desc */}
            <p className={`text-sm mb-6 leading-relaxed ${highlight ? "text-green-100" : "text-gray-400"}`}>{desc}</p>

            {/* Features */}
            <ul className="space-y-2.5 flex-1 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 size={14} className={`mt-0.5 flex-shrink-0 ${highlight ? "text-green-300" : "text-green-600"}`} />
                  <span className={highlight ? "text-green-50" : "text-gray-600"}>{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              className={`btn-premium justify-center w-full spring-fast ${
                highlight
                  ? "bg-white text-green-700 hover:bg-green-50 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
                  : "bg-[#0D1117] text-white hover:bg-navy-mid shadow-navy-diffuse"
              }`}
            >
              Get Started
              <span className={`btn-icon-wrap ${highlight ? "!bg-green-100/60" : "!bg-white/10"}`}>
                <ArrowUpRight size={13} />
              </span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
