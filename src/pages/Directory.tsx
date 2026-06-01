import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Building, Globe, Mail, Phone, ExternalLink, Loader2 } from "lucide-react";
import { CtaSection } from "../components/sections/MoreSections";
import { supabase } from "../lib/supabase";

interface BusinessListing {
  id: string;
  business_name: string;
  category: string;
  address: string;
  contact_phone: string | null;
  contact_email: string | null;
  website_url: string | null;
  is_verified: boolean;
}

const fallbackDirectory = [
  { id: "f1", business_name: "Santos Trading Co.", category: "Retail", address: "Poblacion, Talisay City", contact_phone: "(032) 234-5678", contact_email: "info@santostrading.com", website_url: "santostrading.com" },
  { id: "f2", business_name: "CR Construction & Dev", category: "Construction", address: "Lawaan I, Talisay City", contact_phone: "(032) 456-7890", contact_email: "projects@crconstruct.com", website_url: "crconstruct.com" },
  { id: "f3", business_name: "Graceland Restaurant Group", category: "Food & Beverage", address: "Tabunok, Talisay City", contact_phone: "(032) 345-6789", contact_email: "hello@graceland.ph", website_url: "graceland.ph" },
  { id: "f4", business_name: "Cruz & Reyes Law", category: "Professional Services", address: "Bulacao, Talisay City", contact_phone: "(032) 567-8901", contact_email: "legal@cruzreyes.com", website_url: "cruzreyes.com" },
  { id: "f5", business_name: "Talisay Medical Center", category: "Healthcare", address: "San Isidro, Talisay City", contact_phone: "(032) 678-9012", contact_email: "admin@talisaymed.com", website_url: "talisaymed.com" },
  { id: "f6", business_name: "Visayas Tech Solutions", category: "IT & Tech", address: "Dumlog, Talisay City", contact_phone: "(032) 789-0123", contact_email: "contact@visayastech.com", website_url: "visayastech.com" },
  { id: "f7", business_name: "Cebu South Logistics", category: "Logistics", address: "Tank, Talisay City", contact_phone: "(032) 890-1234", contact_email: "operations@cebusouth.ph", website_url: "cebusouth.ph" },
  { id: "f8", business_name: "Green Earth Agri-Farm", category: "Agriculture", address: "Camp 4, Talisay City", contact_phone: "(032) 901-2345", contact_email: "farm@greenearth.ph", website_url: "greenearth.ph" },
];

const categories = ["All", "Retail", "Construction", "Food & Beverage", "Professional Services", "Healthcare", "IT & Tech", "Logistics", "Agriculture"];

const Directory: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("business_directory")
          .select("*")
          .eq("is_verified", true)
          .order("business_name", { ascending: true });
        if (data && data.length > 0) {
          setListings(data as any);
        } else {
          setListings(fallbackDirectory as any);
        }
      } catch (err) {
        console.error(err);
        setListings(fallbackDirectory as any);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectory();
  }, []);

  const filtered = listings.filter(biz => 
    (activeCategory === "All" || biz.category === activeCategory) &&
    [biz.business_name, biz.category, biz.address].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pt-32 bg-[#fbfaf6]">
      <section className="container mx-auto px-4 md:px-10 max-w-7xl pb-24">
        <div className="max-w-2xl mb-12">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label-pill mb-5 inline-flex">Member Directory</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[clamp(2rem,4vw,3rem)] font-heading font-black text-[#0D1A14] leading-tight mb-4">
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
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={36} className="animate-spin text-green-700" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((biz, i) => (
              <motion.div 
                key={biz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="spotlight-card rounded-[1.5rem] p-6 group flex flex-col"
              >
                <div className="mb-4">
                  <span className="text-[10px] font-heading font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 mb-3 inline-block">
                    {biz.category}
                  </span>
                  <h3 className="font-heading font-bold text-lg text-[#0D1A14] leading-tight group-hover:text-green-700 transition-colors">
                    {biz.business_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                    <MapPin size={12} className="text-gray-400" /> {biz.address}
                  </div>
                </div>

                <div className="space-y-2.5 mt-auto pt-4 border-t border-gray-50">
                  {biz.contact_phone && (
                    <div className="flex items-center gap-2.5 text-[13px] text-gray-600">
                      <Phone size={14} className="text-gray-400" /> {biz.contact_phone}
                    </div>
                  )}
                  {biz.contact_email && (
                    <div className="flex items-center gap-2.5 text-[13px] text-gray-600">
                      <Mail size={14} className="text-gray-400" /> {biz.contact_email}
                    </div>
                  )}
                  {biz.website_url && (
                    <div className="flex items-center gap-2.5 text-[13px] text-green-700 font-medium mt-1">
                      <Globe size={14} className="text-green-600" /> 
                      <a href={biz.website_url.startsWith("http") ? biz.website_url : `https://${biz.website_url}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                        {biz.website_url} <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {!loading && filtered.length === 0 && (
          <div className="bezel-outer max-w-xl mx-auto my-12 shadow-diffuse">
            <div className="bezel-inner px-8 py-14 text-center">
              <Building className="mx-auto h-12 w-12 text-green-700/35 mb-4" />
              <h3 className="text-lg font-heading font-semibold text-gray-900">No businesses found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or category filter.</p>
            </div>
          </div>
        )}
      </section>
      <CtaSection />
    </div>
  );
};

export default Directory;
