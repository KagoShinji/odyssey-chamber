import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { CalendarDays, MapPin, Clock, ArrowRight, Newspaper, ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";

const spring: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.75, delay: i * 0.09, ease: [0.32, 0.72, 0, 1] }
  }),
};

/* ═══════════════════════════════════════════
   EVENTS SECTION — Asymmetric feature layout
═══════════════════════════════════════════ */
const events = [
  {
    title: "Talisay Business Summit 2025",
    date: "June 20, 2025",
    time: "8:00 AM – 5:00 PM",
    venue: "Talisay City Hall Auditorium",
    tag: "Summit",
    tagColor: "bg-blue-100 text-blue-700",
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=900&auto=format&fit=crop",
    featured: true,
  },
  {
    title: "SME Financing & Investment Forum",
    date: "July 5, 2025",
    time: "1:00 PM – 6:00 PM",
    venue: "Cityland Commercial Center",
    tag: "Forum",
    tagColor: "bg-green-100 text-green-700",
    img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop",
    featured: false,
  },
  {
    title: "Annual Trade Expo & Bazaar",
    date: "August 12–14, 2025",
    time: "9:00 AM – 9:00 PM",
    venue: "Talisay Sports Complex",
    tag: "Expo",
    tagColor: "bg-amber-100 text-amber-700",
    img: "https://images.unsplash.com/photo-1473091534298-04dcbce3278c?q=80&w=600&auto=format&fit=crop",
    featured: false,
  },
];

export const EventsSection: React.FC = () => {
  const featured = events[0];
  const rest = events.slice(1);

  return (
    <section className="py-32 bg-[#fafafa]" aria-label="Upcoming events">
      <div className="container mx-auto px-4 md:px-10 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <motion.span custom={0} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="label-pill mb-5 inline-flex">Events & Seminars</motion.span>
            <motion.h2 custom={1} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-[clamp(1.875rem,3.5vw,3rem)] font-heading font-black text-[#0D1117]">
              Upcoming events
            </motion.h2>
          </div>
          <motion.div custom={2} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <button className="btn-premium bg-[#0D1117] text-white hover:-translate-y-0.5 shadow-navy-diffuse">
              View all events
              <span className="btn-icon-wrap !bg-white/10"><ArrowRight size={13} /></span>
            </button>
          </motion.div>
        </div>

        {/* Asymmetric layout: large featured card + stacked side cards */}
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-5">

          {/* Featured event — double-bezel */}
          <motion.article
            custom={0} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="bezel-outer shadow-diffuse cursor-pointer group"
          >
            <div className="bezel-inner flex flex-col h-full">
              <div className="relative h-64 overflow-hidden rounded-t-[calc(2rem-5px)]">
                <img src={featured.img} alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/70 to-transparent" />
                <span className={`absolute top-4 left-4 text-xs font-heading font-semibold px-3 py-1 rounded-full ${featured.tagColor}`}>
                  {featured.tag} · Featured
                </span>
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <h3 className="font-heading font-bold text-[#0D1117] text-xl mb-4 leading-snug group-hover:text-green-700 spring">
                  {featured.title}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-400 mb-6">
                  <span className="flex items-center gap-2"><CalendarDays size={13} className="text-green-600" />{featured.date}</span>
                  <span className="flex items-center gap-2"><Clock size={13} className="text-green-600" />{featured.time}</span>
                  <span className="flex items-center gap-2 col-span-2"><MapPin size={13} className="text-green-600" />{featured.venue}</span>
                </div>
                <div className="mt-auto">
                  <button className="btn-premium bg-green-700 hover:bg-green-600 text-white w-full justify-center shadow-diffuse hover:-translate-y-0.5">
                    Register Now
                    <span className="btn-icon-wrap !bg-white/15"><ArrowUpRight size={13} /></span>
                  </button>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Side cards */}
          <div className="flex flex-col gap-5">
            {rest.map(({ title, date, venue, tag, tagColor, img }, i) => (
              <motion.article
                key={title}
                custom={i + 1} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="spotlight-card flex gap-4 p-5 cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] font-heading font-semibold px-2.5 py-0.5 rounded-full ${tagColor} inline-block mb-2`}>{tag}</span>
                  <h3 className="font-heading font-bold text-[#0D1117] text-sm leading-snug mb-2 group-hover:text-green-700 spring line-clamp-2">
                    {title}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><CalendarDays size={11} className="text-green-600" />{date}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} className="text-green-600" />{venue}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════
   NEWS SECTION — Masonry-style variable heights
═══════════════════════════════════════════ */
const news = [
  {
    title: "Chamber signs MOU with DTI Region VII for SME development",
    excerpt: "A landmark agreement to accelerate small business growth and livelihood programs across Talisay, benefiting over 300 micro-enterprises.",
    date: "May 10, 2025",
    tag: "Partnership",
    tagColor: "bg-blue-50 text-blue-600 border border-blue-100",
    readTime: "3 min",
    img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=700&auto=format&fit=crop",
    featured: true,
  },
  {
    title: "Talisay ranks among Cebu's top 5 business-friendly cities",
    excerpt: "Improved ease-of-doing-business scores reflect years of Chamber advocacy work with local government units.",
    date: "April 28, 2025",
    tag: "Economic News",
    tagColor: "bg-green-50 text-green-600 border border-green-100",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=700&auto=format&fit=crop",
    featured: false,
  },
  {
    title: "38 new businesses join at the latest member orientation",
    excerpt: "The newest batch spans retail, healthcare, logistics, and services — bringing the total membership to 538.",
    date: "April 15, 2025",
    tag: "Membership",
    tagColor: "bg-amber-50 text-amber-600 border border-amber-100",
    readTime: "2 min",
    img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=700&auto=format&fit=crop",
    featured: false,
  },
];

export const NewsSection: React.FC = () => (
  <section className="py-32 bg-white" aria-label="News and announcements">
    <div className="container mx-auto px-4 md:px-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div>
          <motion.span custom={0} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="label-pill mb-5 inline-flex">News & Announcements</motion.span>
          <motion.h2 custom={1} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-[clamp(1.875rem,3.5vw,3rem)] font-heading font-black text-[#0D1117]">
            Latest updates
          </motion.h2>
        </div>
        <motion.div custom={2} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Button variant="outline" className="border-gray-200 text-gray-700 font-heading font-semibold rounded-full cursor-pointer spring group">
            All News <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 spring-fast" />
          </Button>
        </motion.div>
      </div>

      {/* Asymmetric 2-col: big featured + 2 stacked */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Featured */}
        {(() => {
          const f = news[0];
          return (
            <motion.article
              custom={0} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="bezel-outer shadow-diffuse">
                <div className="bezel-inner">
                  <div className="h-56 overflow-hidden rounded-t-[calc(2rem-5px)]">
                    <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" />
                  </div>
                  <div className="p-7">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[10px] font-heading font-semibold px-2.5 py-0.5 rounded-full ${f.tagColor}`}>{f.tag}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Newspaper size={10} /> {f.readTime} read</span>
                    </div>
                    <h3 className="font-heading font-bold text-[#0D1117] text-xl mb-3 leading-snug group-hover:text-green-700 spring">
                      {f.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.excerpt}</p>
                    <span className="text-xs text-gray-400">{f.date}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })()}

        {/* Side articles */}
        <div className="flex flex-col gap-5">
          {news.slice(1).map(({ title, excerpt, date, tag, tagColor, readTime, img }, i) => (
            <motion.article
              key={title}
              custom={i + 1} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="spotlight-card flex gap-4 p-5 cursor-pointer group"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full ${tagColor}`}>{tag}</span>
                  <span className="text-[10px] text-gray-400">{readTime} read</span>
                </div>
                <h3 className="font-heading font-bold text-[#0D1117] text-sm leading-snug mb-2 group-hover:text-green-700 spring line-clamp-2">{title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-2">{excerpt}</p>
                <span className="text-[11px] text-gray-400">{date}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════
   CTA SECTION — Dark with grain texture
═══════════════════════════════════════════ */
export const CtaSection: React.FC = () => (
  <section className="py-32 relative overflow-hidden bg-[#0D1117]" aria-label="Join the Chamber">
    {/* Background imagery */}
    <div
      className="absolute inset-0 opacity-[0.12] bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=2000&auto=format&fit=crop')" }}
      aria-hidden="true"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-green-950/40 to-[#0D1117]" aria-hidden="true" />
    {/* Radial glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-green-800/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

    <div className="relative z-10 container mx-auto px-4 md:px-10 max-w-4xl text-center">
      <motion.span custom={0} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="label-pill mb-6 inline-flex !bg-green-900/50 !text-green-300 !border-green-700/40">
        Become a Member
      </motion.span>

      <motion.h2 custom={1} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="text-[clamp(2.25rem,5vw,4.5rem)] font-heading font-black text-white mb-6 leading-tight">
        Ready to accelerate your business growth?
      </motion.h2>

      <motion.p custom={2} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="text-[1.0625rem] text-slate-400 mb-12 max-w-[52ch] mx-auto leading-[1.8]">
        Join 500+ businesses in Talisay's most powerful commercial network. Gain exclusive access
        to events, resources, partnerships, and government linkages.
      </motion.p>

      <motion.div custom={3} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
        <button className="btn-premium bg-green-700 hover:bg-green-600 text-white shadow-diffuse-lg hover:-translate-y-1">
          Apply for Membership
          <span className="btn-icon-wrap !bg-white/15"><ArrowUpRight size={14} /></span>
        </button>
        <button className="btn-premium glass-dark text-white hover:-translate-y-0.5">
          Contact Our Office
        </button>
      </motion.div>

      {/* Trust indicators */}
      <motion.div custom={4} variants={spring} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-8">
        {[
          { num: "538", label: "Active Members" },
          { num: "27", label: "Years of Service" },
          { num: "50+", label: "Events/Year" },
          { num: "₱2B+", label: "Economic Impact" },
        ].map(({ num, label }) => (
          <div key={label} className="text-center">
            <div className="text-2xl font-heading font-black text-white tabular-nums">{num}</div>
            <div className="text-xs text-slate-500 mt-1 tracking-wide">{label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);
