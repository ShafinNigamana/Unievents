import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Mail, Hash, Calendar, Bookmark,
    ClipboardList, Heart, Star, ArrowRight,
    AlertCircle, CheckCircle2, Archive,
    GraduationCap, Edit2, Save, X, Plus,
    Phone, BookOpen, Award, Layers,
    Lock, Eye, EyeOff, ShieldCheck
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import StarRating from "../../components/ui/StarRating";
import { SkeletonGrid } from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

/* ── Stat card ───────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, border }) {
    return (
        <div className={`glass-card p-5 flex items-center gap-4 border ${border}`}>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-white leading-none">{value ?? 0}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
        </div>
    );
}

/* ── Section header ──────────────────────────── */
function SectionHeader({ icon: Icon, iconColor, title, count, to, navigate }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${iconColor}`} />
                <h2>{title}</h2>
                {count !== undefined && (
                    <span className="text-sm text-slate-500 ml-1">({count})</span>
                )}
            </div>
            {to && (
                <button
                    onClick={() => navigate(to)}
                    className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                >
                    View all <ArrowRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

/* ── Compact event tile ──────────────────────── */
function EventTile({ event, onClick, badge }) {
    if (!event) return null;
    return (
        <div
            onClick={onClick}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8
                 hover:border-brand-500/30 hover:bg-white/8 cursor-pointer transition-all group"
        >
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-600/20 to-purple-600/20">
                {event.posterUrl ? (
                    <img src={event.posterUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-brand-500/30" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors truncate">
                    {event.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {event.category && (
                        <span className="text-[11px] text-slate-500">{event.category}</span>
                    )}
                    {event.eventDate && (
                        <span className="text-[11px] text-slate-600">
                            · {new Date(event.eventDate).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                            })}
                        </span>
                    )}
                </div>
            </div>
            {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
    );
}

/* ── Empty section state ─────────────────────── */
function EmptySection({ message }) {
    return (
        <div className="py-8 text-center">
            <p className="text-slate-500 text-sm">{message}</p>
        </div>
    );
}

/* ── Edit Profile Form ───────────────────────── */
function EditProfileForm({ user, onSave, onCancel }) {
    const [form, setForm] = useState({
        name: user.name ?? "",
        email: user.email ?? "",
        enrollmentId: user.enrollmentId ?? "",
        department: user.department ?? "",
        semester: user.semester ?? "",
        year: user.year ?? "",
        cgpa: user.cgpa ?? "",
        phone: user.phone ?? "",
        skills: user.skills ?? [],
    });
    const [skillInput, setSkillInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const set = (field) => (e) =>
        setForm((p) => ({ ...p, [field]: e.target.value }));

    const addSkill = () => {
        const s = skillInput.trim().toLowerCase();
        if (!s || form.skills.includes(s) || form.skills.length >= 15) return;
        setForm((p) => ({ ...p, skills: [...p.skills, s] }));
        setSkillInput("");
    };

    const removeSkill = (skill) =>
        setForm((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));

    const handleSkillKeyDown = (e) => {
        if (e.key === "Enter") { e.preventDefault(); addSkill(); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        const payload = {};
        if (form.name.trim()) payload.name = form.name.trim();
        if (form.email.trim()) payload.email = form.email.trim();
        if (form.enrollmentId.trim()) payload.enrollmentId = form.enrollmentId.trim();
        if (form.department.trim()) payload.department = form.department.trim();
        if (form.semester !== "") payload.semester = Number(form.semester);
        if (form.year !== "") payload.year = Number(form.year);
        if (form.cgpa !== "") payload.cgpa = Number(form.cgpa);
        payload.phone = form.phone.trim() || null;
        payload.skills = form.skills;

        try {
            const res = await api.put("/users/me", payload);
            onSave(res.data.data);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1.5">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input type="text" value={form.name} onChange={set("name")}
                            placeholder="Your full name" className="input pl-10" />
                    </div>
                </div>
                <div>
                    <label className="block mb-1.5">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input type="email" value={form.email} onChange={set("email")}
                            placeholder="your@email.com" className="input pl-10" />
                    </div>
                </div>
                <div>
                    <label className="block mb-1.5">Enrollment ID</label>
                    <div className="relative">
                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input type="text" value={form.enrollmentId} onChange={set("enrollmentId")}
                            placeholder="e.g. 22CS0001" className="input pl-10" />
                    </div>
                </div>
                <div>
                    <label className="block mb-1.5">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input type="text" value={form.phone} onChange={set("phone")}
                            placeholder="e.g. 9876543210" className="input pl-10" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1.5">Department</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input type="text" value={form.department} onChange={set("department")}
                            placeholder="e.g. Computer Science" className="input pl-10" />
                    </div>
                </div>
                <div>
                    <label className="block mb-1.5">CGPA</label>
                    <div className="relative">
                        <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={set("cgpa")}
                            placeholder="e.g. 8.5" className="input pl-10" />
                    </div>
                </div>
                <div>
                    <label className="block mb-1.5">Semester</label>
                    <div className="relative">
                        <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input type="number" min="1" max="12" value={form.semester} onChange={set("semester")}
                            placeholder="e.g. 4" className="input pl-10" />
                    </div>
                </div>
                <div>
                    <label className="block mb-1.5">Year</label>
                    <div className="relative">
                        <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input type="number" min="1" max="6" value={form.year} onChange={set("year")}
                            placeholder="e.g. 2" className="input pl-10" />
                    </div>
                </div>
            </div>

            <div>
                <label className="block mb-1.5">Skills (up to 15)</label>
                <div className="space-y-2">
                    {form.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {form.skills.map((skill) => (
                                <span key={skill}
                                    className="inline-flex items-center gap-1.5 text-xs bg-brand-500/15 text-brand-300 border border-brand-500/20 px-2.5 py-1 rounded-full">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)}
                                        className="text-brand-400 hover:text-white transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    {form.skills.length < 15 && (
                        <div className="flex gap-2">
                            <input type="text" placeholder="Add a skill (press Enter)"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillKeyDown}
                                className="input flex-1 text-sm" />
                            <button type="button" onClick={addSkill}
                                disabled={!skillInput.trim()}
                                className="button-ghost px-3 disabled:opacity-40">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-white/8">
                <button type="button" onClick={onCancel} className="button-ghost py-2 px-4 text-sm">
                    <X className="w-4 h-4" /> Cancel
                </button>
                <button type="submit" disabled={saving} className="button-primary py-2 px-4 text-sm">
                    {saving ? <>Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
            </div>
        </form>
    );
}

/* ── Change Password Form ────────────────────── */
function ChangePasswordForm({ onSuccess, onCancel }) {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const set = (field) => (e) =>
        setForm((p) => ({ ...p, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (form.newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }
        if (form.newPassword === form.currentPassword) {
            setError("New password must be different from your current password.");
            return;
        }

        setSaving(true);
        try {
            await api.put("/users/me/password", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update password.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
                    {error}
                </div>
            )}

            <div>
                <label className="block mb-1.5">Current Password</label>
                <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                        type={showCurrent ? "text" : "password"}
                        value={form.currentPassword}
                        onChange={set("currentPassword")}
                        placeholder="Your current password"
                        className="input pl-10 pr-10"
                        autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowCurrent((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block mb-1.5">New Password</label>
                <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                        type={showNew ? "text" : "password"}
                        value={form.newPassword}
                        onChange={set("newPassword")}
                        placeholder="Min. 6 characters"
                        className="input pl-10 pr-10"
                        autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowNew((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block mb-1.5">Confirm New Password</label>
                <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={set("confirmPassword")}
                        placeholder="Repeat new password"
                        className="input pl-10 pr-10"
                        autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowConfirm((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-white/8">
                <button type="button" onClick={onCancel} className="button-ghost py-2 px-4 text-sm">
                    <X className="w-4 h-4" /> Cancel
                </button>
                <button type="submit" disabled={saving} className="button-primary py-2 px-4 text-sm">
                    {saving ? <>Updating…</> : <><ShieldCheck className="w-4 h-4" /> Update Password</>}
                </button>
            </div>
        </form>
    );
}

/* ═══════════════════════════════════════════════
   STUDENT PROFILE PAGE
═══════════════════════════════════════════════ */
export default function StudentProfile() {
    const navigate = useNavigate();
    const { user: authUser, login } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Edit profile state
    const [editing, setEditing] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Change password state
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/users/me/profile");
            setProfile(res.data?.data);
        } catch {
            setError("Failed to load your profile. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Called when EditProfileForm saves successfully
    const handleSave = (updatedUser) => {
        setProfile((prev) => ({ ...prev, user: updatedUser }));
        setEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        // Sync name/email into AuthContext so Navbar updates immediately
        if (authUser) {
            login(localStorage.getItem("token"), {
                ...authUser,
                name: updatedUser.name,
                email: updatedUser.email,
            });
        }
    };

    // Called when ChangePasswordForm saves successfully
    const handlePasswordSuccess = () => {
        setChangingPassword(false);
        setPasswordSuccess(true);
        setTimeout(() => setPasswordSuccess(false), 3000);
    };

    if (loading) {
        return (
            <Layout>
                <div className="space-y-8 animate-fade-in">
                    <div className="h-40 glass-card animate-pulse rounded-2xl" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 glass-card animate-pulse rounded-2xl" />
                        ))}
                    </div>
                    <SkeletonGrid count={3} />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="text-center py-24 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <p className="text-red-400">{error}</p>
                    <button onClick={fetchProfile} className="button-ghost text-sm">Retry</button>
                </div>
            </Layout>
        );
    }

    const { user, savedEvents, registeredEvents, interestedEvents, myReviews } = profile;

    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric",
        })
        : "—";

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">

                {/* ── Success banners ── */}
                {saveSuccess && (
                    <div className="glass-card p-4 flex items-center gap-3 border-green-500/20 animate-fade-in">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-300 font-medium">Profile updated successfully.</p>
                    </div>
                )}
                {passwordSuccess && (
                    <div className="glass-card p-4 flex items-center gap-3 border-green-500/20 animate-fade-in">
                        <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-300 font-medium">Password updated successfully.</p>
                    </div>
                )}

                {/* ── Profile Hero Card ── */}
                <div
                    className="relative overflow-hidden rounded-2xl border border-white/10 p-8"
                    style={{ background: "linear-gradient(135deg, #1a0a3e 0%, #14142b 60%, #0d1a3a 100%)" }}
                >
                    <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-brand-500/10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-purple-600/10 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-glow">
                                {user.name
                                    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                                    : "ST"}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap mb-1">
                                    <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                        {user.role}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 mt-2 flex-wrap">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Mail className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                        {user.email}
                                    </div>
                                    {user.enrollmentId && (
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Hash className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                            {user.enrollmentId}
                                        </div>
                                    )}
                                    {user.phone && (
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Phone className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                            {user.phone}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <GraduationCap className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                        Member since {memberSince}
                                    </div>
                                </div>

                                {/* Academic details */}
                                {(user.department || user.semester || user.year || user.cgpa) && (
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        {user.department && (
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                                                {user.department}
                                            </span>
                                        )}
                                        {user.year && (
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                                                Year {user.year}
                                            </span>
                                        )}
                                        {user.semester && (
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                                                Sem {user.semester}
                                            </span>
                                        )}
                                        {user.cgpa && (
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-300">
                                                CGPA {user.cgpa}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Skills */}
                                {user.skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {user.skills.map((skill) => (
                                            <span key={skill}
                                                className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/20">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Edit button — hidden when any form is open */}
                            {!editing && !changingPassword && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="button-ghost py-2 px-4 text-sm flex-shrink-0 self-start"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </button>
                            )}
                        </div>

                        {/* Edit Profile form — inline inside hero card */}
                        {editing && (
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <EditProfileForm
                                    user={user}
                                    onSave={handleSave}
                                    onCancel={() => setEditing(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Activity Stats ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        icon={Bookmark} label="Saved Events"
                        value={savedEvents.length}
                        color="bg-brand-600/80" border="border-brand-500/20"
                    />
                    <StatCard
                        icon={ClipboardList} label="Registered"
                        value={registeredEvents.length}
                        color="bg-green-600/80" border="border-green-500/20"
                    />
                    <StatCard
                        icon={Heart} label="Interested"
                        value={interestedEvents.length}
                        color="bg-pink-600/80" border="border-pink-500/20"
                    />
                    <StatCard
                        icon={Star} label="Reviews Given"
                        value={myReviews.length}
                        color="bg-amber-600/80" border="border-amber-500/20"
                    />
                </div>

                {/* ── Registered Events ── */}
                <section className="glass-card p-6">
                    <SectionHeader
                        icon={ClipboardList} iconColor="text-green-400"
                        title="Registered Events"
                        count={registeredEvents.length}
                        to="/my-registrations"
                        navigate={navigate}
                    />
                    {registeredEvents.length === 0 ? (
                        <EmptySection message="You haven't registered for any events yet." />
                    ) : (
                        <div className="space-y-2">
                            {registeredEvents.slice(0, 5).map(({ registration, event }) => (
                                <EventTile
                                    key={registration._id}
                                    event={event}
                                    onClick={() => navigate(`/events/${event._id}`)}
                                    badge={
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/25">
                                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                                            <span className="text-[11px] text-green-400 font-medium">Registered</span>
                                        </div>
                                    }
                                />
                            ))}
                            {registeredEvents.length > 5 && (
                                <button onClick={() => navigate("/my-registrations")}
                                    className="w-full text-xs text-slate-500 hover:text-brand-400 transition-colors pt-2">
                                    +{registeredEvents.length - 5} more registrations
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* ── Saved Events ── */}
                <section className="glass-card p-6">
                    <SectionHeader
                        icon={Bookmark} iconColor="text-brand-400"
                        title="Saved Events"
                        count={savedEvents.length}
                        to="/saved-events"
                        navigate={navigate}
                    />
                    {savedEvents.length === 0 ? (
                        <EmptySection message="You haven't saved any events yet." />
                    ) : (
                        <div className="space-y-2">
                            {savedEvents.slice(0, 5).map((event) => (
                                <EventTile
                                    key={event._id}
                                    event={event}
                                    onClick={() => navigate(`/events/${event._id}`)}
                                    badge={
                                        event.status === "archived" && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/25">
                                                <Archive className="w-3 h-3 text-blue-400" />
                                                <span className="text-[11px] text-blue-400 font-medium">Archived</span>
                                            </div>
                                        )
                                    }
                                />
                            ))}
                            {savedEvents.length > 5 && (
                                <button onClick={() => navigate("/saved-events")}
                                    className="w-full text-xs text-slate-500 hover:text-brand-400 transition-colors pt-2">
                                    +{savedEvents.length - 5} more saved events
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* ── Interested Events ── */}
                <section className="glass-card p-6">
                    <SectionHeader
                        icon={Heart} iconColor="text-pink-400"
                        title="Interested Events"
                        count={interestedEvents.length}
                    />
                    {interestedEvents.length === 0 ? (
                        <EmptySection message="You haven't marked interest in any events yet." />
                    ) : (
                        <div className="space-y-2">
                            {interestedEvents.slice(0, 5).map((event) => (
                                <EventTile
                                    key={event._id}
                                    event={event}
                                    onClick={() => navigate(`/events/${event._id}`)}
                                    badge={
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/15 border border-pink-500/25">
                                            <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                                            <span className="text-[11px] text-pink-400 font-medium">
                                                {event.interestedCount ?? 0} interested
                                            </span>
                                        </div>
                                    }
                                />
                            ))}
                            {interestedEvents.length > 5 && (
                                <p className="text-xs text-slate-600 text-center pt-2">
                                    +{interestedEvents.length - 5} more
                                </p>
                            )}
                        </div>
                    )}
                </section>

                {/* ── My Reviews ── */}
                <section className="glass-card p-6">
                    <SectionHeader
                        icon={Star} iconColor="text-amber-400"
                        title="My Reviews"
                        count={myReviews.length}
                    />
                    {myReviews.length === 0 ? (
                        <EmptySection message="You haven't reviewed any events yet." />
                    ) : (
                        <div className="space-y-3">
                            {myReviews.slice(0, 5).map((review) => (
                                <div
                                    key={review._id}
                                    onClick={() => navigate(`/events/${review.eventId._id}`)}
                                    className="p-4 rounded-xl bg-white/5 border border-white/8
                             hover:border-amber-500/20 cursor-pointer transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <p className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors truncate">
                                            {review.eventId.title}
                                        </p>
                                        <span className="text-[11px] text-slate-600 whitespace-nowrap flex-shrink-0">
                                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <StarRating rating={review.rating} size={14} readonly />
                                    {review.comment && (
                                        <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                                            "{review.comment}"
                                        </p>
                                    )}
                                </div>
                            ))}
                            {myReviews.length > 5 && (
                                <p className="text-xs text-slate-600 text-center pt-1">
                                    +{myReviews.length - 5} more reviews
                                </p>
                            )}
                        </div>
                    )}
                </section>

                {/* ── Account Security ── */}
                <section className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-slate-400" />
                            <h2>Account Security</h2>
                        </div>
                        {!changingPassword && (
                            <button
                                onClick={() => { setChangingPassword(true); setEditing(false); }}
                                className="button-ghost py-2 px-4 text-sm"
                            >
                                <Lock className="w-4 h-4" /> Change Password
                            </button>
                        )}
                    </div>

                    {!changingPassword ? (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/8">
                            <div className="p-2.5 rounded-lg bg-slate-700/50">
                                <Lock className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Password</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Last updated when you registered. Keep it secure.
                                </p>
                            </div>
                            <div className="ml-auto">
                                <span className="text-xs text-slate-600">••••••••</span>
                            </div>
                        </div>
                    ) : (
                        <ChangePasswordForm
                            onSuccess={handlePasswordSuccess}
                            onCancel={() => setChangingPassword(false)}
                        />
                    )}
                </section>

            </div>
        </Layout>
    );
}