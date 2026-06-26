import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { supabase } from "../../lib/supabase";

export const PasswordTab: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useNotification();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Strength criteria
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  
  const strengthScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
  
  const getStrengthLabel = () => {
    if (!newPassword) return "";
    if (strengthScore <= 2) return "Weak";
    if (strengthScore <= 4) return "Fair";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (strengthScore <= 2) return "bg-red-500";
    if (strengthScore <= 4) return "bg-amber-500";
    return "bg-green-600";
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!oldPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    const allCriteriaMet = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
    if (!allCriteriaMet) {
      toast.error("Please satisfy all password strength criteria.");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      // Re-sign in to verify old password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: profile.email || user.email || "",
        password: oldPassword,
      });

      if (verifyError) {
        throw new Error("Verification failed: The current password you entered is incorrect.");
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const inputCls = "w-full px-3.5 py-2.5 bg-[#101D17] border border-white/10 rounded-xl text-white outline-none focus:border-green-500 transition-all font-semibold";
  const criteria = [
    { met: hasMinLength, label: "At least 8 characters" },
    { met: hasUppercase, label: "Contains an uppercase letter (A-Z)" },
    { met: hasLowercase, label: "Contains a lowercase letter (a-z)" },
    { met: hasNumber, label: "Contains a number (0-9)" },
    { met: hasSpecial, label: "Contains a special character (e.g. !@#$%)" },
  ];

  const allCriteriaMet = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  return (
    <div className="bg-[#0A1410] border border-white/5 rounded-3xl p-6">
      <div className="mb-6">
        <h3 className="text-base font-heading font-black text-white">Account Security Settings</h3>
        <p className="text-xs text-[#8A9690] mt-1 font-semibold">
          Update your administrator login password. To ensure security, verify your identity with your current password, and choose a new, strong password.
        </p>
      </div>

      <form onSubmit={handlePasswordChange} className="max-w-md space-y-4 text-xs font-semibold text-[#8A9690]">
        {/* Current password */}
        <div>
          <label className="block text-[10px] font-heading font-black text-[#8A9690] uppercase tracking-wider mb-1.5">Current Password *</label>
          <input
            type="password"
            required
            placeholder="Enter your current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* New password */}
        <div>
          <label className="block text-[10px] font-heading font-black text-[#8A9690] uppercase tracking-wider mb-1.5">New Password *</label>
          <input
            type="password"
            required
            placeholder="Enter secure new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Strength meter */}
        {newPassword && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[9px] uppercase font-bold text-gray-500">
              <span>Password Strength</span>
              <span className={`font-black ${
                strengthScore <= 2 ? "text-red-500" : strengthScore <= 4 ? "text-amber-500" : "text-green-400"
              }`}>
                {getStrengthLabel()}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                style={{ width: `${(strengthScore / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Confirm password */}
        <div>
          <label className="block text-[10px] font-heading font-black text-[#8A9690] uppercase tracking-wider mb-1.5">Confirm New Password *</label>
          <input
            type="password"
            required
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Checklist */}
        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-2 text-gray-400 font-normal">
          <div className="text-[9px] uppercase font-bold text-gray-500 mb-1">Security Criteria Checklist</div>
          {criteria.map(({ met, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <CheckCircle2 size={14} className={met ? "text-green-500" : "text-gray-600"} />
              <span className={`transition-colors text-xs ${met ? "text-green-400 font-semibold" : "text-gray-500"}`}>
                {label}
              </span>
            </div>
          ))}
          <div className="border-t border-white/5 my-1 pt-2 flex items-center gap-2.5">
            <CheckCircle2 size={14} className={passwordsMatch ? "text-green-500" : "text-gray-600"} />
            <span className={`transition-colors text-xs ${passwordsMatch ? "text-green-400 font-semibold" : "text-gray-500"}`}>
              Passwords match
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isChangingPassword || !oldPassword || !allCriteriaMet || !passwordsMatch}
          className="w-full py-3 rounded-xl bg-green-700 hover:bg-green-600 disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-diffuse text-xs"
        >
          {isChangingPassword ? (
            <>
              <Loader2 className="animate-spin" size={14} /> Updating Password...
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </div>
  );
};
