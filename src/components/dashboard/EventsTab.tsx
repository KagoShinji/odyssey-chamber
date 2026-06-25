import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Shield, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { RegisteredEvent } from "./types";

interface EventsTabProps {
  registeredEvents: RegisteredEvent[];
  onDownloadPass: (qrCode: string, eventTitle: string) => void;
}

const EventsTab: React.FC<EventsTabProps> = ({ registeredEvents, onDownloadPass }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      key="events"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]"
    >
      <h2 className="text-xl font-heading font-black text-[#0D1A14] mb-2">Registered Events</h2>
      <p className="text-sm text-gray-500 mb-8">Your reservations and passes for upcoming Chamber activities.</p>

      <div className="space-y-4">
        {registeredEvents.map((reg) => (
          <div
            key={reg.id}
            className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-6"
          >
            <div className="flex-1">
              {reg.payment_status === "paid" || reg.payment_status === "free" ? (
                <span className="text-[10px] font-bold text-green-700 uppercase bg-green-50 border border-green-150 px-2 py-0.5 rounded-full mb-2 inline-block">
                  Pass Verified &amp; Active
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
                    reg.payment_status === "paid" || reg.payment_status === "free"
                      ? ""
                      : "blur-[3px] opacity-25 select-none pointer-events-none"
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
                    onClick={() => onDownloadPass(reg.qr_code, reg.events?.title || "event")}
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
  );
};

export default EventsTab;
