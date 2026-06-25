import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useNotification } from "../../context/NotificationContext";
import { uploadImage } from "../../lib/storage";
import { Plus, Trash2, X, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface NewsRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  read_time: string;
  author: string;
  image_url?: string;
  images?: string[];
  status?: string;
  user_id?: string | null;
  published_at?: string;
}

export const NewsTab: React.FC = () => {
  const { toast, confirm } = useNotification();
  const [news, setNews] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal and editing states
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNewsItem, setEditingNewsItem] = useState<NewsRow | null>(null);
  const [reviewingNewsItem, setReviewingNewsItem] = useState<NewsRow | null>(null);

  // Form states
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsCategory, setNewsCategory] = useState("General");
  
  // Multiple Image state variables
  const [newsImg, setNewsImg] = useState("");
  const [newsImgFiles, setNewsImgFiles] = useState<File[]>([]);
  const [existingNewsImgs, setExistingNewsImgs] = useState<string[]>([]);

  // Current session user state
  const [userId, setUserId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setNews(data);
    } catch (err: any) {
      toast.error("Failed to load news articles: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSessionUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
    }
  };

  useEffect(() => {
    loadData();
    getSessionUser();
  }, []);

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsSummary.trim() || !newsContent.trim()) {
      toast.error("Title, summary, and content are required.");
      return;
    }
    setActionLoading(true);
    try {
      // 1. Upload new local files
      const uploadedUrls: string[] = [];
      for (const file of newsImgFiles) {
        const url = await uploadImage(file, "news");
        uploadedUrls.push(url);
      }

      // 2. Combine existing and new URLs
      const finalImagesList = [...existingNewsImgs, ...uploadedUrls];

      // 3. Fallback to manually pasted URL if no files/saved URLs are present
      if (finalImagesList.length === 0 && newsImg.trim()) {
        finalImagesList.push(newsImg.trim());
      }

      // 4. Primary cover URL
      const coverUrl = finalImagesList[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=700&auto=format&fit=crop";

      const wordCount = newsContent.trim().split(/\s+/).length;
      const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

      const newsData = {
        title: newsTitle.trim(),
        summary: newsSummary.trim(),
        content: newsContent.trim(),
        category: newsCategory,
        image_url: coverUrl,
        images: finalImagesList,
        read_time: readTime,
        status: editingNewsItem ? (editingNewsItem.status || 'approved') : 'approved',
        user_id: editingNewsItem ? editingNewsItem.user_id : (userId || null),
      };

      if (editingNewsItem) {
        const { error } = await supabase.from("news").update(newsData).eq("id", editingNewsItem.id);
        if (error) throw error;
        toast.success("News article updated successfully!");
      } else {
        const { error } = await supabase.from("news").insert(newsData);
        if (error) throw error;
        toast.success("News article published successfully!");
      }

      setShowNewsModal(false);
      setEditingNewsItem(null);
      setNewsTitle("");
      setNewsSummary("");
      setNewsContent("");
      setNewsCategory("General");
      setNewsImg("");
      setNewsImgFiles([]);
      setExistingNewsImgs([]);
      await loadData();
    } catch (err: any) {
      toast.error("Failed to publish news: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveNewsSubmission = async (item: NewsRow) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("news")
        .update({
          status: "approved",
          published_at: new Date().toISOString()
        })
        .eq("id", item.id);

      if (error) throw error;
      setReviewingNewsItem(null);
      await loadData();
      toast.success("News submission approved and published!");
    } catch (err: any) {
      toast.error("Failed to approve submission: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectNewsSubmission = async (item: NewsRow) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("news")
        .update({ status: "rejected" })
        .eq("id", item.id);

      if (error) throw error;
      setReviewingNewsItem(null);
      await loadData();
      toast.success("News submission rejected.");
    } catch (err: any) {
      toast.error("Failed to reject submission: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete News Article",
      message: "Are you sure you want to delete this news article?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
      await loadData();
      toast.success("News article deleted.");
    } catch (err: any) {
      toast.error("Failed to delete article: " + err.message);
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
    <div className="space-y-6">
      <div className="bg-[#0A1410] border border-white/5 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-heading font-black text-white">Chamber News CMS</h3>
          <button
            onClick={() => {
              setEditingNewsItem(null);
              setNewsTitle("");
              setNewsSummary("");
              setNewsContent("");
              setNewsCategory("General");
              setNewsImg("");
              setNewsImgFiles([]);
              setExistingNewsImgs([]);
              setShowNewsModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus size={14} /> Post Article
          </button>
        </div>

        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 items-center flex-1 min-w-0">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">{item.category}</span>
                    {item.status && (
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        item.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {item.status === 'approved' ? 'Approved' :
                         item.status === 'pending' ? 'Pending Approval' :
                         'Rejected'}
                      </span>
                    )}
                    <span className="text-[9px] text-[#8A9690]">
                      by {item.author || "Chamber Admin"}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-white text-sm mt-1 leading-snug line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-[#8A9690] mt-1 line-clamp-1">{item.summary}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {item.status === "pending" && (
                  <button
                    onClick={() => setReviewingNewsItem(item)}
                    className="px-3 py-1.5 rounded-lg border border-amber-500/30 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer"
                  >
                    Review
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingNewsItem(item);
                    setNewsTitle(item.title);
                    setNewsSummary(item.summary);
                    setNewsContent(item.content);
                    setNewsCategory(item.category);
                    setNewsImg("");
                    setNewsImgFiles([]);
                    setExistingNewsImgs(item.images || (item.image_url ? [item.image_url] : []));
                    setShowNewsModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-white/5 text-xs text-green-400 bg-[#11241C] hover:bg-[#152F24] transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteNews(item.id)}
                  className="p-1.5 rounded-lg border border-white/5 text-gray-500 hover:bg-red-950/20 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE/EDIT NEWS MODAL */}
      <AnimatePresence>
        {showNewsModal && (
          <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0A1410] border border-white/10 rounded-3xl p-6 overflow-y-auto max-h-[90vh] text-left"
            >
              <h3 className="font-heading font-black text-white text-lg mb-6">
                {editingNewsItem ? "Edit News Post" : "Publish News Article"}
              </h3>
              
              <form onSubmit={handleSaveNews} className="space-y-4 text-xs font-semibold text-gray-300">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8A9690] mb-1">Article Title *</label>
                    <input
                      type="text"
                      required
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      placeholder="e.g. DTI and Chamber sign new deal"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Category *</label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500"
                    >
                      <option value="General">General</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Economic News">Economic News</option>
                      <option value="Membership">Membership</option>
                      <option value="Event Notice">Event Notice</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#8A9690] mb-1">Short Summary (1-2 sentences) *</label>
                  <input
                    type="text"
                    required
                    value={newsSummary}
                    onChange={(e) => setNewsSummary(e.target.value)}
                    placeholder="Write a brief snippet that displays on list cards..."
                    className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-[#8A9690] mb-1">Full Article Body *</label>
                  <textarea
                    required
                    rows={6}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="Write the full body contents of the announcement..."
                    className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none resize-none font-sans leading-relaxed focus:border-green-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[#8A9690] text-xs font-bold uppercase mb-1">Article Pictures</label>
                  
                  {/* Gallery Grid Preview */}
                  {(existingNewsImgs.length > 0 || newsImgFiles.length > 0) && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 bg-[#101D17]/40 p-3 rounded-2xl border border-white/10 font-semibold">
                      {existingNewsImgs.map((url, idx) => (
                        <div key={`ex-${idx}`} className="relative aspect-square border border-white/10 rounded-xl overflow-hidden group">
                          <img src={url} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setExistingNewsImgs(prev => prev.filter((_, i) => i !== idx))}
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
                          <div key={`loc-${idx}`} className="relative aspect-square border border-white/10 rounded-xl overflow-hidden group">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNewsImgFiles(prev => prev.filter((_, i) => i !== idx))}
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
                    {/* File Upload zone */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-3 bg-[#101D17]/50 hover:bg-[#101D17] transition-all relative min-h-[96px]">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files ? Array.from(e.target.files) : [];
                          setNewsImgFiles(prev => [...prev, ...files]);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="text-center pointer-events-none">
                        <Plus className="mx-auto text-gray-400 mb-1" size={18} />
                        <span className="text-[10px] text-gray-300 font-bold block">Upload Photos</span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">Select multiple images</span>
                      </div>
                    </div>

                    {/* Fallback URL Input + Add Button */}
                    <div className="flex flex-col gap-2 justify-center font-semibold font-sans">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newsImg}
                          onChange={(e) => setNewsImg(e.target.value)}
                          placeholder="Paste image URL..."
                          className="flex-1 px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-[11px] text-white outline-none focus:border-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newsImg.trim()) {
                              setExistingNewsImgs(prev => [...prev, newsImg.trim()]);
                              setNewsImg("");
                            }
                          }}
                          className="px-3 py-2 bg-green-700 hover:bg-green-600 rounded-xl text-white font-bold cursor-pointer transition-colors"
                        >
                          Add URL
                        </button>
                      </div>
                      <span className="text-[9px] text-gray-500">Or add multiple external image URLs</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    {actionLoading && <Loader2 className="animate-spin" size={12} />}
                    {actionLoading ? "Publishing..." : editingNewsItem ? "Save Changes" : "Publish Article"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewsModal(false);
                      setEditingNewsItem(null);
                      setNewsImgFiles([]);
                    }}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-gray-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REVIEW NEWS SUBMISSION MODAL */}
      <AnimatePresence>
        {reviewingNewsItem && (
          <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[#0A1410] border border-white/10 rounded-3xl p-6 overflow-y-auto max-h-[90vh] shadow-2xl relative text-left"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    Review Pending Submission
                  </span>
                  <h3 className="font-heading font-black text-white text-xl mt-2">
                    {reviewingNewsItem.title}
                  </h3>
                </div>
                <button
                  onClick={() => setReviewingNewsItem(null)}
                  className="p-1.5 rounded-xl border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body Content */}
              <div className="space-y-6 text-xs text-gray-300">
                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div>
                    <span className="text-[#8A9690] block mb-0.5">Category</span>
                    <span className="font-bold text-green-400">{reviewingNewsItem.category}</span>
                  </div>
                  <div>
                    <span className="text-[#8A9690] block mb-0.5">Author</span>
                    <span className="font-bold text-white">{reviewingNewsItem.author}</span>
                  </div>
                  <div>
                    <span className="text-[#8A9690] block mb-0.5">Est. Read Time</span>
                    <span className="font-bold text-white">{reviewingNewsItem.read_time || '3 min read'}</span>
                  </div>
                  <div>
                    <span className="text-[#8A9690] block mb-0.5">Status</span>
                    <span className="font-bold text-amber-400 capitalize">{reviewingNewsItem.status}</span>
                  </div>
                </div>

                {/* Banner Image */}
                {reviewingNewsItem.image_url && (
                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-white/5">
                    <img
                      src={reviewingNewsItem.image_url}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Gallery of all submitted images */}
                {reviewingNewsItem.images && reviewingNewsItem.images.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider block mb-2">
                      All Submitted Images ({reviewingNewsItem.images.length})
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 bg-[#101D17]/40 p-3 rounded-2xl border border-white/10">
                      {reviewingNewsItem.images.map((url, idx) => (
                        <div key={`rev-${idx}`} className="relative aspect-square border border-white/10 rounded-xl overflow-hidden">
                          <img src={url} alt="Submitted" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Short Summary */}
                <div>
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider block mb-1">
                    Summary / Snippet
                  </span>
                  <p className="p-3.5 rounded-xl bg-[#101D17] border border-white/5 text-white font-medium italic">
                    "{reviewingNewsItem.summary}"
                  </p>
                </div>

                {/* Content Body */}
                <div>
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider block mb-2">
                    Full Content
                  </span>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 font-sans leading-relaxed text-sm text-gray-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {reviewingNewsItem.content}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-white/5">
                <button
                  onClick={() => handleApproveNewsSubmission(reviewingNewsItem)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  {actionLoading ? "Processing..." : "Approve & Publish"}
                </button>
                <button
                  onClick={() => handleRejectNewsSubmission(reviewingNewsItem)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={16} />
                  {actionLoading ? "Processing..." : "Reject Submission"}
                </button>
                <button
                  type="button"
                  onClick={() => setReviewingNewsItem(null)}
                  className="py-2.5 px-5 border border-white/10 hover:bg-white/5 rounded-xl text-gray-400 cursor-pointer font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
