import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Plus } from "lucide-react";

interface NewsSubmitModalProps {
  open: boolean;
  onClose: () => void;
  editingNews: any | null;
  formError: string | null;
  actionLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  // Field states
  newsTitle: string; setNewsTitle: (v: string) => void;
  newsSummary: string; setNewsSummary: (v: string) => void;
  newsContent: string; setNewsContent: (v: string) => void;
  newsCategory: string; setNewsCategory: (v: string) => void;
  newsImg: string; setNewsImg: (v: string) => void;
  newsImgFiles: File[]; setNewsImgFiles: React.Dispatch<React.SetStateAction<File[]>>;
  existingNewsImgs: string[]; setExistingNewsImgs: React.Dispatch<React.SetStateAction<string[]>>;
}

const NEWS_CATEGORIES = ["General", "Partnership", "Economic News", "Membership", "Event"];

const NewsSubmitModal: React.FC<NewsSubmitModalProps> = ({
  open, onClose, editingNews, formError, actionLoading, onSubmit,
  newsTitle, setNewsTitle,
  newsSummary, setNewsSummary,
  newsContent, setNewsContent,
  newsCategory, setNewsCategory,
  newsImg, setNewsImg,
  newsImgFiles, setNewsImgFiles,
  existingNewsImgs, setExistingNewsImgs,
}) => {
  const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:bg-white focus:border-green-500 transition-all font-semibold";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="w-full max-w-lg bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-left relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-heading font-black text-gray-900 mb-2">
              {editingNews ? "Edit News Submission" : "Submit News Article"}
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Fill in the details below to submit an article. Submissions are subject to administrator approval before being published.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Article Title *</label>
                <input
                  type="text" required
                  placeholder="e.g. Santos Trading expands local retail lines"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Category *</label>
                <select
                  value={newsCategory}
                  onChange={(e) => setNewsCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:bg-white focus:border-green-500 transition-all font-semibold"
                >
                  {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Summary * (Short Teaser Description)</label>
                <input
                  type="text" required
                  placeholder="Provide a one-sentence teaser description..."
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Full content */}
              <div>
                <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Full Article Content *</label>
                <textarea
                  required rows={6}
                  placeholder="Write the full body content of your news article here..."
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-950 outline-none focus:bg-white focus:border-green-500 transition-all resize-none font-sans leading-relaxed"
                />
              </div>

              {/* Images section */}
              <div className="space-y-2">
                <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Article Pictures</label>

                {/* Gallery preview grid */}
                {(existingNewsImgs.length > 0 || newsImgFiles.length > 0) && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 font-semibold">
                    {existingNewsImgs.map((url, idx) => (
                      <div key={`ex-${idx}`} className="relative aspect-square border border-gray-200 rounded-xl overflow-hidden group">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setExistingNewsImgs((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 cursor-pointer transition-all shadow"
                        >
                          <X size={10} />
                        </button>
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] bg-black/60 px-1 rounded text-gray-200">Saved</span>
                      </div>
                    ))}
                    {newsImgFiles.map((file, idx) => {
                      const previewUrl = URL.createObjectURL(file);
                      return (
                        <div key={`loc-${idx}`} className="relative aspect-square border border-gray-200 rounded-xl overflow-hidden group">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setNewsImgFiles((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 cursor-pointer transition-all shadow"
                          >
                            <X size={10} />
                          </button>
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] bg-green-950/80 border border-green-800/40 px-1 rounded text-green-400 font-bold font-sans">New</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* File upload zone */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-3 bg-gray-50 hover:bg-gray-100 transition-all relative min-h-[96px]">
                    <input
                      type="file" accept="image/*" multiple
                      onChange={(e) => {
                        const files = e.target.files ? Array.from(e.target.files) : [];
                        setNewsImgFiles((prev) => [...prev, ...files]);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="text-center pointer-events-none">
                      <Plus className="mx-auto text-gray-400 mb-1" size={18} />
                      <span className="text-[10px] text-gray-600 font-bold block">Upload Photos</span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">Select multiple images</span>
                    </div>
                  </div>

                  {/* URL fallback input */}
                  <div className="flex flex-col gap-2 justify-center font-semibold font-sans">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newsImg}
                        onChange={(e) => setNewsImg(e.target.value)}
                        placeholder="Paste image URL..."
                        className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[10px] text-gray-900 outline-none focus:bg-white focus:border-green-500 transition-all font-semibold font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newsImg.trim()) {
                            setExistingNewsImgs((prev) => [...prev, newsImg.trim()]);
                            setNewsImg("");
                          }
                        }}
                        className="px-3 py-2 bg-green-700 hover:bg-green-600 rounded-xl text-white font-bold cursor-pointer transition-colors"
                      >
                        Add URL
                      </button>
                    </div>
                    <span className="text-[9px] text-gray-400">Or add multiple external image URLs</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-4 border-t border-gray-100 mt-6 font-semibold">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-diffuse text-xs"
                >
                  {actionLoading ? (
                    <><Loader2 className="animate-spin" size={14} /> Submitting...</>
                  ) : (
                    editingNews ? "Update Submission" : "Submit Article"
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-500 cursor-pointer text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewsSubmitModal;
