"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Shield, User, Save, Eye, EyeOff, CheckCircle,
  Loader2, AlertCircle, Mail, Phone, Pencil, Check,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("admin_token") ?? "";
}
function authHeaders(): HeadersInit {
  return { authorization: `Bearer ${getToken()}` };
}

const PREF_KEY = "csng_admin_prefs";

interface AdminPrefs {
  emailNotifications: boolean;
  smsNotifications:   boolean;
}

function loadPrefs(): AdminPrefs {
  if (typeof window === "undefined") return { emailNotifications: true, smsNotifications: true };
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) return { emailNotifications: true, smsNotifications: true, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { emailNotifications: true, smsNotifications: true };
}

function savePrefs(prefs: AdminPrefs) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5123d4] focus:ring-offset-2 ${
        checked ? "bg-[#5123d4]" : "bg-gray-200"
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function AdminSettingsPage() {
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      router.replace("/admin/login");
    }
  }, [router]);

  const [prefs, setPrefs] = useState<AdminPrefs>({ emailNotifications: true, smsNotifications: true });
  useEffect(() => { setPrefs(loadPrefs()); }, []);

  const updatePref = <K extends keyof AdminPrefs>(key: K, value: AdminPrefs[K]) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePrefs(next);
    toast.success("Preference saved");
  };

  const [currentPwd,  setCurrentPwd]  = useState("");
  const [newPwd,      setNewPwd]      = useState("");
  const [confirmPwd,  setConfirmPwd]  = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [pwdLoading,  setPwdLoading]  = useState(false);
  const [pwdError,    setPwdError]    = useState("");
  const [pwdSuccess,  setPwdSuccess]  = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(""); setPwdSuccess(false);
    if (newPwd.length < 8)          { setPwdError("New password must be at least 8 characters."); return; }
    if (newPwd !== confirmPwd)       { setPwdError("New passwords do not match."); return; }
    if (newPwd === currentPwd)       { setPwdError("New password must be different from the current one."); return; }

    setPwdLoading(true);
    try {
      const res  = await fetch("/api/admin/change-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body:    JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const json = await res.json() as { message?: string; error?: string };
      if (!res.ok) { setPwdError(json.error || "Failed to change password."); return; }
      setPwdSuccess(true);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      toast.success("Password changed successfully");
    } catch {
      setPwdError("Network error. Please try again.");
    } finally {
      setPwdLoading(false);
    }
  };

  const [adminEmail, setAdminEmail] = useState("");
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      setAdminEmail((payload as { email?: string }).email ?? "");
    } catch { /* ignore */ }
  }, []);

  const [contactPhone, setContactPhone]   = useState("+2348166027757");
  const [editingPhone, setEditingPhone]   = useState(false);
  const [editPhoneVal, setEditPhoneVal]   = useState("");
  const [savingPhone,  setSavingPhone]    = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings", { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.phoneNumber) setContactPhone(d.phoneNumber); })
      .catch(() => {});
  }, []);

  const savePhone = async () => {
    if (!editPhoneVal.trim()) return;
    setSavingPhone(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ phoneNumber: editPhoneVal.trim() }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json() as { phoneNumber: string };
      setContactPhone(d.phoneNumber);
      setEditingPhone(false);
      toast.success("Contact number updated");
    } catch {
      toast.error("Failed to save number");
    } finally {
      setSavingPhone(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-[#f4f5f7] p-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold text-black">Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your admin preferences and account security</p>
          </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-[#f0ebff] rounded-xl">
                <User className="w-5 h-5 text-[#5123d4]" />
              </div>
              <h2 className="text-base font-bold text-black">Admin Profile</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Admin Email</p>
                  <p className="font-medium text-black">{adminEmail || "—"}</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-400">Customer Contact Number</p>
                </div>
                {editingPhone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="tel"
                      value={editPhoneVal}
                      onChange={e => setEditPhoneVal(e.target.value)}
                      placeholder="+2348166027757"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                      autoFocus
                      onKeyDown={e => { if (e.key === "Enter") void savePhone(); if (e.key === "Escape") setEditingPhone(false); }}
                    />
                    <button
                      type="button"
                      onClick={() => void savePhone()}
                      disabled={savingPhone || !editPhoneVal.trim()}
                      className="flex items-center gap-1 px-3 py-2 bg-[#5123d4] hover:bg-[#401AA0] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {savingPhone ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPhone(false)}
                      className="px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-black text-sm">{contactPhone}</p>
                    <button
                      type="button"
                      onClick={() => { setEditPhoneVal(contactPhone); setEditingPhone(true); }}
                      className="flex items-center gap-1.5 text-xs text-[#5123d4] hover:text-[#401AA0] font-medium transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-gray-400 mt-2">This number shows on your website and order tracking page.</p>
              </div>
              <p className="text-xs text-gray-400 px-1">
                To change the admin login email, update the <code className="bg-gray-100 px-1 rounded">ADMIN_EMAIL</code> environment variable.
              </p>
            </div>
          </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-[#f0ebff] rounded-xl">
                <Bell className="w-5 h-5 text-[#5123d4]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-black">Notifications</h2>
                <p className="text-xs text-gray-400">Choose how you receive new order alerts</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-black">Email notifications</p>
                  <p className="text-xs text-gray-500 mt-0.5">Receive an email when a new order is placed</p>
                </div>
                <Toggle
                  checked={prefs.emailNotifications}
                  onChange={(v) => updatePref("emailNotifications", v)}
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-black">SMS notifications</p>
                  <p className="text-xs text-gray-500 mt-0.5">Receive an SMS when a new order is placed</p>
                </div>
                <Toggle
                  checked={prefs.smsNotifications}
                  onChange={(v) => updatePref("smsNotifications", v)}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 border-t border-gray-100 pt-3">
              Notification preferences are saved in your browser. Each admin device can have its own settings.
            </p>
          </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-[#f0ebff] rounded-xl">
                <Shield className="w-5 h-5 text-[#5123d4]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-black">Change Password</h2>
                <p className="text-xs text-gray-400">Update your admin account password</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current password */}
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPwd}
                    onChange={(e) => { setCurrentPwd(e.target.value); setPwdError(""); }}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5123d4] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showCurrent ? "Hide password" : "Show password"}
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => { setNewPwd(e.target.value); setPwdError(""); }}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5123d4] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => { setConfirmPwd(e.target.value); setPwdError(""); }}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                  required
                />
              </div>

              {pwdError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {pwdError}
                </div>
              )}
              {pwdSuccess && (
                <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Password changed successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={pwdLoading || !currentPwd || !newPwd || !confirmPwd}
                className="w-full bg-[#5123d4] hover:bg-[#401AA0] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {pwdLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><Save className="w-4 h-4" /> Update Password</>}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}
