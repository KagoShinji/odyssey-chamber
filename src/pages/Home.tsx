import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import HeroSection from "../components/sections/HeroSection";
import { AboutSection, ServicesSection, MembershipSection } from "../components/sections/Sections";
import { EventsSection, NewsSection, CtaSection } from "../components/sections/MoreSections";

const GrainOverlay: React.FC = () => (
  <div className="grain-overlay" aria-hidden="true" />
);

const partners = [
  "DTI Region VII", "DICT Philippines", "Cebu Chamber of Commerce",
  "SM Talisay City", "BDO Unibank", "Philippine Chamber of Commerce",
  "Talisay City LGU", "UnionBank Philippines", "Go Negosyo", "DOLE Cebu",
  "PCCI", "SB Corp", "Cebu City Government",
];

const PartnersSection: React.FC = () => (
  <section className="py-16 bg-[#fffdf8] border-y border-[#eadfcb] overflow-hidden" aria-label="Partners and affiliates">
    <div className="container mx-auto px-4 md:px-10 max-w-7xl mb-7 flex items-center justify-between">
      <span className="text-[10px] font-heading font-bold text-gray-300 tracking-[0.22em] uppercase">
        Trusted Partners & Affiliates
      </span>
      <div className="h-px flex-1 bg-gray-100 ml-6" />
    </div>
    <div className="relative overflow-hidden">
      {/* Edge fades */}
      <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" aria-hidden="true" />
      <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" aria-hidden="true" />
      <div className="marquee-track">
        {[...partners, ...partners].map((p, i) => (
          <div
            key={`${p}-${i}`}
        className="flex-shrink-0 mx-4 px-5 py-2.5 rounded-2xl border border-[#eadfcb] bg-white/75 text-[#6d746f] text-[13px] font-heading font-semibold whitespace-nowrap hover:border-gold/35 hover:text-green-brand hover:bg-[#fff8e8] spring-fast cursor-default"
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const testimonials = [
  {
    name: "Maria Santos",
    role: "CEO, Santos Trading Co.",
    text: "Joining the Talisay Chamber was the best business decision I made. The networking events alone opened doors I never thought possible.",
    initials: "MS",
    color: "from-green-700 to-emerald-600",
  },
  {
    name: "Engr. Carlo Reyes",
    role: "Founder, CR Construction & Dev",
    text: "The Chamber's advocacy work with city government has dramatically improved the ease of doing business here in Talisay.",
    initials: "CR",
    color: "from-emerald-900 to-green-700",
  },
  {
    name: "Grace Lim",
    role: "Owner, Graceland Restaurant Group",
    text: "From registration guidance to trade expo participation, the Chamber gives us access and visibility we couldn't achieve alone.",
    initials: "GL",
    color: "from-amber-600 to-orange-500",
  },
  {
    name: "Atty. Ramon Cruz",
    role: "Managing Partner, Cruz & Reyes Law",
    text: "The legal compliance workshops have saved my clients thousands of pesos in penalties. Invaluable membership for any Talisay business.",
    initials: "RC",
    color: "from-stone-800 to-green-900",
  },
  {
    name: "Dra. Yvonne Tan",
    role: "Director, Talisay Medical Center",
    text: "Being a Chamber member opened the door to healthcare partnerships and community health programs I didn't know were possible.",
    initials: "YT",
    color: "from-gold to-amber-700",
  },
];

const TestimonialsSection: React.FC = () => (
  <section className="py-32 bg-[#0D1A14] relative overflow-hidden" aria-label="Member testimonials">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-800/40 to-transparent" aria-hidden="true" />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-800/40 to-transparent" aria-hidden="true" />
    <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-green-900/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

    <div className="container mx-auto px-4 md:px-10 max-w-7xl mb-16 text-center">
      <span className="label-pill !bg-green-900/50 !text-green-300 !border-green-700/40 mb-5 inline-flex">Member Stories</span>
      <h2 className="text-[clamp(1.875rem,3.5vw,3rem)] font-heading font-black text-white">
        What our members say
      </h2>
    </div>

    {/* Row 1: 3 cards. Row 2: 2 cards centered. */}
    <div className="container mx-auto px-4 md:px-10 max-w-7xl space-y-4">
      {/* First row: 3 cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.slice(0, 3).map(({ name, role, text, initials, color }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-[2rem] p-7 border border-white/10 bg-white/[0.035] hover:bg-white/[0.07] spring cursor-default flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <div className="text-4xl font-serif text-green-900/60 leading-none mb-4 select-none">"</div>
            <p className="text-slate-300 leading-[1.8] mb-6 text-[15px] flex-1">{text}</p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-heading font-bold flex-shrink-0`}>
                {initials}
              </div>
              <div>
                <div className="font-heading font-semibold text-white text-sm leading-tight">{name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Second row: 2 cards centered using max-w + mx-auto */}
      <div className="grid md:grid-cols-2 gap-4 max-w-[calc(66.66%+0.5rem)] mx-auto lg:max-w-[66.66%]">
        {testimonials.slice(3, 5).map(({ name, role, text, initials, color }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: (i + 3) * 0.1, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-[2rem] p-7 border border-white/10 bg-white/[0.035] hover:bg-white/[0.07] spring cursor-default flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <div className="text-4xl font-serif text-green-900/60 leading-none mb-4 select-none">"</div>
            <p className="text-slate-300 leading-[1.8] mb-6 text-[15px] flex-1">{text}</p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-heading font-bold flex-shrink-0`}>
                {initials}
              </div>
              <div>
                <div className="font-heading font-semibold text-white text-sm leading-tight">{name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 w-11 h-11 bg-green-700 hover:bg-green-600 text-white rounded-2xl shadow-diffuse-lg flex items-center justify-center z-[80] cursor-pointer spring-fast hover:-translate-y-0.5 active:scale-95"
          aria-label="Scroll back to top"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const Home: React.FC = () => (
  <>
    <GrainOverlay />
    <div className="flex flex-col w-full">
      <HeroSection />
      <PartnersSection />
      <AboutSection />
      <ServicesSection />
      <TestimonialsSection />
      <MembershipSection />
      <EventsSection />
      <NewsSection />
      <CtaSection />
    </div>
    <BackToTop />
  </>
);

export default Home;
