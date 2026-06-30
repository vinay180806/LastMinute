"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { supabase } from "@/utils/supabase";
import { User, Edit2, Check, X, Mail, Phone, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFirstName(user.user_metadata?.first_name || "");
        setLastName(user.user_metadata?.last_name || "");
        setMobile(user.user_metadata?.mobile_number || "");
      } else {
        router.push("/login");
      }
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          mobile_number: mobile,
        }
      });
      if (error) throw error;
      setUser(data.user);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Failed to save profile updates.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to current DB values
    setFirstName(user?.user_metadata?.first_name || "");
    setLastName(user?.user_metadata?.last_name || "");
    setMobile(user?.user_metadata?.mobile_number || "");
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      
      <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto flex-1 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-3xl"
        >
          <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Your Profile</h1>
                <p className="text-muted-foreground">Manage your personal information</p>
              </div>
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors text-white border border-white/10"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors text-white border border-white/10"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-red-500 rounded-xl text-sm font-medium transition-colors text-white disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">First Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                ) : (
                  <div className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-3 text-white">
                    {firstName || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                ) : (
                  <div className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-3 text-white">
                    {lastName || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Email (Read only mostly, but displaying it) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <div className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-3 text-white/70">
                {user.email} <span className="text-xs ml-2 text-primary opacity-80">(Cannot be edited)</span>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" /> Mobile Number
              </label>
              {isEditing ? (
                <input 
                  type="tel" 
                  value={mobile} 
                  onChange={e => setMobile(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
              ) : (
                <div className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-3 text-white">
                  {mobile || <span className="text-muted-foreground italic">Not set</span>}
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
