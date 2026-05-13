import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Building, Globe, Mail, Phone, ExternalLink } from "lucide-react";
import { CtaSection } from "../components/sections/MoreSections";

const directory = [
  { name: "Santos Trading Co.", category: "Retail", location: "Poblacion", contact: "(032) 234-5678", email: "info@santostrading.com", web: "santostrading.com" },
  { name: "CR Construction & Dev", category: "Construction", location: "Lawaan I", contact: "(032) 456-7890", email: "projects@crconstruct.com", web: "crconstruct.com" },
  { name: "Graceland Restaurant Group", category: "Food & Beverage", location: "Tabunok", contact: "(032) 345-6789", email: "hello@graceland.ph", web: "graceland.ph" },
  { name: "Cruz & Reyes Law", category: "Professional Services", location: "Bulacao", contact: "(032) 567-8901", email: "legal@cruzreyes.com", web: "cruzreyes.com" },
  { name: "Talisay Medical Center", category: "Healthcare", location: "San Isidro", contact: "(032) 678-9012", email: "admin@talisaymed.com", web: "talisaymed.com" },
  { name: "Visayas Tech Solutions", category: "IT & Tech", location: "Dumlog", contact: "(032) 789-0123", email: "contact@visayastech.com", web: "visayastech.com" },
  { name: "Cebu South Logistics", category: "Logistics", location: "Tank", contact: "(032) 890-1234", email: "operations@cebusouth.ph", web: "cebusouth.ph" },
  { name: "Green Earth Agri-Farm", category: "Agriculture", location: "Camp 4", contact: "(032) 901-2345", email: "farm@greenearth.ph", web: "greenearth.ph" },
];

const categories = ["All", "Retail", "Construction", "Food & Beverage", "Professional Services", "Healthcare", "IT & Tech", "Logistics", "Agriculture"];

const Directory: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = directory.filter(biz => 
    (activeCategory === "All" || biz.category === activeCategory) &&
    biz.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pt-32 bg-[#fafafa]">
      <section className="container mx-auto px-4 md:px-10 max-w-7xl pb-24">
        <div className="max-w-2xl mb-12">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label-pill mb-5 inline-flex">Member Directory</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[clamp(2rem,4vw,3rem)] font-heading font-black text-[#0D1117] leading-tight mb-4">
            Find local businesses
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-500 text-lg">
            Connect with over 500 trusted members of the Talisay Chamber network.
          </motion.p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by company name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 hide-scrollbar gap-2 flex-1 items-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                  activeCategory === cat ? "bg-green-700 text-white shadow-diffuse" : "bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((biz, i) => (
            <motion.div 
              key={biz.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-green-100 transition-all group flex flex-col"
            >
              <div className="mb-4">
                <span className="text-[10px] font-heading font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 mb-3 inline-block">
                  {biz.category}
                </span>
                <h3 className="font-heading font-bold text-lg text-[#0D1117] leading-tight group-hover:text-green-700 transition-colors">
                  {biz.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                  <MapPin size={12} className="text-gray-400" /> {biz.location}, Talisay City
                </div>
              </div>

              <div className="space-y-2.5 mt-auto pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2.5 text-[13px] text-gray-600">
                  <Phone size={14} className="text-gray-400" /> {biz.contact}
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-gray-600">
                  <Mail size={14} className="text-gray-400" /> {biz.email}
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-green-700 font-medium mt-1">
                  <Globe size={14} className="text-green-600" /> 
                  <a href={`https://${biz.web}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    {biz.web} <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Building className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-heading font-semibold text-gray-900">No businesses found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or category filter.</p>
          </div>
        )}
      </section>
      <CtaSection />
    </div>
  );
};

export default Directory;
