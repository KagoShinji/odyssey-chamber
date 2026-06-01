import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Profile } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { supabase } from "../lib/supabase";

import { 
  User, Building2, CheckCircle2, Shield, CalendarDays, 
  MapPin, Loader2, ArrowRight, QrCode, Phone, Map, 
  Globe, Mail, CreditCard, LogOut, Download
} from "lucide-react";

interface PricingPlan {
  id: string;
  type: string;
  name: string;
  price: number;
  period: string;
  description: string;
  benefits: string[];
}

interface PaymentQR {
  id: string;
  name: string;
  description: string;
  payment_instructions: string;
  qr_code_url: string;
}

interface RegisteredEvent {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  payment_status: string;
  attendance_status: string;
  qr_code: string;
  events: {
    title: string;
    date: string;
    time: string;
    venue: string;
  };
}

const Dashboard: React.FC = () => {
  const { user, profile, loading, logout, refetchProfile, isAdmin } = useAuth();
  const { toast } = useNotification();
  const navigate = useNavigate();

  // Application workflow states
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentQR[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentQR | null>(null);
  
  // Form input states
  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [businessCategory, setBusinessCategory] = useState(profile?.business_category || "");
  const [businessAddress, setBusinessAddress] = useState(profile?.business_address || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [paymentMethodName, setPaymentMethodName] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  
  // Directory listing states
  const [hasListing, setHasListing] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const [dirName, setDirName] = useState("");
  const [dirDesc, setDirDesc] = useState("");
  const [dirEmail, setDirEmail] = useState("");
  const [dirPhone, setDirPhone] = useState("");
  const [dirWeb, setDirWeb] = useState("");
  const [dirCat, setDirCat] = useState("");
  const [dirAddress, setDirAddress] = useState("");
  
  // Loader and query states
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"card" | "events" | "directory">("card");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (isAdmin) {
        navigate("/admin");
      }
    }
  }, [user, isAdmin, loading, navigate]);

  // Load plans, payments, registered events, and directory listings
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // 1. Fetch CMS plans
      const { data: plansData } = await supabase
        .from("membership_pricing")
        .select("*")
        .eq("is_active", true);
      if (plansData) setPlans(plansData);

      // 2. Fetch active QR payment details
      const { data: qrData } = await supabase
        .from("qr_settings")
        .select("*")
        .eq("is_active", true);
      if (qrData) {
        setPaymentMethods(qrData);
        if (qrData.length > 0) {
          setSelectedPayment(qrData[0]);
          setPaymentMethodName(qrData[0].name.toLowerCase().includes("gcash") ? "gcash" : "bank_transfer");
        }
      }

      // 3. Fetch user registered events
      const { data: eventsData } = await supabase
        .from("event_registrations")
        .select(`
          id,
          event_id,
          full_name,
          email,
          payment_status,
          attendance_status,
          qr_code,
          events (
            title,
            date,
            time,
            venue
          )
        `)
        .eq("user_id", user.id);
      if (eventsData) setRegisteredEvents(eventsData as any);

      // 4. Check if directory listing already exists
      const { data: dirData } = await supabase
        .from("business_directory")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (dirData) {
        setHasListing(true);
        setListingId(dirData.id);
        setDirName(dirData.business_name);
        setDirDesc(dirData.description);
        setDirEmail(dirData.contact_email || "");
        setDirPhone(dirData.contact_phone || "");
        setDirWeb(dirData.website_url || "");
        setDirCat(dirData.category);
        setDirAddress(dirData.address);
      } else {
        // Prefill directory fields with profile data if available
        setDirName(profile?.company_name || "");
        setDirPhone(profile?.phone || "");
        setDirEmail(profile?.email || "");
        setDirCat(profile?.business_category || "");
        setDirAddress(profile?.business_address || "");
      }
    };

    loadData();
  }, [user, profile]);

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setFormError(null);
  };

  const handleSelectPayment = (pay: PaymentQR) => {
    setSelectedPayment(pay);
    setPaymentMethodName(pay.name.toLowerCase().includes("gcash") ? "gcash" : "bank_transfer");
  };

  // Submit Membership Application
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;
    if (!selectedPlan) {
      setFormError("Please select a membership plan.");
      return;
    }
    if (!paymentReference) {
      setFormError("Please fill in your payment reference number.");
      return;
    }

    setActionLoading(true);
    setFormError(null);

    try {
      // 1. Create membership application
      const { error: appError } = await supabase
        .from("membership_applications")
        .insert({
          user_id: user.id,
          membership_type: selectedPlan.type,
          company_name: companyName,
          business_category: businessCategory,
          phone: phone,
          business_address: businessAddress,
          payment_method: paymentMethodName,
          payment_reference: paymentReference,
          status: "pending",
          payment_status: "pending",
        });

      if (appError) throw appError;

      // 2. Update profile state to pending
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          membership_status: "pending",
          membership_type: selectedPlan.type,
          company_name: companyName,
          business_category: businessCategory,
          phone: phone,
          business_address: businessAddress,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      await refetchProfile();
      setSelectedPlan(null);
    } catch (err: any) {
      setFormError(err.message || "Failed to submit application.");
    } finally {
      setActionLoading(false);
    }
  };

  // Create or Update Business Directory Listing
  const handleSaveDirectoryListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!dirName || !dirDesc || !dirCat || !dirAddress) {
      setFormError("Please fill in all required fields marked with *.");
      return;
    }

    setActionLoading(true);
    setFormError(null);

    try {
      const listingData = {
        user_id: user.id,
        business_name: dirName,
        description: dirDesc,
        contact_email: dirEmail,
        contact_phone: dirPhone,
        website_url: dirWeb,
        category: dirCat,
        address: dirAddress,
      };

      if (hasListing && listingId) {
        const { error } = await supabase
          .from("business_directory")
          .update(listingData)
          .eq("id", listingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("business_directory")
          .insert(listingData)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setHasListing(true);
          setListingId(data.id);
        }
      }
      toast.success("Business Directory Listing saved successfully!");
    } catch (err: any) {
      setFormError(err.message || "Failed to save directory listing.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPass = async (qrCodeText: string, eventTitle: string) => {
    try {
      const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeText)}&size=300x300`);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.download = `chamber_pass_${safeTitle}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Check-in pass downloaded successfully! You can present this QR image at the venue check-in.");
    } catch (err: any) {
      toast.error("Failed to download pass image: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf6]">
        <Loader2 size={36} className="animate-spin text-green-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf6] pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header Profile Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-gray-100">
        <div className="flex items-center gap-4.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-700 to-emerald-600 flex items-center justify-center text-white text-xl font-heading font-black">
            {profile?.full_name?.substring(0, 2).toUpperCase() || "MB"}
          </div>
          <div>
            <h1 className="text-2xl font-heading font-black text-gray-900 leading-tight">
              {profile?.full_name || "Talisay Chamber Member"}
            </h1>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
              <Mail size={13} /> {profile?.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {profile?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="btn-premium bg-emerald-800 hover:bg-emerald-700 text-white text-xs !py-2.5 !px-4 shadow-diffuse cursor-pointer"
            >
              Admin Portal <ArrowRight size={13} />
            </button>
          )}
          <button
            onClick={() => logout()}
            className="px-4 py-2.5 rounded-full border border-gray-200 hover:bg-red-50 hover:text-red-700 text-gray-600 text-xs font-semibold flex items-center gap-1.5 spring-fast cursor-pointer"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      {/* RENDER MEMBERSHIP APPLICATION WORKFLOW (IF STATUS IS NONE) */}
      {profile?.membership_status === "none" && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step 1: Select Plan */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
              <span className="label-pill mb-3 inline-flex">Step 1</span>
              <h2 className="text-xl font-heading font-black text-[#0D1A14] mb-2">Select a Membership Plan</h2>
              <p className="text-sm text-gray-500 mb-8">
                Choose the plan that suits your business profile. Tiers are defined below.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col ${
                      selectedPlan?.id === plan.id
                        ? "border-green-700 bg-green-50/20"
                        : "border-gray-100 hover:border-green-200 bg-white"
                    }`}
                  >
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-400 mb-1">
                      {plan.name}
                    </span>
                    <span className="text-xl font-heading font-black text-gray-900 mb-2">
                      PHP {plan.price.toLocaleString()}
                    </span>
                    <p className="text-[11px] text-gray-400 line-clamp-3 mb-4 leading-normal flex-1">{plan.description}</p>
                    <div className="text-[11px] font-semibold text-green-700 flex items-center gap-1 mt-auto">
                      Select Tier <ArrowRight size={10} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Payment Details (shows only if plan is selected) */}
            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]"
              >
                <span className="label-pill mb-3 inline-flex">Step 2</span>
                <h2 className="text-xl font-heading font-black text-[#0D1A14] mb-2">Payment Details</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Send your membership fee of <span className="font-bold text-green-700">PHP {selectedPlan.price.toLocaleString()}</span> via GCash or Bank Transfer using the credentials below.
                </p>

                {/* QR Method Toggle */}
                <div className="flex gap-2.5 mb-6">
                  {paymentMethods.map((pay) => (
                    <button
                      key={pay.id}
                      onClick={() => handleSelectPayment(pay)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                        selectedPayment?.id === pay.id
                          ? "bg-[#0D1A14] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {pay.name}
                    </button>
                  ))}
                </div>

                {selectedPayment && (
                  <div className="grid md:grid-cols-2 gap-6 p-6 rounded-2xl bg-gray-50/70 border border-gray-100">
                    <div className="flex flex-col justify-center">
                      <h4 className="font-heading font-bold text-gray-900 mb-2">{selectedPayment.name}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">{selectedPayment.description}</p>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 text-xs text-gray-700 font-mono whitespace-pre-line leading-relaxed">
                        {selectedPayment.payment_instructions}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200">
                      <img
                        src={selectedPayment.qr_code_url}
                        alt="Payment QR Code"
                        className="w-40 h-40 object-contain mb-2"
                      />
                      <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        <QrCode size={12} /> Scan with GCash/Bank App
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Form details input */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] sticky top-32">
              <h3 className="text-lg font-heading font-black text-gray-900 mb-6">Application Form</h3>

              {formError && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Company / Business Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type="text"
                      placeholder="e.g. Talisay Agri-Farm"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Business Category</label>
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-green-500 outline-none transition-all"
                  >
                    <option value="">Select Category</option>
                    <option value="Retail">Retail</option>
                    <option value="Construction">Construction</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="IT & Tech">IT & Tech</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Agriculture">Agriculture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type="tel"
                      placeholder="0917XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Business Address</label>
                  <div className="relative">
                    <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type="text"
                      placeholder="Street, Barangay, Talisay City"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Payment Reference Number *</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type="text"
                      placeholder="GCash Ref / Bank Transaction ID"
                      required
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading || !selectedPlan}
                  className="w-full btn-premium bg-green-700 hover:bg-green-600 text-white justify-center shadow-diffuse mt-4 disabled:opacity-50 disabled:cursor-not-allowed text-xs !py-3"
                >
                  {actionLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Submitting...
                    </span>
                  ) : (
                    <>
                      Submit Application
                      <span className="btn-icon-wrap !bg-white/15"><ArrowRight size={12} /></span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RENDER PENDING STATUS REVIEW SCREEN */}
      {profile?.membership_status === "pending" && (
        <div className="max-w-2xl mx-auto bezel-outer shadow-diffuse bg-white rounded-3xl">
          <div className="bezel-inner p-8 md:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mb-6">
              <Loader2 size={32} className="animate-spin" />
            </div>
            <h2 className="text-2xl font-heading font-black text-gray-900 mb-3">Application Under Review</h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md mb-8">
              We received your application for the <span className="font-semibold text-green-700 capitalize">{profile.membership_type}</span> membership. Our administrative officers are validating your payment reference. This usually takes between 12 to 24 hours.
            </p>
            <div className="w-full p-4.5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row justify-between gap-4 text-xs font-heading font-semibold text-left">
              <div>
                <div className="text-gray-400">Membership Tier</div>
                <div className="text-gray-900 mt-1 capitalize">{profile.membership_type} Member</div>
              </div>
              <div>
                <div className="text-gray-400">Reference Account</div>
                <div className="text-gray-900 mt-1">{profile.company_name || "N/A"}</div>
              </div>
              <div>
                <div className="text-gray-400">Status</div>
                <div className="text-green-700 mt-1 uppercase flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Reviewing
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER REJECTED STATUS SCREEN */}
      {profile?.membership_status === "rejected" && (
        <div className="max-w-2xl mx-auto bezel-outer shadow-diffuse bg-white rounded-3xl">
          <div className="bezel-inner p-8 md:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-600 rounded-full flex items-center justify-center mb-6">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-heading font-black text-gray-900 mb-3">Application Rejected</h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md mb-6">
              Unfortunately, your payment reference details could not be verified by our administrative office. Please verify your receipt reference and resubmit.
            </p>
            <button
              onClick={async () => {
                await supabase.from("profiles").update({ membership_status: "none" }).eq("id", user?.id || "");
                refetchProfile();
              }}
              className="btn-premium bg-red-600 hover:bg-red-700 text-white !py-2.5 shadow-diffuse flex items-center gap-1.5"
            >
              Reapply / Modify Form
            </button>
          </div>
        </div>
      )}

      {/* RENDER FULL MEMBER CONTROLS (IF STATUS IS ACTIVE) */}
      {profile?.membership_status === "active" && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Sidebar tabs */}
          <div className="bg-white rounded-2xl p-4.5 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-1">
            <button
              onClick={() => setActiveTab("card")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                activeTab === "card"
                  ? "bg-green-700 text-white shadow-diffuse"
                  : "text-gray-600 hover:bg-gray-50 hover:text-green-700"
              }`}
            >
              <CreditCard size={16} /> Digital Member Card
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                activeTab === "events"
                  ? "bg-green-700 text-white shadow-diffuse"
                  : "text-gray-600 hover:bg-gray-50 hover:text-green-700"
              }`}
            >
              <CalendarDays size={16} /> Registered Events ({registeredEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                activeTab === "directory"
                  ? "bg-green-700 text-white shadow-diffuse"
                  : "text-gray-600 hover:bg-gray-50 hover:text-green-700"
              }`}
            >
              <Building2 size={16} /> Business Directory Profile
            </button>
          </div>

          {/* Main workspace */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Tab 1: Digital Card */}
              {activeTab === "card" && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-8 items-center"
                >
                  {/* Card Container */}
                  <div className="relative w-80 sm:w-[350px] h-52 rounded-[1.5rem] bg-gradient-to-br from-[#0D1A14] via-[#166534] to-[#0D1A14] text-white p-6 shadow-2xl overflow-hidden border border-green-600/35 flex flex-col justify-between select-none">
                    {/* Metallic glow accents */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center p-0.5 border border-white/10">
                          <img src="/talisaychamberlogo.jpg" alt="Logo" className="object-contain w-full h-full" />
                        </div>
                        <span className="font-heading font-black text-xs tracking-wider">TALISAY CHAMBER</span>
                      </div>
                      <span className="text-[9px] font-heading font-bold tracking-widest text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/25 uppercase">
                        {profile.membership_type}
                      </span>
                    </div>

                    <div className="my-auto pt-2">
                      <div className="text-lg font-heading font-bold leading-tight">{profile.full_name}</div>
                      <div className="text-[10px] text-green-200 mt-1">{profile.company_name || "Independent Member"}</div>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/10 pt-3 text-[9px] font-mono text-gray-400">
                      <div>
                        <div>MEMBER ID</div>
                        <div className="text-white font-semibold mt-0.5">{profile.id.substring(0, 8).toUpperCase()}</div>
                      </div>
                      <div className="text-right">
                        <div>EXPIRES END</div>
                        <div className="text-white font-semibold mt-0.5">
                          {new Date(new Date(profile.created_at).setFullYear(new Date(profile.created_at).getFullYear() + 1)).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Scan Info */}
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <span className="label-pill !bg-green-50 !text-green-700 !border-green-100 inline-flex">Verified Member</span>
                    <h3 className="text-xl font-heading font-black text-gray-900 leading-tight">Digital Membership QR Code</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Use this QR code during entry verification at Chamber trade fairs, network expos, conferences, and seminars.
                    </p>
                    <div className="inline-flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent("MEMB-" + profile.id)}&size=120x120`}
                        alt="Member QR Code"
                        className="w-20 h-20 object-contain bg-white p-1 rounded-lg border border-gray-200 shadow-sm"
                      />
                      <div className="text-left">
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Verification ID</div>
                        <div className="text-xs font-mono text-gray-700 mt-0.5">MEMB-{profile.id.substring(0, 8).toUpperCase()}</div>
                        <div className="text-[10px] text-green-600 font-semibold mt-1 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Active & Approved
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Registered Events */}
              {activeTab === "events" && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]"
                >
                  <h2 className="text-xl font-heading font-black text-[#0D1A14] mb-2">Registered Events</h2>
                  <p className="text-sm text-gray-500 mb-8">
                    Your reservations and passes for upcoming Chamber activities.
                  </p>

                  <div className="space-y-4">
                    {registeredEvents.map((reg) => (
                      <div
                        key={reg.id}
                        className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-6"
                      >
                        <div className="flex-1">
                          {reg.payment_status === "paid" || reg.payment_status === "free" ? (
                            <span className="text-[10px] font-bold text-green-700 uppercase bg-green-50 border border-green-150 px-2 py-0.5 rounded-full mb-2 inline-block">
                              Pass Verified & Active
                            </span>
                          ) : reg.payment_status === "rejected" ? (
                            <span className="text-[10px] font-bold text-red-700 uppercase bg-red-50 border border-red-150 px-2 py-0.5 rounded-full mb-2 inline-block animate-pulse">
                              Payment Rejected
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 border border-amber-150 px-2 py-0.5 rounded-full mb-2 inline-block">
                              Pending Verification
                            </span>
                          )}
                          <h4 className="font-heading font-bold text-gray-900 text-base leading-snug">{reg.events?.title}</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-400 mt-3">
                            <span className="flex items-center gap-1.5"><CalendarDays size={13} className="text-green-600" />{reg.events?.date}</span>
                            <span className="flex items-center gap-1.5"><MapPin size={13} className="text-green-600" />{reg.events?.venue}</span>
                          </div>

                          {reg.payment_status === "rejected" && (
                            <p className="text-[11px] text-red-600 font-semibold mt-4 leading-normal bg-red-50/50 p-2.5 rounded-xl border border-red-100/50">
                              Your payment reference number was flagged as invalid or unverified. Please contact the Chamber office to clear your balance.
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-200">
                          <div className="relative">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(reg.qr_code)}&size=100x100`}
                              alt="Check-in QR"
                              className={`w-16 h-16 object-contain transition-all duration-300 ${
                                reg.payment_status === "paid" || reg.payment_status === "free" ? "" : "blur-[3px] opacity-25 select-none pointer-events-none"
                              }`}
                            />
                            {(reg.payment_status !== "paid" && reg.payment_status !== "free") && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/20">
                                <Shield className="text-gray-400 w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="text-left">
                            <div className="text-[9px] font-bold text-gray-400 uppercase">Check-in Pass</div>
                            <div className="text-[11px] font-mono text-gray-700 mt-0.5">{reg.qr_code}</div>
                            <div className="text-[9px] font-bold mt-1 text-gray-500 capitalize">
                              Attendance: {reg.attendance_status}
                            </div>
                            <div className={`text-[9px] font-bold mt-0.5 capitalize ${
                              reg.payment_status === "paid" || reg.payment_status === "free"
                                ? "text-green-700"
                                : reg.payment_status === "rejected"
                                ? "text-red-600"
                                : "text-amber-600"
                            }`}>
                              Payment: {reg.payment_status}
                            </div>
                            {(reg.payment_status === "paid" || reg.payment_status === "free") && (
                              <button
                                onClick={() => handleDownloadPass(reg.qr_code, reg.events?.title || "event")}
                                className="mt-2 text-[9px] font-bold text-green-700 hover:text-green-600 flex items-center gap-1 cursor-pointer hover:underline transition-all"
                              >
                                <Download size={10} /> Save Pass
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {registeredEvents.length === 0 && (
                      <div className="text-center py-10">
                        <CalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h4 className="font-heading font-semibold text-gray-900">No events registered yet</h4>
                        <p className="text-sm text-gray-500 mt-1 mb-5">Explore our upcoming events and register.</p>
                        <button
                          onClick={() => navigate("/events")}
                          className="btn-premium bg-[#0D1A14] text-white text-xs !py-2 shadow-navy-diffuse"
                        >
                          View Events Calendar
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Business Directory Listing */}
              {activeTab === "directory" && (
                <motion.div
                  key="directory"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]"
                >
                  <h2 className="text-xl font-heading font-black text-[#0D1A14] mb-2">
                    {hasListing ? "Manage Directory Profile" : "Register Business in Directory"}
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    As an active member, you can list your business on the public Talisay Chamber Business Directory.
                  </p>

                  {formError && (
                    <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleSaveDirectoryListing} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Business Name *</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Santos Trading Co."
                            value={dirName}
                            onChange={(e) => setDirName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-green-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Category *</label>
                        <select
                          required
                          value={dirCat}
                          onChange={(e) => setDirCat(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-green-500 outline-none transition-all"
                        >
                          <option value="">Select Category</option>
                          <option value="Retail">Retail</option>
                          <option value="Construction">Construction</option>
                          <option value="Food & Beverage">Food & Beverage</option>
                          <option value="Professional Services">Professional Services</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="IT & Tech">IT & Tech</option>
                          <option value="Logistics">Logistics</option>
                          <option value="Agriculture">Agriculture</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Business Description *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us what your business does..."
                        value={dirDesc}
                        onChange={(e) => setDirDesc(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-green-500 outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Contact Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                          <input
                            type="email"
                            placeholder="sales@company.com"
                            value={dirEmail}
                            onChange={(e) => setDirEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-green-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Contact Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                          <input
                            type="text"
                            placeholder="(032) 234-5678"
                            value={dirPhone}
                            onChange={(e) => setDirPhone(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-green-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Website URL</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                          <input
                            type="text"
                            placeholder="www.company.com"
                            value={dirWeb}
                            onChange={(e) => setDirWeb(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-green-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1">Physical Address *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                          type="text"
                          required
                          placeholder="Barangay, City/Province"
                          value={dirAddress}
                          onChange={(e) => setDirAddress(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-green-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="btn-premium bg-green-700 hover:bg-green-600 text-white shadow-diffuse text-xs"
                    >
                      {actionLoading ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 size={13} className="animate-spin" /> Saving...
                        </span>
                      ) : (
                        "Save Directory Profile"
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
