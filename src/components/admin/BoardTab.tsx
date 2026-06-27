import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useNotification } from "../../context/NotificationContext";
import { uploadImage } from "../../lib/storage";
import { Search, Plus, User, Upload, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface BoardMemberRow {
  id: string;
  name: string;
  position: string;
  rank: number;
  image_url: string | null;
  autobiography?: string | null;
  created_at: string;
  updated_at: string;
}

export const BoardTab: React.FC = () => {
  const { toast, confirm } = useNotification();
  const [boardMembers, setBoardMembers] = useState<BoardMemberRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal and editing states
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [editingBoardMember, setEditingBoardMember] = useState<BoardMemberRow | null>(null);

  // Form states
  const [boardName, setBoardName] = useState("");
  const [boardPosition, setBoardPosition] = useState("");
  const [boardRank, setBoardRank] = useState(100);
  const [boardImgUrl, setBoardImgUrl] = useState("");
  const [boardImgFile, setBoardImgFile] = useState<File | null>(null);
  const [boardImgPreview, setBoardImgPreview] = useState("");
  const [boardAutobiography, setBoardAutobiography] = useState("");

  // Search & Pagination states
  const [boardSearchQuery, setBoardSearchQuery] = useState("");
  const [boardCurrentPage, setBoardCurrentPage] = useState(1);
  const [boardRowsPerPage, setBoardRowsPerPage] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("board_members")
        .select("*")
        .order("rank", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      if (data) setBoardMembers(data);
    } catch (err: any) {
      toast.error("Failed to load board members: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetBoardForm = () => {
    setEditingBoardMember(null);
    setBoardName("");
    setBoardPosition("");
    setBoardRank(100);
    setBoardImgUrl("");
    setBoardImgFile(null);
    setBoardImgPreview("");
    setBoardAutobiography("");
  };

  const handleSaveBoardMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim() || !boardPosition.trim()) {
      toast.error("Name and Position are required.");
      return;
    }

    setActionLoading(true);
    try {
      let finalImgUrl = boardImgUrl;
      if (boardImgFile) {
        finalImgUrl = await uploadImage(boardImgFile, "board-members");
      }

      const payload = {
        name: boardName.trim(),
        position: boardPosition.trim(),
        rank: Number(boardRank),
        image_url: finalImgUrl || null,
        autobiography: boardAutobiography.trim() || null,
      };

      if (editingBoardMember) {
        const { error } = await supabase
          .from("board_members")
          .update(payload)
          .eq("id", editingBoardMember.id);
        if (error) throw error;
        toast.success("Board member updated successfully!");
      } else {
        const { error } = await supabase
          .from("board_members")
          .insert(payload);
        if (error) throw error;
        toast.success("Board member added successfully!");
      }

      setShowBoardModal(false);
      resetBoardForm();
      await loadData();
    } catch (err: any) {
      toast.error("Failed to save board member: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBoardMember = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Board Member",
      message: "Are you sure you want to remove this board member from the list?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("board_members")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Board member deleted.");
      await loadData();
    } catch (err: any) {
      toast.error("Failed to delete board member: " + err.message);
    }
  };

  const handleEditBoardMemberClick = (member: BoardMemberRow) => {
    setEditingBoardMember(member);
    setBoardName(member.name);
    setBoardPosition(member.position);
    setBoardRank(member.rank);
    setBoardImgUrl(member.image_url || "");
    setBoardImgPreview(member.image_url || "");
    setBoardAutobiography(member.autobiography || "");
    setShowBoardModal(true);
  };

  const filtered = boardMembers.filter(m => 
    m.name.toLowerCase().includes(boardSearchQuery.toLowerCase()) ||
    m.position.toLowerCase().includes(boardSearchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / boardRowsPerPage);
  const startIndex = (boardCurrentPage - 1) * boardRowsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + boardRowsPerPage);

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="animate-spin text-green-700" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-[#0A1410] border border-white/5 rounded-3xl p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-heading font-black text-white">Board of Directors CMS</h3>
            <p className="text-xs text-[#8A9690] mt-1 font-semibold">Manage core executive officers and board directors displayed on the public Board of Directors page.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="text"
                placeholder="Search board members..."
                value={boardSearchQuery}
                onChange={(e) => {
                  setBoardSearchQuery(e.target.value);
                  setBoardCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs focus:border-green-500 outline-none text-white placeholder-gray-500 font-semibold"
              />
            </div>
            <button
              onClick={() => {
                resetBoardForm();
                setShowBoardModal(true);
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[#8A9690] font-bold uppercase tracking-wider">
              <th className="pb-4.5 pl-2">Photo</th>
              <th className="pb-4.5">Name</th>
              <th className="pb-4.5">Position</th>
              <th className="pb-4.5">Rank</th>
              <th className="pb-4.5 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02] font-semibold text-gray-300">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No board members found.
                </td>
              </tr>
            ) : (
              paginated.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.01]">
                  <td className="py-4 pl-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex items-center justify-center border border-white/10">
                      {member.image_url ? (
                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="text-gray-500" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 font-bold text-white">{member.name}</td>
                  <td className="py-4 text-[#8A9690]">{member.position}</td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] text-green-400 font-mono">
                      {member.rank}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditBoardMemberClick(member)}
                        className="p-1 text-[#8A9690] hover:text-green-500 cursor-pointer transition-colors"
                        title="Edit Member Details"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteBoardMember(member.id)}
                        className="p-1 text-[#8A9690] hover:text-red-500 cursor-pointer transition-colors"
                        title="Remove Board Member"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-white/5 text-[11px] text-[#8A9690] font-bold select-none">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={boardRowsPerPage}
              onChange={(e) => {
                setBoardRowsPerPage(Number(e.target.value));
                setBoardCurrentPage(1);
              }}
              className="px-2 py-1 bg-[#101D17] border border-white/10 rounded-lg text-white font-bold outline-none cursor-pointer focus:border-green-500"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size} rows</option>
              ))}
            </select>
            <span>per page</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setBoardCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={boardCurrentPage === 1}
              className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 cursor-pointer transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setBoardCurrentPage(p)}
                className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  boardCurrentPage === p
                    ? "bg-green-700 text-white"
                    : "bg-white/[0.02] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setBoardCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={boardCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 cursor-pointer transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* BOARD MEMBER EDIT/CREATE MODAL */}
      <AnimatePresence>
        {showBoardModal && (
          <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0A1410] border border-white/10 rounded-3xl p-6 overflow-y-auto max-h-[90vh] text-left"
            >
              <h3 className="font-heading font-black text-white text-lg mb-6">
                {editingBoardMember ? "Edit Board Member Details" : "Add Board Member"}
              </h3>

              <form onSubmit={handleSaveBoardMember} className="space-y-4 text-xs font-semibold text-gray-400">
                <div>
                  <label className="block text-[10px] font-heading font-black text-[#8A9690] uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Carl Cabusas"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101D17] border border-white/10 focus:border-green-500 rounded-xl outline-none text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-heading font-black text-[#8A9690] uppercase tracking-wider mb-1.5">Position / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. President, Treasurer, Board of Directors"
                    value={boardPosition}
                    onChange={(e) => setBoardPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101D17] border border-white/10 focus:border-green-500 rounded-xl outline-none text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-heading font-black text-[#8A9690] uppercase tracking-wider mb-1.5">Sort Rank *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={boardRank}
                    onChange={(e) => setBoardRank(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#101D17] border border-white/10 focus:border-green-500 rounded-xl outline-none text-white font-semibold font-mono"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block font-normal">Low rank numbers sort first. E.g. President = 1, VPs = 2, Directors = 10+.</span>
                </div>

                <div>
                  <label className="block text-[10px] font-heading font-black text-[#8A9690] uppercase tracking-wider mb-1.5">Autobiography / Biography</label>
                  <textarea
                    rows={4}
                    placeholder="Enter autobiography or biography details..."
                    value={boardAutobiography}
                    onChange={(e) => setBoardAutobiography(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101D17] border border-white/10 focus:border-green-500 rounded-xl outline-none text-white font-semibold resize-none"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-[10px] font-heading font-black text-[#8A9690] uppercase tracking-wider mb-1.5">Member Avatar / Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 relative">
                      {boardImgPreview ? (
                        <img src={boardImgPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="board-photo-upload"
                        className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white/[0.02] border border-white/10 hover:border-green-500 rounded-xl text-[11px] font-bold text-gray-300 hover:text-white transition-all w-full sm:w-auto"
                      >
                        <Upload size={13} />
                        {boardImgFile ? boardImgFile.name : "Select Image File"}
                      </label>
                      <input
                        id="board-photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBoardImgFile(file);
                            setBoardImgPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {boardImgUrl && !boardImgFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setBoardImgUrl("");
                            setBoardImgPreview("");
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300 font-bold block mt-1 px-1.5 cursor-pointer"
                        >
                          Remove Current Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-white/5 mt-6">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-diffuse text-xs"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Saving...
                      </>
                    ) : (
                      "Save Member Details"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBoardModal(false);
                      resetBoardForm();
                    }}
                    className="px-4.5 py-3 border border-white/10 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-colors text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
