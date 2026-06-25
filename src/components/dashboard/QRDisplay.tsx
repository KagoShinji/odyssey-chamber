import React, { useRef } from "react";

interface QRDisplayProps {
  /** The PaymentQR object to display */
  qr: {
    name: string;
    qr_code_url: string;
    payment_instructions: string;
    description?: string;
  };
  /** Unique ID for the dialog element — must be unique per page */
  lightboxId: string;
}

/**
 * Large scannable QR panel with hover-to-enlarge hint, download button,
 * and a native <dialog> lightbox. Reused by ApplicationTab, RenewalModal,
 * and event registration forms.
 */
const QRDisplay: React.FC<QRDisplayProps> = ({ qr, lightboxId }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleDownload = async () => {
    try {
      const response = await fetch(qr.qr_code_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${qr.name.replace(/\s+/g, "_")}_QR_Code.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(qr.qr_code_url, "_blank");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Clickable thumbnail → opens lightbox */}
      <div
        className="relative group cursor-pointer"
        onClick={() => dialogRef.current?.showModal()}
      >
        <img
          src={qr.qr_code_url}
          alt={`${qr.name} QR Code`}
          className="w-52 h-52 object-contain bg-white p-3 rounded-2xl border-2 border-gray-200 shadow-md transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 rounded-2xl transition-all">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
            Tap to enlarge
          </span>
        </div>
      </div>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        className="text-[10px] text-green-600 hover:text-green-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download QR Code
      </button>

      {/* Lightbox dialog */}
      <dialog
        ref={dialogRef}
        id={lightboxId}
        className="backdrop:bg-black/70 backdrop:backdrop-blur-sm bg-transparent border-none outline-none p-0 max-w-sm w-full rounded-3xl"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4">
          <h3 className="font-heading font-bold text-gray-900">{qr.name} — QR Code</h3>
          <img
            src={qr.qr_code_url}
            alt={`${qr.name} QR Code Large`}
            className="w-72 h-72 object-contain rounded-2xl border border-gray-100"
          />
          <p className="text-xs text-gray-500 text-center">{qr.payment_instructions}</p>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download QR Code
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default QRDisplay;
