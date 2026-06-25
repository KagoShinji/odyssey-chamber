import React from "react";
import { motion } from "framer-motion";
import { Newspaper, Plus, Edit2, Trash2 } from "lucide-react";

interface NewsTabProps {
  myNews: any[];
  actionLoading: boolean;
  onNew: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

const NewsTab: React.FC<NewsTabProps> = ({ myNews, actionLoading, onNew, onEdit, onDelete }) => (
  <motion.div
    key="news"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]"
  >
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-xl font-heading font-black text-[#0D1A14] mb-1 text-left">
          News &amp; Announcement Submissions
        </h2>
        <p className="text-sm text-gray-500 text-left">
          Submit articles, updates, or announcements to be featured on the Chamber News wall.
        </p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-green-700 hover:bg-green-600 text-white text-xs font-bold transition-all shadow-diffuse cursor-pointer self-start sm:self-auto"
      >
        <Plus size={14} /> Submit Article
      </button>
    </div>

    {myNews.length === 0 ? (
      <div className="text-center py-12 px-6 flex flex-col items-center">
        <Newspaper className="mx-auto h-12 w-12 text-gray-305 mb-4" />
        <h4 className="font-heading font-semibold text-gray-900">No submissions yet</h4>
        <p className="text-sm text-gray-500 mt-1 max-w-[32ch] mx-auto">
          Share your company's milestones, announcements, or press releases with the Chamber network.
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
              <th className="pb-3.5 pl-2">Title</th>
              <th className="pb-3.5">Category</th>
              <th className="pb-3.5">Submission Date</th>
              <th className="pb-3.5">Status</th>
              <th className="pb-3.5 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-semibold text-gray-700">
            {myNews.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/40">
                <td className="py-4 pl-2 max-w-[200px] text-left">
                  <div className="text-gray-900 font-bold truncate" title={item.title}>{item.title}</div>
                  <div className="text-[10px] text-gray-400 font-normal truncate mt-0.5" title={item.summary}>{item.summary}</div>
                </td>
                <td className="py-4 text-left">{item.category}</td>
                <td className="py-4 text-left text-gray-400 font-normal">
                  {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="py-4 text-left">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                    item.status === "approved"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : item.status === "rejected"
                      ? "bg-red-50 text-red-700 border-red-100"
                      : "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                  }`}>
                    {item.status === "pending" ? "Pending Review" : item.status}
                  </span>
                </td>
                <td className="py-4 text-right pr-2">
                  <div className="flex items-center justify-end gap-1">
                    {item.status === "pending" && (
                      <>
                        <button
                          onClick={() => onEdit(item)}
                          disabled={actionLoading}
                          className="p-1 text-gray-400 hover:text-green-700 cursor-pointer"
                          title="Edit Draft"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          disabled={actionLoading}
                          className="p-1 text-gray-400 hover:text-red-700 cursor-pointer"
                          title="Delete Submission"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                    {item.status !== "pending" && (
                      <span className="text-[10px] text-gray-300 font-normal italic pr-2">Locked</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </motion.div>
);

export default NewsTab;
