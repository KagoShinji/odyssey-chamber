import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

interface PasswordTabProps {
  oldPassword: string; setOldPassword: (v: string) => void;
  newPassword: string; setNewPassword: (v: string) => void;
  confirmPassword: string; setConfirmPassword: (v: string) => void;
  isChangingPassword: boolean;
  onSubmit: (e: React.FormEvent) => void;
  // Computed strength props
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  passwordsMatch: boolean;
  strengthScore: number;
  getStrengthLabel: () => string;
  getStrengthColor: () => string;
}

const PasswordTab: React.FC<PasswordTabProps> = ({
  oldPassword, setOldPassword,
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  isChangingPassword, onSubmit,
  hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial,
  passwordsMatch, strengthScore, getStrengthLabel, getStrengthColor,
}) => {
  const inputCls = "w-full px-3.5 py-2.5 bg-gray-55 border border-gray-200 rounded-xl text-gray-900 outline-none focus:bg-white focus:border-green-500 transition-all font-semibold";

  const criteria = [
    { met: hasMinLength, label: "At least 8 characters" },
    { met: hasUppercase, label: "Contains an uppercase letter (A-Z)" },
    { met: hasLowercase, label: "Contains a lowercase letter (a-z)" },
    { met: hasNumber, label: "Contains a number (0-9)" },
    { met: hasSpecial, label: "Contains a special character (e.g. !@#$%)" },
  ];

  const allCriteriaMet = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] text-left"
    >
      <div className="mb-6">
        <h2 className="text-xl font-heading font-black text-[#0D1A14] mb-1">Account Security Settings</h2>
        <p className="text-sm text-gray-500">
          Update your login password. To ensure security, verify your identity with your current password, and choose a new, strong password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="max-w-md space-y-4 text-xs font-semibold text-gray-700">
        {/* Current password */}
        <div>
          <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1.5">Current Password *</label>
          <input
            type="password" required
            placeholder="Enter your current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* New password */}
        <div>
          <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1.5">New Password *</label>
          <input
            type="password" required
            placeholder="Enter secure new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Strength meter */}
        {newPassword && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-400">
              <span>Password Strength</span>
              <span className={`font-black ${
                strengthScore <= 2 ? "text-red-500" : strengthScore <= 4 ? "text-amber-500" : "text-green-600"
              }`}>
                {getStrengthLabel()}
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-105 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                style={{ width: `${(strengthScore / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Confirm password */}
        <div>
          <label className="block text-[11px] font-heading font-bold text-gray-500 uppercase mb-1.5">Confirm New Password *</label>
          <input
            type="password" required
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Checklist */}
        <div className="p-4.5 bg-gray-55/40 border border-gray-100 rounded-2xl space-y-2 text-gray-500 font-normal">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Security Criteria Checklist</div>
          {criteria.map(({ met, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <CheckCircle2 size={14} className={met ? "text-green-600" : "text-gray-300"} />
              <span className={`transition-colors text-xs ${met ? "text-green-700 font-semibold" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-100 my-1 pt-2 flex items-center gap-2.5">
            <CheckCircle2 size={14} className={passwordsMatch ? "text-green-600" : "text-gray-300"} />
            <span className={`transition-colors text-xs ${passwordsMatch ? "text-green-700 font-semibold" : "text-gray-400"}`}>
              Passwords match
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isChangingPassword || !oldPassword || !allCriteriaMet || !passwordsMatch}
          className="w-full py-3 rounded-xl bg-green-700 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-diffuse text-xs"
        >
          {isChangingPassword ? (
            <><Loader2 className="animate-spin" size={14} /> Updating Password...</>
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default PasswordTab;
