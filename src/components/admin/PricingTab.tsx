import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useNotification } from "../../context/NotificationContext";
import { Edit2, Loader2 } from "lucide-react";

interface PricingPlan {
  id: string;
  type: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
}

export const PricingTab: React.FC = () => {
  const { toast } = useNotification();
  const [pricing, setPricing] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Editor states
  const [editingPrice, setEditingPrice] = useState<PricingPlan | null>(null);
  const [priceAmt, setPriceAmt] = useState(0);
  const [priceDesc, setPriceDesc] = useState("");
  const [priceBenefits, setPriceBenefits] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("membership_pricing")
        .select("*")
        .order("price", { ascending: true });
      if (error) throw error;
      if (data) setPricing(data);
    } catch (err: any) {
      toast.error("Failed to load plans: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrice) return;
    setActionLoading(true);
    try {
      const benefitsArr = priceBenefits.split("\n").map(b => b.trim()).filter(b => b.length > 0);
      const { error } = await supabase
        .from("membership_pricing")
        .update({
          price: Number(priceAmt),
          description: priceDesc,
          benefits: benefitsArr,
        })
        .eq("id", editingPrice.id);
      if (error) throw error;
      setEditingPrice(null);
      await loadData();
      toast.success("Pricing plan updated!");
    } catch (err: any) {
      toast.error("Failed to save pricing: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="animate-spin text-green-700" size={32} />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="bg-[#0A1410] border border-white/5 rounded-3xl p-6">
        <h3 className="text-base font-heading font-black text-white mb-6 font-heading">Active Membership Plans</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {pricing.map((plan) => (
            <div key={plan.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between h-64">
              <div>
                <span className="text-[10px] font-heading font-bold text-green-400 uppercase tracking-wider">{plan.name}</span>
                <div className="text-xl font-heading font-black text-white mt-2">PHP {plan.price.toLocaleString()}</div>
                <p className="text-[11px] text-[#8A9690] mt-3 line-clamp-3 leading-relaxed">{plan.description}</p>
              </div>
              <button
                onClick={() => {
                  setEditingPrice(plan);
                  setPriceAmt(plan.price);
                  setPriceDesc(plan.description || "");
                  setPriceBenefits(plan.benefits.join("\n"));
                }}
                className="w-full px-3 py-2 rounded-xl border border-white/5 bg-[#11241C] hover:bg-[#152F24] text-xs font-semibold text-green-400 text-center transition-colors cursor-pointer flex items-center justify-center gap-1 mt-6"
              >
                <Edit2 size={12} /> Edit Plan Fee
              </button>
            </div>
          ))}
        </div>
      </div>

      {editingPrice ? (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0A1410] border border-white/5 rounded-3xl p-6"
        >
          <h4 className="font-heading font-bold text-white text-sm mb-4">CMS Plan Editor: {editingPrice.name}</h4>
          <form onSubmit={handleSavePrice} className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#8A9690] font-bold uppercase mb-1">Price (PHP) *</label>
              <input
                type="number"
                required
                value={priceAmt}
                onChange={(e) => setPriceAmt(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs text-white focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#8A9690] font-bold uppercase mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={priceDesc}
                onChange={(e) => setPriceDesc(e.target.value)}
                className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs text-white focus:border-green-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#8A9690] font-bold uppercase mb-1">Benefits (One per line) *</label>
              <textarea
                required
                rows={5}
                value={priceBenefits}
                onChange={(e) => setPriceBenefits(e.target.value)}
                className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs font-mono text-white focus:border-green-500 outline-none resize-none"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2 bg-green-700 hover:bg-green-600 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditingPrice(null)}
                className="px-3 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold text-gray-400 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="bg-[#0A1410] border border-white/5 rounded-3xl p-6 text-center py-10 text-gray-500 text-xs">
          Select a plan to edit its parameters in the CMS database.
        </div>
      )}
    </div>
  );
};
