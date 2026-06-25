import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { 
  Search, Trash2, Loader2 
} from "lucide-react";
import type { Profile } from "../../context/AuthContext";

const getPlanDisplayName = (type: string | null | undefined): string => {
  if (!type) return "None";
  switch (type.toLowerCase()) {
    case "individual": return "Small";
    case "sme": return "Medium";
    case "corporate": return "Large";
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export const UsersTab: React.FC = () => {
  const { toast, confirm } = useNotification();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setProfiles(data);
    } catch (err: any) {
      toast.error("Failed to load users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (item: Profile) => {
    const confirmed = await confirm({
      title: "Delete User Account",
      message: `Are you sure you want to permanently delete the account for "${item.full_name || item.email}"? This will also remove all their membership applications and event registrations. This action cannot be undone.`,
      confirmText: "Delete Permanently",
      variant: "danger",
    });
    if (!confirmed) return;

    if (item.id === user?.id) {
      toast.error("You cannot delete your own account.");
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase.rpc("admin_delete_user", {
        target_user_id: item.id,
      });
      if (error) throw error;
      await loadData();
      toast.success(`User "${item.full_name || item.email}" has been deleted.`);
    } catch (err: any) {
      toast.error("Failed to delete user: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleRole = async (item: Profile) => {
    const nextRole = item.role === "admin" ? "member" : "admin";
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: nextRole })
        .eq("id", item.id);
      if (error) throw error;
      await loadData();
      toast.success(`Role for ${item.full_name || item.email} updated to ${nextRole}.`);
    } catch (err: any) {
      toast.error("Error modifying role: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    [p.full_name, p.email, p.company_name].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="animate-spin text-green-700" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-[#0A1410] border border-white/5 rounded-3xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-base font-heading font-black text-white self-start sm:self-auto">All Registered Profiles</h3>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
          <input
            type="text"
            placeholder="Search user name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs focus:border-green-500 outline-none text-white placeholder-gray-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[#8A9690] font-bold uppercase tracking-wider">
              <th className="pb-4.5 pl-2">User details</th>
              <th className="pb-4.5">System Role</th>
              <th className="pb-4.5">Member Status</th>
              <th className="pb-4.5">Company Affiliation</th>
              <th className="pb-4.5 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-semibold">
            {filteredProfiles.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.01]">
                <td className="py-4.5 pl-2">
                  <div className="text-white font-bold">{item.full_name || "N/A"}</div>
                  <div className="text-[11px] text-[#8A9690] font-normal mt-0.5">{item.email}</div>
                </td>
                <td className="py-4.5 capitalize">{item.role}</td>
                <td className="py-4.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    item.membership_status === "active"
                      ? "bg-green-500/10 text-green-400 border border-green-500/25"
                      : item.membership_status === "pending"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                      : "bg-white/5 text-gray-400 border border-white/10"
                  }`}>
                    {item.membership_status} {item.membership_type && `(${getPlanDisplayName(item.membership_type)})`}
                  </span>
                </td>
                <td className="py-4.5 text-[#ECEFEF]">{item.company_name || "-"}</td>
                <td className="py-4.5 text-right pr-2">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => toggleRole(item)}
                      disabled={actionLoading}
                      className="px-2 py-1 rounded bg-[#1A382A] hover:bg-[#204936] text-[#ECEFEF] text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Set {item.role === "admin" ? "Member" : "Admin"}
                    </button>
                    {item.id !== user?.id && (
                      <button
                        onClick={() => handleDeleteUser(item)}
                        disabled={actionLoading}
                        title="Delete user"
                        className="p-1.5 rounded bg-red-900/30 hover:bg-red-800/50 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
