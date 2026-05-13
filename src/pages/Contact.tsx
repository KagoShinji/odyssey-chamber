import React from "react";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Clock, Send } from "lucide-react";

const Contact: React.FC = () => {
  return (
    <div className="flex flex-col w-full pt-32 bg-[#fbfaf6]">
      <section className="container mx-auto px-4 md:px-10 max-w-7xl pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left: Contact Info */}
          <div>
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label-pill mb-5 inline-flex">Get In Touch</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[clamp(2rem,4vw,3.5rem)] font-heading font-black text-[#0D1A14] leading-tight mb-6">
              Let's start a conversation.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-500 text-lg mb-12 max-w-[45ch]">
              Have questions about membership, events, or our advocacy programs? Our team is here to help you navigate your business journey in Talisay.
            </motion.p>

            <div className="space-y-8">
              {[
                { icon: MapPin, title: "Our Office", details: ["Talisay City Hall Compound", "Lawaan II, Talisay City", "Cebu, Philippines 6045"] },
                { icon: Mail, title: "Email Us", details: ["inquiry@talisaychamber.org", "membership@talisaychamber.org"] },
                { icon: Phone, title: "Call Us", details: ["(032) 272-1234", "+63 917 123 4567"] },
                { icon: Clock, title: "Office Hours", details: ["Monday - Friday", "8:00 AM - 5:00 PM"] },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.1) }} className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-[#0D1A14] text-[15px] mb-1">{item.title}</h3>
                    {item.details.map((line, j) => (
                      <p key={j} className="text-gray-500 text-sm">{line}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bezel-outer shadow-diffuse-lg"
          >
            <div className="bezel-inner p-8 sm:p-10"><h3 className="font-heading font-bold text-[#0D1A14] text-xl mb-6">Send us a message</h3>
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-heading font-semibold text-gray-700 mb-1.5 ml-1">First Name</label>
                  <input type="text" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-heading font-semibold text-gray-700 mb-1.5 ml-1">Last Name</label>
                  <input type="text" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] font-heading font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
                <input type="email" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-heading font-semibold text-gray-700 mb-1.5 ml-1">Subject</label>
                <select className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all appearance-none">
                  <option>General Inquiry</option>
                  <option>Membership Application</option>
                  <option>Event Registration</option>
                  <option>Partnership Proposal</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-heading font-semibold text-gray-700 mb-1.5 ml-1">Message</label>
                <textarea rows={4} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all resize-none"></textarea>
              </div>

              <button type="button" className="w-full btn-premium bg-[#0D1A14] hover:bg-navy-mid text-white justify-center shadow-navy-diffuse mt-2">
                Send Message
                <span className="btn-icon-wrap !bg-white/10"><Send size={14} /></span>
              </button>
            </form>
            </div>
          </motion.div>

        </div>
      </section>
      
      {/* Map Section (Placeholder styling) */}
      <div className="h-96 w-full bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400 font-medium flex items-center gap-2"><MapPin size={18} /> Talisay City business district map area</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
