import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useNotification } from "../../context/NotificationContext";
import { uploadImage } from "../../lib/storage";
import { Edit2, Trash2, Plus, X, Loader2 } from "lucide-react";

interface QRSettingRow {
  id: string;
  name: string;
  description: string;
  payment_instructions: string;
  qr_code_url: string;
  is_active: boolean;
}

export const QRsTab: React.FC = () => {
  const { toast, confirm } = useNotification();
  const [qrs, setQrs] = useState<QRSettingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Editor states
  const [editingQr, setEditingQr] = useState<QRSettingRow | null>(null);
  const [qrName, setQrName] = useState("");
  const [qrDesc, setQrDesc] = useState("");
  const [qrInstructions, setQrInstructions] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("qr_settings")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      if (data) setQrs(data);
    } catch (err: any) {
      toast.error("Failed to load QR settings: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQr) return;
    setActionLoading(true);
    try {
      let finalQrUrl = qrUrl;
      if (qrFile) {
        finalQrUrl = await uploadImage(qrFile, "qrs");
      }
      const { error } = await supabase
        .from("qr_settings")
        .update({
          name: qrName,
          description: qrDesc,
          payment_instructions: qrInstructions,
          qr_code_url: finalQrUrl,
        })
        .eq("id", editingQr.id);
      if (error) throw error;
      setEditingQr(null);
      setQrFile(null);
      await loadData();
      toast.success("QR Setting updated!");
    } catch (err: any) {
      toast.error("Failed to save QR setting: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQr = async (qr: QRSettingRow) => {
    const confirmed = await confirm({
      title: "Delete Payment Option",
      message: `Are you sure you want to delete the "${qr.name}" payment method? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from("qr_settings").delete().eq("id", qr.id);
      if (error) throw error;
      if (editingQr?.id === qr.id) {
        setEditingQr(null);
        setQrFile(null);
      }
      await loadData();
      toast.success(`"${qr.name}" payment option deleted.`);
    } catch (err: any) {
      toast.error("Failed to delete payment option: " + err.message);
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
        <h3 className="text-base font-heading font-black text-white mb-6">Payment Methods / QR Channels</h3>
        <div className="space-y-4">
          {qrs.map((qr) => (
            <div key={qr.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex gap-4 items-center">
                <img src={qr.qr_code_url} alt={qr.name} className="w-16 h-16 object-contain bg-white p-1 rounded-lg" />
                <div>
                  <h4 className="font-heading font-bold text-white text-sm">{qr.name}</h4>
                  <p className="text-[11px] text-[#8A9690] mt-1 leading-relaxed max-w-sm">{qr.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setEditingQr(qr);
                    setQrName(qr.name);
                    setQrDesc(qr.description || "");
                    setQrInstructions(qr.payment_instructions || "");
                    setQrUrl(qr.qr_code_url || "");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#11241C] hover:bg-[#152F24] text-xs font-semibold text-green-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit2 size={12} /> Edit Details
                </button>
                <button
                  onClick={() => handleDeleteQr(qr)}
                  disabled={actionLoading}
                  title="Delete payment option"
                  className="p-2 rounded-xl bg-red-900/30 hover:bg-red-800/50 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingQr ? (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0A1410] border border-white/5 rounded-3xl p-6"
        >
          <h4 className="font-heading font-bold text-white text-sm mb-4">CMS QR Editor: {editingQr.name}</h4>
          <form onSubmit={handleSaveQr} className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#8A9690] font-bold uppercase mb-1">Method Name *</label>
              <input
                type="text"
                required
                value={qrName}
                onChange={(e) => setQrName(e.target.value)}
                className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs text-white focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#8A9690] font-bold uppercase mb-1">Short Description *</label>
              <input
                type="text"
                required
                value={qrDesc}
                onChange={(e) => setQrDesc(e.target.value)}
                className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs text-white focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#8A9690] font-bold uppercase mb-1">Instructions *</label>
              <textarea
                required
                rows={4}
                value={qrInstructions}
                onChange={(e) => setQrInstructions(e.target.value)}
                className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs text-white focus:border-green-500 outline-none resize-none font-sans"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] text-[#8A9690] font-bold uppercase mb-1">QR Code Image</label>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* File Upload zone */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-3 bg-[#101D17]/50 hover:bg-[#101D17] transition-all relative min-h-[96px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setQrFile(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="text-center pointer-events-none">
                    <Plus className="mx-auto text-gray-400 mb-1" size={16} />
                    <span className="text-[10px] text-gray-300 font-bold block truncate max-w-[120px]">
                      {qrFile ? qrFile.name : "Upload QR Image"}
                    </span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">PNG, JPG up to 5MB</span>
                  </div>
                  {qrFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQrFile(null);
                      }}
                      className="absolute top-1 right-1 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 z-20 cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>

                {/* Fallback URL Input + Preview */}
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    placeholder="Or paste QR Image URL..."
                    required={!qrFile}
                    className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs text-white outline-none"
                  />
                  <div className="flex-1 min-h-[64px] border border-white/10 rounded-xl overflow-hidden bg-[#101D17]/50 flex items-center justify-center text-[10px] text-gray-500 relative">
                    {qrFile ? (
                      <img
                        src={URL.createObjectURL(qrFile)}
                        alt="Upload Preview"
                        className="w-full h-full object-contain p-1 bg-white"
                      />
                    ) : qrUrl ? (
                      <img
                        src={qrUrl}
                        alt="URL Preview"
                        className="w-full h-full object-contain p-1 bg-white"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>Preview QR</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2 bg-green-700 hover:bg-green-600 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {actionLoading && <Loader2 className="animate-spin" size={12} />}
                {actionLoading ? "Saving..." : "Save QR Settings"}
              </button>
              <button
                type="button"
                onClick={() => { setEditingQr(null); setQrFile(null); }}
                className="px-3 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold text-gray-400 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="bg-[#0A1410] border border-white/5 rounded-3xl p-6 text-center py-10 text-gray-500 text-xs">
          Select a payment QR channel to edit its database.
        </div>
      )}
    </div>
  );
};
