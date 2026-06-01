import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { supabase } from "../lib/supabase";
import { uploadImage } from "../lib/storage";
import { 
  Users, CreditCard, CalendarDays, Newspaper, Building2, 
  Settings, TrendingUp, CheckCircle, XCircle, Trash2, Edit2, 
  Plus, ArrowRight, Loader2, QrCode, Search, Check, RefreshCw, X, ArrowLeft, Archive,
  UserCheck, UserPlus, Copy
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Types matching the schema
interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  membership_status: string;
  membership_type: string | null;
  company_name: string | null;
  phone: string | null;
  created_at?: string;
}

interface ApplicationRow {
  id: string;
  user_id: string;
  membership_type: string;
  company_name: string | null;
  business_category: string | null;
  phone: string | null;
  business_address: string | null;
  payment_method: string;
  payment_reference: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface EventRow {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  speaker: string;
  price: number;
  non_member_price: number;
  tag: string;
  tag_color: string;
  capacity?: number;
  image_url?: string;
  is_featured: boolean;
  is_archived: boolean;
}

interface EventRegistrationRow {
  id: string;
  full_name: string;
  email: string;
  payment_status: string;
  attendance_status: string;
  qr_code: string;
}

interface PricingRow {
  id: string;
  type: string;
  name: string;
  price: number;
  period: string;
  description: string;
  benefits: string[];
}

interface QRSettingRow {
  id: string;
  name: string;
  description: string;
  payment_instructions: string;
  qr_code_url: string;
  is_active: boolean;
}

interface NewsRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  read_time: string;
  author: string;
  image_url?: string;
}

interface DirectoryRow {
  id: string;
  business_name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  category: string;
  address: string;
  is_featured: boolean;
  is_verified: boolean;
}

const Admin: React.FC = () => {
  const { user, profile, loading, isAdmin } = useAuth();
  const { toast, confirm } = useNotification();
  const navigate = useNavigate();

  // Selected Active Tab
  const [activeTab, setActiveTab] = useState<
    "analytics" | "applications" | "users" | "members" | "events" | "pricing" | "qrs" | "news" | "directory"
  >(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const validTabs = ["analytics", "applications", "users", "members", "events", "pricing", "qrs", "news", "directory"];
    return (tab && validTabs.includes(tab) ? tab : "analytics") as any;
  });

  // Database lists
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [qrs, setQrs] = useState<QRSettingRow[]>([]);
  const [news, setNews] = useState<NewsRow[]>([]);
  const [directory, setDirectory] = useState<DirectoryRow[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Loading States
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal / Editing form states
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventSpeaker, setEventSpeaker] = useState("");
  const [eventPrice, setEventPrice] = useState(0);
  const [eventNonMemberPrice, setEventNonMemberPrice] = useState(0);
  const [eventTag, setEventTag] = useState("Event");
  const [eventImg, setEventImg] = useState("");
  
  // Share Invite Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEvent, setShareEvent] = useState<EventRow | null>(null);
  const [eventView, setEventView] = useState<"active" | "archived">("active");
  const [eventImgFile, setEventImgFile] = useState<File | null>(null);
  const [eventFeatured, setEventFeatured] = useState(false);

  // QR Settings Editor
  const [editingQr, setEditingQr] = useState<QRSettingRow | null>(null);
  const [qrName, setQrName] = useState("");
  const [qrDesc, setQrDesc] = useState("");
  const [qrInstructions, setQrInstructions] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);

  // Pricing CMS Editor
  const [editingPrice, setEditingPrice] = useState<PricingRow | null>(null);
  const [priceAmt, setPriceAmt] = useState(0);
  const [priceDesc, setPriceDesc] = useState("");
  const [priceBenefits, setPriceBenefits] = useState("");

  // News CMS Editor
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNewsItem, setEditingNewsItem] = useState<NewsRow | null>(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsCategory, setNewsCategory] = useState("General");
  const [newsImg, setNewsImg] = useState("");
  const [newsImgFile, setNewsImgFile] = useState<File | null>(null);

  // Member Management States
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberCompany, setNewMemberCompany] = useState("");
  const [newMemberPlan, setNewMemberPlan] = useState("individual");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberAddress, setNewMemberAddress] = useState("");
  const [newMemberCategory, setNewMemberCategory] = useState("Retail");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [createdCreds, setCreatedCreds] = useState<{ email: string; pass: string; name: string } | null>(null);
  const [editingMember, setEditingMember] = useState<ProfileRow | null>(null);
  const [memberStatusFilter, setMemberStatusFilter] = useState<"all" | "active" | "pending" | "expired">("all");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (!isAdmin) {
        navigate("/dashboard");
      }
    }
  }, [user, loading, isAdmin, navigate]);

  // Load all backend tables
  const loadDatabase = async () => {
    setPageLoading(true);
    try {
      // 1. Load users
      const { data: usersData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (usersData) setProfiles(usersData);

      // 2. Load applications joined with profile
      const { data: appsData } = await supabase
        .from("membership_applications")
        .select(`
          id, user_id, membership_type, company_name, business_category, phone, business_address, 
          payment_method, payment_reference, status, created_at,
          profiles ( full_name, email )
        `)
        .order("created_at", { ascending: false });
      if (appsData) setApplications(appsData as any);

      // 3. Load events
      const { data: eventsData } = await supabase.from("events").select("*").order("date", { ascending: true });
      if (eventsData) setEvents(eventsData);

      // 4. Load pricing CMS
      const { data: pricingData } = await supabase.from("membership_pricing").select("*").order("price", { ascending: true });
      if (pricingData) setPricing(pricingData);

      // 5. Load QRs CMS
      const { data: qrsData } = await supabase.from("qr_settings").select("*").order("created_at", { ascending: true });
      if (qrsData) setQrs(qrsData);

      // 6. Load News CMS
      const { data: newsData } = await supabase.from("news").select("*").order("published_at", { ascending: false });
      if (newsData) setNews(newsData);

      // 7. Load Directory Listings
      const { data: dirData } = await supabase.from("business_directory").select("*").order("business_name", { ascending: true });
      if (dirData) setDirectory(dirData);

    } catch (error) {
      console.error("Failed to load admin databases:", error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadDatabase();
    }
  }, [user, isAdmin]);

  // APPROVE MEMBERSHIP APPLICATION
  const handleApproveApplication = async (app: ApplicationRow) => {
    setActionLoading(true);
    try {
      // 1. Update application status to approved and payment status to approved
      const { error: appError } = await supabase
        .from("membership_applications")
        .update({ status: "approved", payment_status: "approved" })
        .eq("id", app.id);
      if (appError) throw appError;

      // 2. Update user's profile to Active Member
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          membership_status: "active",
          membership_type: app.membership_type,
          company_name: app.company_name,
          phone: app.phone,
          business_address: app.business_address,
          business_category: app.business_category,
        })
        .eq("id", app.user_id);
      if (profileError) throw profileError;

      // 3. Automatically generate a public Business Directory entry (if company name is provided)
      if (app.company_name) {
        // Check if directory listing already exists
        const { data: existingListing } = await supabase
          .from("business_directory")
          .select("id")
          .eq("user_id", app.user_id)
          .maybeSingle();

        if (!existingListing) {
          const { error: dirError } = await supabase
            .from("business_directory")
            .insert({
              user_id: app.user_id,
              business_name: app.company_name,
              description: `Registered Member business specializing in ${app.business_category || "commerce"}.`,
              contact_email: app.profiles?.email,
              contact_phone: app.phone,
              category: app.business_category || "Retail",
              address: app.business_address || "Talisay City",
              is_verified: true,
              is_featured: false,
            });
          if (dirError) console.error("Error creating auto-directory listing:", dirError.message);
        } else {
          // Verify existing listing
          await supabase
            .from("business_directory")
            .update({ is_verified: true })
            .eq("id", existingListing.id);
        }
      }

      await loadDatabase();
      toast.success("Application approved, user activated, and directory listing verified!");
    } catch (err: any) {
      toast.error("Error approving application: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // REJECT MEMBERSHIP APPLICATION
  const handleRejectApplication = async (app: ApplicationRow) => {
    const confirmed = await confirm({
      title: "Reject Application",
      message: "Are you sure you want to reject this application?",
      confirmText: "Reject",
      variant: "danger",
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      const { error: appError } = await supabase
        .from("membership_applications")
        .update({ status: "rejected", payment_status: "rejected" })
        .eq("id", app.id);
      if (appError) throw appError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ membership_status: "rejected" })
        .eq("id", app.user_id);
      if (profileError) throw profileError;

      await loadDatabase();
      toast.success("Application rejected.");
    } catch (err: any) {
      toast.error("Error rejecting application: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };



  // SAVE EVENT (NEW OR EDIT)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventVenue || !eventSpeaker) return;

    setActionLoading(true);
    try {
      let finalImgUrl = eventImg;
      if (eventImgFile) {
        finalImgUrl = await uploadImage(eventImgFile, "events");
      }

      // Determine colors based on tags
      let computedColor = "bg-green-100 text-green-700";
      if (eventTag.toLowerCase() === "summit") computedColor = "bg-gold/15 text-amber-800 border border-gold/25";
      if (eventTag.toLowerCase() === "expo") computedColor = "bg-amber-100 text-amber-700";

      const eventData = {
        title: eventTitle,
        description: eventDesc,
        date: eventDate,
        time: eventTime,
        venue: eventVenue,
        speaker: eventSpeaker,
        price: Number(eventPrice),
        non_member_price: Number(eventNonMemberPrice),
        tag: eventTag,
        tag_color: computedColor,
        is_featured: eventFeatured,
        image_url: finalImgUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=900&auto=format&fit=crop",
      };

      if (editingEvent) {
        const { error } = await supabase.from("events").update(eventData).eq("id", editingEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(eventData);
        if (error) throw error;
      }

      setShowEventModal(false);
      setEditingEvent(null);
      resetEventForm();
      await loadDatabase();
      toast.success("Event saved successfully!");
    } catch (err: any) {
      toast.error("Error saving event: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const resetEventForm = () => {
    setEventTitle("");
    setEventDesc("");
    setEventDate("");
    setEventTime("");
    setEventVenue("");
    setEventSpeaker("");
    setEventPrice(0);
    setEventNonMemberPrice(0);
    setEventTag("Event");
    setEventImg("");
    setEventImgFile(null);
    setEventFeatured(false);
  };

  // DELETE EVENT
  const handleDeleteEvent = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Event",
      message: "Are you sure you want to delete this event and all its registrations?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      await loadDatabase();
      toast.success("Event deleted.");
    } catch (err: any) {
      toast.error("Failed to delete event: " + err.message);
    }
  };

  // Toggle Archive Status
  const handleToggleArchiveEvent = async (evt: EventRow) => {
    const nextStatus = !evt.is_archived;
    const confirmed = await confirm({
      title: nextStatus ? "Archive Event" : "Unarchive Event",
      message: `Are you sure you want to ${nextStatus ? "archive" : "unarchive"} "${evt.title}"? ${
        nextStatus ? "It will be hidden from public registration list." : "It will become active on public lists again."
      }`,
      confirmText: nextStatus ? "Archive" : "Unarchive",
      variant: nextStatus ? "danger" : "primary"
    });
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("events")
        .update({ is_archived: nextStatus })
        .eq("id", evt.id);

      if (error) throw error;
      
      await loadDatabase();
      toast.success(nextStatus ? "Event archived successfully!" : "Event unarchived!");
    } catch (err: any) {
      toast.error("Failed to update archive status: " + err.message);
    }
  };

  // Generate secure random password
  const handleAutoGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "TC-";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewMemberPassword(pass);
    toast.info("Temporary password auto-generated!");
  };

  // CREATE MEMBER AND USER ACCOUNT
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail || !newMemberPassword) {
      toast.error("Please fill in Name, Email, and Password.");
      return;
    }

    setActionLoading(true);
    try {
      // 1. Check if email already exists in profiles
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newMemberEmail.trim())
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingProfile) {
        toast.error("A user profile with this email address already exists in the system.");
        setActionLoading(false);
        return;
      }

      // 2. Instantiate temporary client to create user without overriding current admin session
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      // 3. Register user via auth.signUp
      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: newMemberEmail.trim(),
        password: newMemberPassword,
        options: {
          data: {
            full_name: newMemberName.trim(),
            company_name: newMemberCompany.trim(),
            role: "member",
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user account. No user data returned.");

      // 4. Update the profile to active member and other chosen fields
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          membership_status: "active",
          membership_type: newMemberPlan,
          company_name: newMemberCompany.trim() || null,
          phone: newMemberPhone.trim() || null,
          business_address: newMemberAddress.trim() || null,
          business_category: newMemberCategory || null,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      // 5. Automatically create Business Directory Listing if company name is provided
      if (newMemberCompany.trim()) {
        const { error: dirError } = await supabase
          .from("business_directory")
          .insert({
            user_id: authData.user.id,
            business_name: newMemberCompany.trim(),
            description: `Registered Chamber Member business specializing in ${newMemberCategory || "commerce"}.`,
            contact_email: newMemberEmail.trim(),
            contact_phone: newMemberPhone.trim() || null,
            category: newMemberCategory || "Retail",
            address: newMemberAddress.trim() || "Talisay City",
            is_verified: true,
            is_featured: false,
          });
        if (dirError) console.error("Error creating auto-directory listing:", dirError.message);
      }

      // 6. Set created credentials for showing to admin
      setCreatedCreds({
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        pass: newMemberPassword,
      });

      // Reset form states
      setNewMemberName("");
      setNewMemberEmail("");
      setNewMemberCompany("");
      setNewMemberPlan("individual");
      setNewMemberPhone("");
      setNewMemberAddress("");
      setNewMemberCategory("Retail");
      setNewMemberPassword("");

      setShowMemberModal(false);
      setShowCredsModal(true);
      
      await loadDatabase();
      toast.success("Member account created successfully!");
    } catch (err: any) {
      toast.error("Error creating member: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // UPDATE EXISTING MEMBER STATUS AND DETAILS
  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setActionLoading(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: newMemberName.trim() || null,
          membership_status: newMemberPlan, // in this context newMemberPlan state stores status when editing
          membership_type: newMemberCategory || null, // in this context newMemberCategory state stores plan when editing
          company_name: newMemberCompany.trim() || null,
          phone: newMemberPhone.trim() || null,
        })
        .eq("id", editingMember.id);

      if (profileError) throw profileError;

      // Automatically create directory entry if they are set to active and have a company and directory entry doesn't exist yet
      if (newMemberPlan === "active" && newMemberCompany.trim()) {
        const { data: existingListing } = await supabase
          .from("business_directory")
          .select("id")
          .eq("user_id", editingMember.id)
          .maybeSingle();

        if (!existingListing) {
          const { error: dirError } = await supabase
            .from("business_directory")
            .insert({
              user_id: editingMember.id,
              business_name: newMemberCompany.trim(),
              description: `Registered Chamber Member business specializing in retail.`,
              contact_email: editingMember.email,
              contact_phone: newMemberPhone.trim() || null,
              category: "Retail",
              address: "Talisay City",
              is_verified: true,
              is_featured: false,
            });
          if (dirError) console.error("Error creating auto-directory listing on update:", dirError.message);
        }
      }

      setShowEditMemberModal(false);
      setEditingMember(null);
      await loadDatabase();
      toast.success("Member details updated successfully!");
    } catch (err: any) {
      toast.error("Error updating member details: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditMemberClick = (member: ProfileRow) => {
    setEditingMember(member);
    setNewMemberName(member.full_name || "");
    setNewMemberEmail(member.email || "");
    setNewMemberCompany(member.company_name || "");
    setNewMemberPlan(member.membership_status || "active"); // used for status dropdown
    setNewMemberCategory(member.membership_type || "individual"); // used for plan dropdown
    setNewMemberPhone(member.phone || "");
    setShowEditMemberModal(true);
  };

  // Trigger Event Share Modal
  const handleShareEventClick = (evt: EventRow) => {
    setShareEvent(evt);
    setShowShareModal(true);
  };

  // Download QR Code for Event Registration
  const handleDownloadShareQR = async (evt: EventRow, url: string) => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `register_qr_${evt.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileUrl);
      toast.success("Registration QR Code downloaded!");
    } catch (e: any) {
      toast.error("Failed to download QR code: " + e.message);
    }
  };

  // SAVE QR METHOD SETTING
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
      await loadDatabase();
      toast.success("QR Setting updated!");
    } catch (err: any) {
      toast.error("Failed to save QR setting: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // SAVE MEMBERSHIP PRICING TIER (CMS)
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
      await loadDatabase();
      toast.success("Pricing plan updated!");
    } catch (err: any) {
      toast.error("Failed to save pricing: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // SAVE NEWS POST (CMS)
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsSummary || !newsContent) return;
    setActionLoading(true);
    try {
      let finalNewsImgUrl = newsImg;
      if (newsImgFile) {
        finalNewsImgUrl = await uploadImage(newsImgFile, "news");
      }
      const newsData = {
        title: newsTitle,
        summary: newsSummary,
        content: newsContent,
        category: newsCategory,
        image_url: finalNewsImgUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=700&auto=format&fit=crop",
      };

      if (editingNewsItem) {
        const { error } = await supabase.from("news").update(newsData).eq("id", editingNewsItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news").insert(newsData);
        if (error) throw error;
      }

      setShowNewsModal(false);
      setEditingNewsItem(null);
      setNewsTitle("");
      setNewsSummary("");
      setNewsContent("");
      setNewsCategory("General");
      setNewsImg("");
      setNewsImgFile(null);
      await loadDatabase();
      toast.success("News article published successfully!");
    } catch (err: any) {
      toast.error("Failed to publish news: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE NEWS POST
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
      await loadDatabase();
      toast.success("News article deleted.");
    } catch (err: any) {
      toast.error("Failed to delete article: " + err.message);
    }
  };

  // VERIFY / FEATURE DIRECTORY LISTING
  const handleToggleDirectoryVerify = async (biz: DirectoryRow) => {
    try {
      const { error } = await supabase
        .from("business_directory")
        .update({ is_verified: !biz.is_verified })
        .eq("id", biz.id);
      if (error) throw error;
      await loadDatabase();
    } catch (err: any) {
      toast.error("Error toggling verification: " + err.message);
    }
  };

  const handleToggleDirectoryFeatured = async (biz: DirectoryRow) => {
    try {
      const { error } = await supabase
        .from("business_directory")
        .update({ is_featured: !biz.is_featured })
        .eq("id", biz.id);
      if (error) throw error;
      await loadDatabase();
    } catch (err: any) {
      toast.error("Error toggling featured tag: " + err.message);
    }
  };

  const handleDeleteDirectory = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Directory Listing",
      message: "Are you sure you want to delete this directory listing?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      const { error } = await supabase.from("business_directory").delete().eq("id", id);
      if (error) throw error;
      await loadDatabase();
      toast.success("Listing deleted.");
    } catch (err: any) {
      toast.error("Failed to delete listing: " + err.message);
    }
  };

  // Helper values for calculations
  const totalProfilesCount = profiles.length;
  const activeMembersCount = profiles.filter(p => p.membership_status === "active").length;
  const pendingAppsCount = applications.filter(a => a.status === "pending").length;
  
  // Calculate revenue: sum of plans of active users
  const totalRevenueEstimates = profiles.reduce((sum, p) => {
    if (p.membership_status !== "active") return sum;
    const plan = pricing.find(pr => pr.type === p.membership_type);
    return sum + (plan ? Number(plan.price) : 0);
  }, 0);

  // Show loading spinner while auth or page data is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf6]">
        <Loader2 size={36} className="animate-spin text-green-700" />
      </div>
    );
  }

  // If not logged in or not admin, the useEffect above handles redirect.
  // Show a brief spinner while navigation processes.
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf6]">
        <Loader2 size={36} className="animate-spin text-green-700" />
      </div>
    );
  }

  // Admin data is loading
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf6]">
        <Loader2 size={36} className="animate-spin text-green-700" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#0E1B15] text-[#ECEFEF] pt-6 md:pt-8 pb-16 flex">
      {/* Dynamic Admin Left Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0A1410] p-6 hidden md:flex flex-col gap-6 select-none flex-shrink-0">
        <div>
          <span className="text-[10px] font-heading font-bold text-green-400 tracking-[0.2em] uppercase">Control Panel</span>
          <h2 className="text-sm font-heading font-black text-white mt-1">Chamber Admin</h2>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1.5">
          {[
            { id: "analytics", label: "Analytics Overview", icon: TrendingUp },
            { id: "applications", label: "Applications", icon: CreditCard, count: pendingAppsCount },
            { id: "users", label: "User Management", icon: Users },
            { id: "members", label: "Member Management", icon: UserCheck },
            { id: "events", label: "Events & Passes", icon: CalendarDays },
            { id: "pricing", label: "Membership Fees CMS", icon: CreditCard },
            { id: "qrs", label: "QR Payment CMS", icon: QrCode },
            { id: "news", label: "News & Announcements", icon: Newspaper },
            { id: "directory", label: "Business Directory", icon: Building2 },
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id as any);
                setSearchQuery("");
                const url = new URL(window.location.href);
                url.searchParams.set("tab", id);
                window.history.pushState({}, "", url.toString());
              }}
              className={`w-full flex items-center justify-between px-4.5 py-3 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${
                activeTab === id
                  ? "bg-green-700 text-white shadow-diffuse"
                  : "text-[#8A9690] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={15} /> {label}
              </span>
              {count !== undefined && count > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/5 pt-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-[12px] font-semibold text-[#8A9690] hover:bg-white/5 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={15} /> Exit Admin Console
          </button>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto overflow-y-auto">
        {/* Mobile Tab Navigation */}
        <div className="md:hidden mb-6 overflow-x-auto pb-3 flex gap-2 border-b border-white/5 scrollbar-none -mx-6 px-6">
          {[
            { id: "analytics", label: "Analytics", icon: TrendingUp },
            { id: "applications", label: "Applications", icon: CreditCard, count: pendingAppsCount },
            { id: "users", label: "Users", icon: Users },
            { id: "members", label: "Members", icon: UserCheck },
            { id: "events", label: "Events", icon: CalendarDays },
            { id: "pricing", label: "Plans CMS", icon: CreditCard },
            { id: "qrs", label: "QR CMS", icon: QrCode },
            { id: "news", label: "News CMS", icon: Newspaper },
            { id: "directory", label: "Directory", icon: Building2 },
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id as any);
                setSearchQuery("");
                const url = new URL(window.location.href);
                url.searchParams.set("tab", id);
                window.history.pushState({}, "", url.toString());
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                activeTab === id
                  ? "bg-green-700 text-white shadow-diffuse"
                  : "bg-white/[0.02] border border-white/5 text-[#8A9690] hover:text-white"
              }`}
            >
              <Icon size={13} />
              <span>{label}</span>
              {count !== undefined && count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[8px] font-bold">
                  {count}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer bg-white/[0.02] border border-white/5 text-[#8A9690] hover:text-white"
          >
            <ArrowLeft size={13} />
            <span>Exit Admin</span>
          </button>
        </div>
        {/* Dynamic header depending on tab */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-heading font-black text-white leading-tight capitalize">
              {activeTab.replace("-", " ")}
            </h1>
            <p className="text-xs text-[#8A9690] mt-1">
              Admin console to manage Chamber of Commerce databases.
            </p>
          </div>
          
          <button
            onClick={() => loadDatabase()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 text-xs text-[#ECEFEF] bg-[#11241C] hover:bg-[#152F24] transition-colors cursor-pointer self-start"
          >
            <RefreshCw size={12} /> Sync Databases
          </button>
        </div>

        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Stat Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Active Members", count: activeMembersCount, icon: Users, color: "text-emerald-400 bg-emerald-500/10" },
                { label: "Pending Approvals", count: pendingAppsCount, icon: CreditCard, color: "text-amber-400 bg-amber-500/10" },
                { label: "Total Registered Users", count: totalProfilesCount, icon: Users, color: "text-blue-400 bg-blue-500/10" },
                { label: "Annual Member Revenue", count: `PHP ${totalRevenueEstimates.toLocaleString()}`, icon: TrendingUp, color: "text-gold bg-amber-500/10" },
              ].map(({ label, count, icon: Icon, color }) => (
                <div key={label} className="bg-[#0A1410] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-32">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-[#8A9690] leading-tight max-w-[15ch]">{label}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon size={15} />
                    </div>
                  </div>
                  <div className="text-xl font-heading font-black text-white">{count}</div>
                </div>
              ))}
            </div>

            {/* Member Tiers distribution grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#0A1410] border border-white/5 rounded-3xl p-6">
                <h3 className="text-sm font-heading font-bold text-white mb-6">Membership Tier Distribution</h3>
                <div className="space-y-4">
                  {pricing.map((plan) => {
                    const count = profiles.filter(p => p.membership_status === "active" && p.membership_type === plan.type).length;
                    const pct = activeMembersCount > 0 ? (count / activeMembersCount) * 100 : 0;
                    return (
                      <div key={plan.id} className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="capitalize">{plan.name} Member</span>
                          <span>{count} ({Math.round(pct)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-green-600 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#0A1410] border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-heading font-bold text-white mb-3">Database Integrity Checklist</h3>
                  <p className="text-xs text-[#8A9690] leading-relaxed mb-6">
                    All tables are encrypted under strict Postgres Row Level Security (RLS). Public users can access directories, plans, and events, while member data is isolated.
                  </p>
                </div>
                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="flex items-center gap-2"><Check className="text-green-500" size={15} /> Row Level Security Active</div>
                  <div className="flex items-center gap-2"><Check className="text-green-500" size={15} /> Sign-up Profile Auto-Trigger Active</div>
                  <div className="flex items-center gap-2"><Check className="text-green-500" size={15} /> Admin Security Definer Function Validated</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEMBERSHIP APPLICATIONS */}
        {activeTab === "applications" && (
          <div className="bg-[#0A1410] border border-white/5 rounded-3xl overflow-hidden p-6">
            <h3 className="text-base font-heading font-black text-white mb-6">Pending Payment Approvals</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[#8A9690] font-bold uppercase tracking-wider">
                    <th className="pb-4.5 pl-2">Applicant</th>
                    <th className="pb-4.5">Plan Details</th>
                    <th className="pb-4.5">Company Info</th>
                    <th className="pb-4.5">Reference Account</th>
                    <th className="pb-4.5">Status</th>
                    <th className="pb-4.5 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/[0.01]">
                      <td className="py-4.5 pl-2">
                        <div className="text-white font-bold">{app.profiles?.full_name || "N/A"}</div>
                        <div className="text-[11px] text-[#8A9690] font-normal mt-0.5">{app.profiles?.email}</div>
                      </td>
                      <td className="py-4.5 capitalize">{app.membership_type}</td>
                      <td className="py-4.5">
                        <div className="text-white">{app.company_name}</div>
                        <div className="text-[11px] text-[#8A9690] font-normal mt-0.5">{app.business_category}</div>
                      </td>
                      <td className="py-4.5">
                        <div className="text-white capitalize">{app.payment_method.replace("_", " ")}</div>
                        <div className="text-[11px] text-[#8A9690] font-mono mt-0.5">{app.payment_reference}</div>
                      </td>
                      <td className="py-4.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          app.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                            : app.status === "approved"
                            ? "bg-green-500/10 text-green-400 border border-green-500/25"
                            : "bg-red-500/10 text-red-400 border border-red-500/25"
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4.5 text-right pr-2">
                        {app.status === "pending" && (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveApplication(app)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded bg-green-700 hover:bg-green-600 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectApplication(app)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded bg-red-800 hover:bg-red-700 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-500">
                        No membership applications submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: USER MANAGEMENT */}
        {activeTab === "users" && (
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
                    <th className="pb-4.5 text-right pr-2">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold">
                  {profiles
                    .filter(p => 
                      [p.full_name, p.email, p.company_name].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item) => (
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
                            {item.membership_status} {item.membership_type && `(${item.membership_type})`}
                          </span>
                        </td>
                        <td className="py-4.5 text-[#ECEFEF]">{item.company_name || "-"}</td>
                        <td className="py-4.5 text-right pr-2">
                          <button
                            onClick={async () => {
                              const nextRole = item.role === "admin" ? "member" : "admin";
                              setActionLoading(true);
                              const { error } = await supabase
                                .from("profiles")
                                .update({ role: nextRole })
                                .eq("id", item.id);
                              if (error) toast.error("Error modifying role: " + error.message);
                              await loadDatabase();
                              setActionLoading(false);
                            }}
                            disabled={actionLoading}
                            className="px-2 py-1 rounded bg-[#1A382A] hover:bg-[#204936] text-[#ECEFEF] text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Set {item.role === "admin" ? "Member" : "Admin"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3.5: MEMBER MANAGEMENT */}
        {activeTab === "members" && (
          <div className="space-y-6">
            <div className="bg-[#0A1410] border border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-heading font-black text-white">Chamber Members</h3>
                  {/* Status Filters */}
                  <div className="flex gap-1.5 mt-2">
                    {[
                      { id: "all", label: `All (${profiles.filter(p => p.membership_status !== "none").length})` },
                      { id: "active", label: `Active (${profiles.filter(p => p.membership_status === "active").length})` },
                      { id: "pending", label: `Pending (${profiles.filter(p => p.membership_status === "pending").length})` },
                      { id: "expired", label: `Expired (${profiles.filter(p => p.membership_status === "expired" || p.membership_status === "rejected").length})` },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setMemberStatusFilter(id as any)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border ${
                          memberStatusFilter === id
                            ? "bg-green-700/10 text-green-400 border-green-500/25"
                            : "bg-white/[0.02] text-gray-400 border-white/5 hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                      type="text"
                      placeholder="Search member..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs focus:border-green-500 outline-none text-white placeholder-gray-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setNewMemberName("");
                      setNewMemberEmail("");
                      setNewMemberCompany("");
                      setNewMemberPlan("individual");
                      setNewMemberPhone("");
                      setNewMemberAddress("");
                      setNewMemberCategory("Retail");
                      // Generate a temp password
                      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                      let pass = "TC-";
                      for (let i = 0; i < 8; i++) {
                        pass += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setNewMemberPassword(pass);
                      setCreatedCreds(null);
                      setShowMemberModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer animate-fade-in"
                  >
                    <UserPlus size={14} /> Add Member
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[#8A9690] font-bold uppercase tracking-wider">
                      <th className="pb-4.5 pl-2">Member details</th>
                      <th className="pb-4.5">Membership Plan</th>
                      <th className="pb-4.5">Status</th>
                      <th className="pb-4.5">Company / phone</th>
                      <th className="pb-4.5">Joined Date</th>
                      <th className="pb-4.5 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-semibold">
                    {profiles
                      .filter(p => p.membership_status !== "none")
                      .filter(p => {
                        if (memberStatusFilter === "all") return true;
                        if (memberStatusFilter === "active") return p.membership_status === "active";
                        if (memberStatusFilter === "pending") return p.membership_status === "pending";
                        if (memberStatusFilter === "expired") return p.membership_status === "expired" || p.membership_status === "rejected";
                        return true;
                      })
                      .filter(p => 
                        [p.full_name, p.email, p.company_name].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.01]">
                          <td className="py-4.5 pl-2">
                            <div className="text-white font-bold">{item.full_name || "N/A"}</div>
                            <div className="text-[11px] text-[#8A9690] font-normal mt-0.5">{item.email}</div>
                          </td>
                          <td className="py-4.5 capitalize">{item.membership_type || "None"}</td>
                          <td className="py-4.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              item.membership_status === "active"
                                ? "bg-green-500/10 text-green-400 border border-green-500/25"
                                : item.membership_status === "pending"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                                : "bg-white/5 text-gray-400 border border-white/10"
                            }`}>
                              {item.membership_status}
                            </span>
                          </td>
                          <td className="py-4.5">
                            <div className="text-[#ECEFEF]">{item.company_name || "-"}</div>
                            <div className="text-[10px] text-[#8A9690] font-normal mt-0.5">{item.phone || "-"}</div>
                          </td>
                          <td className="py-4.5 text-[#8A9690]">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}
                          </td>
                          <td className="py-4.5 text-right pr-2">
                            <button
                              onClick={() => handleEditMemberClick(item)}
                              className="px-2.5 py-1 rounded bg-[#1A382A] hover:bg-[#204936] text-[#ECEFEF] text-[10px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    {profiles.filter(p => p.membership_status !== "none").length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#8A9690]">
                          No members found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EVENT & PASSES */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="bg-[#0A1410] border border-white/5 rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-base font-heading font-black text-white">Chamber Events Calendar</h3>
                  
                  {/* Active vs Archived Subtabs */}
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => setEventView("active")}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border ${
                        eventView === "active"
                          ? "bg-green-700/10 text-green-400 border-green-500/25"
                          : "bg-white/[0.02] text-gray-400 border-white/5 hover:text-white"
                      }`}
                    >
                      Active ({events.filter(e => !e.is_archived).length})
                    </button>
                    <button
                      onClick={() => setEventView("archived")}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border ${
                        eventView === "archived"
                          ? "bg-green-700/10 text-green-400 border-green-500/25"
                          : "bg-white/[0.02] text-gray-400 border-white/5 hover:text-white"
                      }`}
                    >
                      Archived ({events.filter(e => e.is_archived).length})
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    resetEventForm();
                    setEditingEvent(null);
                    setShowEventModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-stretch sm:self-auto justify-center"
                >
                  <Plus size={14} /> Add Event
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events
                  .filter(evt => eventView === "active" ? !evt.is_archived : evt.is_archived)
                  .map((evt) => (
                  <div key={evt.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between min-h-[270px] h-auto">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          evt.tag.toLowerCase() === "summit"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                            : evt.tag.toLowerCase() === "expo"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/25"
                            : "bg-green-500/10 text-green-400 border border-green-500/25"
                        }`}>
                          {evt.tag}
                        </span>
                        <div className="text-[10px] font-bold text-green-400 text-right leading-tight">
                          <div>Member: {evt.price === 0 ? "Free" : `PHP ${evt.price}`}</div>
                          <div className="text-gray-400 text-[9px] mt-0.5">Guest: {evt.non_member_price === 0 ? "Free" : `PHP ${evt.non_member_price}`}</div>
                        </div>
                      </div>
                      <h4 className="font-heading font-bold text-white text-sm mt-3 leading-snug line-clamp-2">{evt.title}</h4>
                      <div className="text-[11px] text-[#8A9690] mt-2 space-y-1">
                        <div>Date: {evt.date}</div>
                        <div>Venue: {evt.venue}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-white/5 pt-3 mt-4">
                      <button
                        onClick={() => navigate(`/admin/events/${evt.id}/registrants`)}
                        className="flex-1 px-2 py-1.5 rounded-lg bg-[#11241C] hover:bg-[#152F24] text-[11px] font-semibold text-green-400 text-center transition-colors cursor-pointer"
                      >
                        Registrants
                      </button>
                      {!evt.is_archived && (
                        <button
                          onClick={() => handleShareEventClick(evt)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#152F24] hover:bg-green-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                          title="Share / Invite QR"
                        >
                          Invite
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleArchiveEvent(evt)}
                        className={`p-2 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 cursor-pointer transition-colors ${
                          evt.is_archived ? "text-amber-500 hover:text-amber-400" : "text-gray-400 hover:text-white"
                        }`}
                        title={evt.is_archived ? "Restore / Unarchive Event" : "Archive Event"}
                      >
                        <Archive size={13} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingEvent(evt);
                          setEventTitle(evt.title);
                          setEventDesc(evt.description);
                          setEventDate(evt.date);
                          setEventTime(evt.time);
                          setEventVenue(evt.venue);
                          setEventSpeaker(evt.speaker);
                          setEventPrice(evt.price);
                          setEventNonMemberPrice(evt.non_member_price || 0);
                          setEventTag(evt.tag);
                          setEventImg(evt.image_url || "");
                          setEventImgFile(null);
                          setEventFeatured(evt.is_featured);
                          setShowEventModal(true);
                        }}
                        className="p-2 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 text-gray-300 cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-2 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-red-950/20 hover:text-red-400 text-gray-500 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MEMBERSHIP FEES CMS */}
        {activeTab === "pricing" && (
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
        )}

        {/* TAB 6: QR PAYMENT SETTINGS CMS */}
        {activeTab === "qrs" && (
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
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs text-white focus:border-green-500 outline-none resize-none"
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
                          <span className="text-[10px] text-gray-300 font-bold block">
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
                      className="flex-1 py-2 bg-green-700 hover:bg-green-600 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                    >
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
        )}

        {/* TAB 7: NEWS & ANNOUNCEMENTS CMS */}
        {activeTab === "news" && (
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
                    setNewsImgFile(null);
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
                        <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">{item.category}</span>
                        <h4 className="font-heading font-bold text-white text-sm mt-1 leading-snug line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-[#8A9690] mt-1 line-clamp-1">{item.summary}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingNewsItem(item);
                          setNewsTitle(item.title);
                          setNewsSummary(item.summary);
                          setNewsContent(item.content);
                          setNewsCategory(item.category);
                          setNewsImg(item.image_url || "");
                          setNewsImgFile(null);
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
          </div>
        )}

        {/* TAB 8: BUSINESS DIRECTORY CMS */}
        {activeTab === "directory" && (
          <div className="bg-[#0A1410] border border-white/5 rounded-3xl p-6">
            <h3 className="text-base font-heading font-black text-white mb-6">Business Directory Submissions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[#8A9690] font-bold uppercase tracking-wider">
                    <th className="pb-4.5 pl-2">Business Name</th>
                    <th className="pb-4.5">Category</th>
                    <th className="pb-4.5">Location</th>
                    <th className="pb-4.5">Verification</th>
                    <th className="pb-4.5 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold">
                  {directory.map((biz) => (
                    <tr key={biz.id} className="hover:bg-white/[0.01]">
                      <td className="py-4.5 pl-2">
                        <div className="text-white font-bold">{biz.business_name}</div>
                        <div className="text-[11px] text-[#8A9690] font-normal mt-0.5">{biz.contact_email || "No Email"}</div>
                      </td>
                      <td className="py-4.5">{biz.category}</td>
                      <td className="py-4.5 text-gray-300">{biz.address}</td>
                      <td className="py-4.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleDirectoryVerify(biz)}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border cursor-pointer ${
                              biz.is_verified
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-gray-500/10 text-gray-400 border-white/10"
                            }`}
                          >
                            {biz.is_verified ? "Verified" : "Pending"}
                          </button>
                          <button
                            onClick={() => handleToggleDirectoryFeatured(biz)}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border cursor-pointer ${
                              biz.is_featured
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-gray-500/10 text-gray-500 border-white/10"
                            }`}
                          >
                            {biz.is_featured ? "Featured" : "Standard"}
                          </button>
                        </div>
                      </td>
                      <td className="py-4.5 text-right pr-2">
                        <button
                          onClick={() => handleDeleteDirectory(biz.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* EVENT EDIT MODAL (POPUP) */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0A1410] border border-white/10 rounded-3xl p-6 overflow-y-auto max-h-[90vh]"
            >
              <h3 className="font-heading font-black text-white text-lg mb-6">
                {editingEvent ? "Edit Event Parameters" : "Create New Event"}
              </h3>
              
              <form onSubmit={handleSaveEvent} className="space-y-4 text-xs font-semibold text-gray-300">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8A9690] mb-1">Event Title *</label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="e.g. Business Networking 2026"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Event Tag (Type) *</label>
                    <select
                      value={eventTag}
                      onChange={(e) => setEventTag(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none"
                    >
                      <option value="Event">Event</option>
                      <option value="Summit">Summit</option>
                      <option value="Forum">Forum</option>
                      <option value="Expo">Expo</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#8A9690] mb-1">Event Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    placeholder="Provide full description details of the seminar or event..."
                    className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[#8A9690] mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Time *</label>
                    <input
                      type="text"
                      required
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      placeholder="e.g. 8:00 AM - 5:00 PM"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Member Price (PHP) *</label>
                    <input
                      type="number"
                      required
                      value={eventPrice}
                      onChange={(e) => setEventPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Non-Member Price (PHP) *</label>
                    <input
                      type="number"
                      required
                      value={eventNonMemberPrice}
                      onChange={(e) => setEventNonMemberPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8A9690] mb-1">Venue *</label>
                    <input
                      type="text"
                      required
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                      placeholder="e.g. Talisay Sports Complex"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Key Speaker *</label>
                    <input
                      type="text"
                      required
                      value={eventSpeaker}
                      onChange={(e) => setEventSpeaker(e.target.value)}
                      placeholder="e.g. Mayor Gullas"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[#8A9690] text-xs font-bold uppercase mb-1">Event Banner Image</label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* File Upload zone */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-3 bg-[#101D17]/50 hover:bg-[#101D17] transition-all relative min-h-[96px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setEventImgFile(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="text-center pointer-events-none">
                        <Plus className="mx-auto text-gray-400 mb-1" size={20} />
                        <span className="text-xs text-gray-300 font-bold block">
                          {eventImgFile ? eventImgFile.name : "Upload Image File"}
                        </span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">PNG, JPG up to 5MB</span>
                      </div>
                      {eventImgFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEventImgFile(null);
                          }}
                          className="absolute top-1 right-1 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 z-20 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Fallback URL Input + Preview */}
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={eventImg}
                        onChange={(e) => setEventImg(e.target.value)}
                        placeholder="Or paste image URL instead..."
                        className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs text-white outline-none"
                      />
                      <div className="flex-1 min-h-[64px] border border-white/10 rounded-xl overflow-hidden bg-[#101D17]/50 flex items-center justify-center text-[10px] text-gray-500 relative">
                        {eventImgFile ? (
                          <img
                            src={URL.createObjectURL(eventImgFile)}
                            alt="Upload Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : eventImg ? (
                          <img
                            src={eventImg}
                            alt="URL Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>Preview Image</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured_evt"
                    checked={eventFeatured}
                    onChange={(e) => setEventFeatured(e.target.checked)}
                    className="rounded border-white/10 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer bg-[#101D17]"
                  />
                  <label htmlFor="featured_evt" className="cursor-pointer text-[#ECEFEF]">Feature this event on public pages</label>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold cursor-pointer transition-colors"
                  >
                    {actionLoading ? "Saving..." : "Save Event Details"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
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

      {/* EVENT SHARE / INVITE MODAL */}
      <AnimatePresence>
        {showShareModal && shareEvent && (() => {
          const registrationUrl = `${window.location.origin}/events?register=${shareEvent.id}`;
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(registrationUrl)}`;
          return (
            <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm bg-[#0A1410] border border-white/10 rounded-3xl p-6 text-center shadow-2xl relative"
              >
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setShareEvent(null);
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-4 border border-green-500/20 shadow-lg shadow-green-950/20">
                  <QrCode size={22} />
                </div>

                <h3 className="font-heading font-black text-white text-base mb-1">
                  Share Event Invitation
                </h3>
                <p className="text-xs font-semibold text-green-400 mb-6 line-clamp-1">
                  {shareEvent.title}
                </p>

                {/* QR Code Container */}
                <div className="p-4 bg-white rounded-2xl inline-block mb-6 border border-gray-100 shadow-md">
                  <img
                    src={qrCodeUrl}
                    alt="Event Registration QR"
                    className="w-48 h-48 object-contain"
                  />
                </div>

                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4 leading-normal px-2">
                  Share the link or let guests scan this QR code to register directly for the event
                </p>

                {/* Action buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(registrationUrl);
                      toast.success("Registration link copied to clipboard!");
                    }}
                    className="w-full py-2 bg-[#10241A] hover:bg-[#163526] text-green-400 border border-green-500/10 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md"
                  >
                    Copy Registration Link
                  </button>
                  <button
                    onClick={() => handleDownloadShareQR(shareEvent, registrationUrl)}
                    className="w-full py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md"
                  >
                    Download QR Code PNG
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* NEWS EDIT MODAL (POPUP) */}
      <AnimatePresence>
        {showNewsModal && (
          <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0A1410] border border-white/10 rounded-3xl p-6 overflow-y-auto max-h-[90vh]"
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
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Category *</label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none"
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
                    className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none"
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
                    className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none resize-none font-sans"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[#8A9690] text-xs font-bold uppercase mb-1">Cover Image</label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* File Upload zone */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-3 bg-[#101D17]/50 hover:bg-[#101D17] transition-all relative min-h-[96px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewsImgFile(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="text-center pointer-events-none">
                        <Plus className="mx-auto text-gray-400 mb-1" size={18} />
                        <span className="text-xs text-gray-300 font-bold block">
                          {newsImgFile ? newsImgFile.name : "Upload Cover Photo"}
                        </span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">PNG, JPG up to 5MB</span>
                      </div>
                      {newsImgFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setNewsImgFile(null);
                          }}
                          className="absolute top-1 right-1 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 z-20 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Fallback URL Input + Preview */}
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={newsImg}
                        onChange={(e) => setNewsImg(e.target.value)}
                        placeholder="Or paste image URL instead..."
                        className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-xs text-white outline-none"
                      />
                      <div className="flex-1 min-h-[64px] border border-white/10 rounded-xl overflow-hidden bg-[#101D17]/50 flex items-center justify-center text-[10px] text-gray-500 relative">
                        {newsImgFile ? (
                          <img
                            src={URL.createObjectURL(newsImgFile)}
                            alt="Upload Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : newsImg ? (
                          <img
                            src={newsImg}
                            alt="URL Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>Preview Image</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold cursor-pointer transition-colors"
                  >
                    {actionLoading ? "Publishing..." : "Publish Article"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewsModal(false);
                      setEditingNewsItem(null);
                      setNewsImgFile(null);
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

      {/* ADD MEMBER MODAL (POPUP) */}
      <AnimatePresence>
        {showMemberModal && (
          <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0A1410] border border-white/10 rounded-3xl p-6 overflow-y-auto max-h-[90vh]"
            >
              <h3 className="font-heading font-black text-white text-lg mb-6 flex items-center gap-2">
                <UserPlus className="text-green-400" size={20} />
                Create Member Account
              </h3>

              <form onSubmit={handleCreateMember} className="space-y-4 text-xs font-semibold text-gray-300">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8A9690] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="e.g. Maria Clara"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="e.g. maria@clara.com"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8A9690] mb-1">Company / Business Name</label>
                    <input
                      type="text"
                      value={newMemberCompany}
                      onChange={(e) => setNewMemberCompany(e.target.value)}
                      placeholder="e.g. Clara Boutique"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Membership Plan *</label>
                    <select
                      value={newMemberPlan}
                      onChange={(e) => setNewMemberPlan(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors"
                    >
                      <option value="individual">Individual Plan</option>
                      <option value="sme">SME Plan</option>
                      <option value="corporate">Corporate Plan</option>
                      <option value="enterprise">Enterprise Plan</option>
                      <option value="associate">Associate Plan</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#8A9690] mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      placeholder="e.g. +639171234567"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Business Category</label>
                    <input
                      type="text"
                      value={newMemberCategory}
                      onChange={(e) => setNewMemberCategory(e.target.value)}
                      placeholder="e.g. Retail / Tech"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Business Location</label>
                    <input
                      type="text"
                      value={newMemberAddress}
                      onChange={(e) => setNewMemberAddress(e.target.value)}
                      placeholder="e.g. Talisay City"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#8A9690] mb-1">Temporary Password *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newMemberPassword}
                      onChange={(e) => setNewMemberPassword(e.target.value)}
                      placeholder="Create temporary password"
                      className="flex-1 px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAutoGeneratePassword}
                      className="px-3.5 py-2 bg-[#152F24] hover:bg-green-700 text-green-400 hover:text-white rounded-xl font-bold cursor-pointer transition-colors border border-green-500/10 text-center"
                    >
                      Auto-Generate
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 font-normal">
                    This account will be created under Auth. The user can sign in using this temporary password and change it.
                  </p>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Creating...
                      </>
                    ) : (
                      "Create Member & Account"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMemberModal(false);
                    }}
                    className="px-4 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-gray-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MEMBER CREDENTIALS SUCCESS DISPLAY MODAL */}
      <AnimatePresence>
        {showCredsModal && createdCreds && (
          <div className="fixed inset-0 z-[130] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0D1E16] border-2 border-green-500/35 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/25 text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={22} />
                </div>
                <h4 className="font-heading font-black text-white text-base">Account Generated Successfully!</h4>
                <p className="text-[11px] text-gray-400 mt-1">Copy the credentials below to send to the newly added member.</p>
              </div>

              <div className="bg-[#070D0B] border border-white/5 rounded-2xl p-4.5 space-y-3.5 text-xs font-semibold">
                <div>
                  <span className="text-[#8A9690] block text-[10px] uppercase font-bold tracking-wider">Member Name</span>
                  <span className="text-white mt-0.5 block">{createdCreds.name}</span>
                </div>
                <div>
                  <span className="text-[#8A9690] block text-[10px] uppercase font-bold tracking-wider">Sign In Email</span>
                  <span className="text-white mt-0.5 block font-mono">{createdCreds.email}</span>
                </div>
                <div>
                  <span className="text-[#8A9690] block text-[10px] uppercase font-bold tracking-wider">Temporary Password</span>
                  <span className="text-green-400 mt-0.5 block font-mono text-sm tracking-wider">{createdCreds.pass}</span>
                </div>
              </div>

              <div className="flex gap-2.5 mt-6 pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    const text = `Chamber Account Details:\nEmail: ${createdCreds.email}\nTemporary Password: ${createdCreds.pass}\nLogin here: ${window.location.origin}/login`;
                    navigator.clipboard.writeText(text);
                    toast.success("Credentials copied to clipboard!");
                  }}
                  className="flex-1 py-2 bg-[#1A382A] hover:bg-[#204936] text-green-400 border border-green-500/10 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Copy size={13} /> Copy Details
                </button>
                <button
                  onClick={() => setShowCredsModal(false)}
                  className="px-5 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MEMBER DETAILS MODAL */}
      <AnimatePresence>
        {showEditMemberModal && editingMember && (
          <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0A1410] border border-white/10 rounded-3xl p-6 overflow-y-auto max-h-[90vh]"
            >
              <h3 className="font-heading font-black text-white text-lg mb-6 flex items-center gap-2">
                <Edit2 className="text-green-400" size={18} />
                Edit Member Details
              </h3>

              <form onSubmit={handleUpdateMember} className="space-y-4 text-xs font-semibold text-gray-300">
                <div>
                  <label className="block text-[#8A9690] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Maria Clara"
                    className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8A9690] mb-1">Company / Business Name</label>
                    <input
                      type="text"
                      value={newMemberCompany}
                      onChange={(e) => setNewMemberCompany(e.target.value)}
                      placeholder="e.g. Clara Boutique"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      placeholder="e.g. +639171234567"
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8A9690] mb-1">Membership Plan</label>
                    <select
                      value={newMemberCategory} // newMemberCategory acts as plan variable here
                      onChange={(e) => setNewMemberCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors"
                    >
                      <option value="individual">Individual Plan</option>
                      <option value="sme">SME Plan</option>
                      <option value="corporate">Corporate Plan</option>
                      <option value="enterprise">Enterprise Plan</option>
                      <option value="associate">Associate Plan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#8A9690] mb-1">Membership Status</label>
                    <select
                      value={newMemberPlan} // newMemberPlan acts as status variable here
                      onChange={(e) => setNewMemberPlan(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="expired">Expired</option>
                      <option value="rejected">Rejected</option>
                      <option value="none">None (Remove Membership)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Saving...
                      </>
                    ) : (
                      "Save Details"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditMemberModal(false);
                      setEditingMember(null);
                    }}
                    className="px-4 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-gray-400 cursor-pointer"
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

export default Admin;
