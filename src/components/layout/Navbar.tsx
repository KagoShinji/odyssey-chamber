import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";

const navLinks = [
  { name: "Home", path: "/" },
  {
    name: "About",
    path: "/about",
    children: [
      { name: "Our History", path: "/about/history" },
      { name: "Vision & Mission", path: "/about/vision" },
      { name: "Board of Directors", path: "/about/board" },
    ],
  },
  {
    name: "Services",
    path: "/services",
    children: [
      { name: "Business Networking", path: "/services/networking" },
      { name: "SME Support", path: "/services/sme" },
      { name: "Investment Promotion", path: "/services/investment" },
      { name: "Legal & Compliance", path: "/services/legal" },
    ],
  },
  { name: "Directory", path: "/directory" },
  { name: "Events", path: "/events" },
  { name: "News", path: "/news" },
  { name: "Contact", path: "/contact" },
];

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      {/* Scroll progress */}
      <div
        id="scroll-progress"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Fluid Island Nav — floats, not edge-to-edge */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-5 px-4 pointer-events-none">
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            "pointer-events-auto flex items-center justify-between gap-6 px-5 py-3 rounded-full spring w-full max-w-5xl",
            scrolled
              ? "glass-true shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
              : "glass-dark border-white/10"
          )}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="Talisay Chamber – Home">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-700 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-diffuse">
              <span className="text-white font-heading font-bold text-[11px]">TC</span>
            </div>
            <span className={cn(
              "font-heading font-bold text-[14px] leading-tight hidden sm:block spring",
              scrolled ? "text-gray-900" : "text-white"
            )}>
              Talisay Chamber
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.children && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.path}
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium spring-fast cursor-pointer",
                    scrolled
                      ? "text-gray-700 hover:text-green-700 hover:bg-green-50"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.name}
                  {link.children && (
                    <ChevronDown size={12} className={cn("spring-fast", activeDropdown === link.name ? "rotate-180" : "")} />
                  )}
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {link.children && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden z-50 p-1.5"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.path}
                          className="flex items-center justify-between px-4 py-2.5 text-[13px] text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl spring-fast cursor-pointer group"
                        >
                          {child.name}
                          <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 spring-fast" />
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <span className={cn(
              "text-[13px] font-medium cursor-pointer px-3 py-1.5 rounded-full spring-fast",
              scrolled ? "text-gray-600 hover:text-green-700 hover:bg-green-50" : "text-white/70 hover:text-white hover:bg-white/10"
            )}>
              Login
            </span>
            <button className="btn-premium !py-2 !px-4 !text-[13px] bg-green-700 hover:bg-green-600 text-white shadow-diffuse">
              Join Chamber
              <span className="btn-icon-wrap !w-5 !h-5 !bg-white/15"><ArrowUpRight size={11} /></span>
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className={cn(
              "lg:hidden w-9 h-9 flex items-center justify-center rounded-full spring-fast cursor-pointer",
              scrolled || mobileOpen ? "text-gray-900 hover:bg-gray-100" : "text-white hover:bg-white/10"
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </motion.nav>
      </header>

      {/* Mobile overlay — screen-filling glass */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90] bg-[#0D1117]/90 backdrop-blur-2xl flex flex-col pt-24 px-6 pb-10"
          >
            {/* Staggered nav items */}
            <ul className="space-y-1 flex-1">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.4, delay: 0.05 + i * 0.06, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-4 text-2xl font-heading font-bold text-white hover:text-green-400 spring border-b border-white/5 cursor-pointer"
                  >
                    {link.name}
                    <ArrowUpRight size={18} className="text-white/30" />
                  </Link>
                </motion.li>
              ))}
            </ul>

            {/* Mobile CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex flex-col gap-3 pt-8"
            >
              <button className="btn-premium justify-center w-full bg-green-700 hover:bg-green-600 text-white shadow-diffuse" onClick={() => setMobileOpen(false)}>
                Join the Chamber
                <span className="btn-icon-wrap !bg-white/15"><ArrowUpRight size={14} /></span>
              </button>
              <button className="btn-premium justify-center w-full glass-dark text-white" onClick={() => setMobileOpen(false)}>
                Member Login
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
