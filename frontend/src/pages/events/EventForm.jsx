import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileText, Calendar, Clock, MapPin, Tag, X,
  Plus, Loader2, Save, ArrowLeft, Hash, ImagePlus, Upload,
  CalendarRange, MapPinOff
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import { PageLoader } from "../../components/ui/Spinner";
import api from "../../services/api";

const CATEGORIES = [
  "Technical", "Cultural", "Sports", "Academic",
  "Workshop", "Seminar", "Conference", "Social", "Other"
];

const EMPTY = {
  title: "",
  description: "",
  category: "",
  eventDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  venue: "",
  tags: [],
};

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

export default function EventForm({ editMode = false }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(EMPTY);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(editMode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ── Poster upload state ── */
  const [posterUrl, setPosterUrl] = useState(null);
  const [posterPublicId, setPosterPublicId] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterUploading, setPosterUploading] = useState(false);

  /* ── Multi-day + Venue TBD + Time toggle ── */
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [venueTBD, setVenueTBD] = useState(false);
  const [showTime, setShowTime] = useState(false);

  /* ── Load existing event in edit mode ── */
  useEffect(() => {
    if (!editMode || !id) return;
    const load = async () => {
      setFetching(true);
      try {
        const res = await api.get(`/events/${id}`);
        const e = res.data?.data;
        if (!e) throw new Error("Not found");
        setForm({
          title: e.title ?? "",
          description: e.description ?? "",
          category: e.category ?? "",
          eventDate: e.eventDate ? e.eventDate.slice(0, 10) : "",
          endDate: e.endDate ? e.endDate.slice(0, 10) : "",
          startTime: e.startTime ?? "",
          endTime: e.endTime ?? "",
          venue: e.venue ?? "",
          tags: e.tags ?? [],
        });
        if (e.endDate) setIsMultiDay(true);
        if (e.venue === "To be announced") setVenueTBD(true);
        if (e.startTime || e.endTime) setShowTime(true);
        if (e.posterUrl) {
          setPosterUrl(e.posterUrl);
          setPosterPublicId(e.posterPublicId);
          setPosterPreview(e.posterUrl);
        }
      } catch {
        setError("Could not load event for editing.");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [editMode, id]);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  /* ── Tag handling ── */
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || form.tags.includes(t) || form.tags.length >= 5) return;
    setForm((p) => ({ ...p, tags: [...p.tags, t] }));
    setTagInput("");
  };
  const removeTag = (tag) =>
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addTag(); }
  };

  /* ── Poster upload ── */
  const handlePosterSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side preview
    setPosterPreview(URL.createObjectURL(file));
    setPosterUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("poster", file);

      const res = await api.post("/uploads/event-poster", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPosterUrl(res.data.posterUrl);
      setPosterPublicId(res.data.posterPublicId);
    } catch (err) {
      setError(err.response?.data?.error || "Poster upload failed.");
      setPosterPreview(null);
    } finally {
      setPosterUploading(false);
    }
  };

  const removePoster = () => {
    setPosterUrl(null);
    setPosterPublicId(null);
    setPosterPreview(null);
  };

  /* ── Validate client-side ── */
  const validate = () => {
    if (!form.title.trim() || form.title.trim().length < 3)
      return "Title must be at least 3 characters.";
    if (!form.description.trim() || form.description.trim().length < 5)
      return "Description must be at least 5 characters.";
    if (!form.category)
      return "Category is required.";
    if (!form.eventDate)
      return "Event date is required.";
    if (isMultiDay && form.endDate && form.endDate < form.eventDate)
      return "End date must be on or after start date.";
    if (form.startTime && form.endTime && form.endTime <= form.startTime)
      return "End time must be after start time.";
    return null;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const err = validate();
    if (err) { setError(err); return; }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      eventDate: form.eventDate,
      endDate: isMultiDay && form.endDate ? form.endDate : null,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      venue: venueTBD ? "To be announced" : (form.venue.trim() || null),
      tags: form.tags.length ? form.tags : undefined,
      posterUrl: posterUrl || undefined,
      posterPublicId: posterPublicId || undefined,
    };

    try {
      setLoading(true);
      if (editMode) {
        await api.put(`/events/${id}`, payload);
        setSuccess("Event updated successfully!");
        setTimeout(() => navigate("/dashboard/organizer"), 1200);
      } else {
        await api.post("/events", payload);
        setSuccess("Event created! Awaiting admin approval.");
        setTimeout(() => navigate("/dashboard/organizer"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Layout><PageLoader /></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto animate-slide-up">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard/organizer")}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </button>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-brand-400" />
            <h1>{editMode ? "Edit Event" : "Create New Event"}</h1>
          </div>
          <p>
            {editMode
              ? "Update the event details below."
              : "Fill in the details — your event will need admin approval before publishing."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">

          {/* Alerts */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}
          {success && (
            <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm animate-fade-in">
              {success}
            </div>
          )}

          {/* Title */}
          <Field label="Event Title" required>
            <input
              type="text"
              placeholder="e.g. Annual Tech Symposium 2025"
              value={form.title}
              onChange={set("title")}
              className="input"
            />
          </Field>

          {/* Description */}
          <Field label="Description" required>
            <textarea
              placeholder="Describe your event — agenda, speakers, activities…"
              value={form.description}
              onChange={set("description")}
              rows={4}
              className="input resize-none"
            />
          </Field>

          {/* Category */}
          <Field label="Category" required>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <select
                value={form.category}
                onChange={set("category")}
                className="select pl-10 appearance-none"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </Field>

          {/* Start Date */}
          <Field label={isMultiDay ? "Start Date" : "Event Date"} required>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="date"
                value={form.eventDate}
                onChange={set("eventDate")}
                className="input pl-10"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </Field>

          {/* End Date (Conditional) */}
          {isMultiDay && (
            <Field label="End Date">
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="date"
                  value={form.endDate}
                  onChange={set("endDate")}
                  min={form.eventDate}
                  className="input pl-10"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </Field>
          )}

          {/* Toggle buttons row */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setIsMultiDay(!isMultiDay);
                if (isMultiDay) setForm((f) => ({ ...f, endDate: "" }));
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         border transition-all ${
                           isMultiDay
                             ? "bg-brand-500/15 text-brand-300 border-brand-500/30"
                             : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
                         }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              Multi-day event
            </button>

            <button
              type="button"
              onClick={() => {
                setShowTime(!showTime);
                if (showTime) setForm((f) => ({ ...f, startTime: "", endTime: "" }));
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         border transition-all ${
                           showTime
                             ? "bg-brand-500/15 text-brand-300 border-brand-500/30"
                             : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
                         }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Add specific time
            </button>
          </div>

          {/* Start + End time — only shown when toggled */}
          {showTime && (
            <>
              <Field label="Start Time">
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={set("startTime")}
                    className="input pl-10"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </Field>

              <Field label="End Time">
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={set("endTime")}
                    className="input pl-10"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </Field>
            </>
          )}

          {/* Venue */}
          <Field label="Venue" hint="Hall, auditorium, or online platform name">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={venueTBD ? "Venue to be announced" : "e.g. Main Auditorium, Block A"}
                    value={venueTBD ? "" : form.venue}
                    onChange={set("venue")}
                    disabled={venueTBD}
                    className={`input pl-10 ${venueTBD ? "opacity-40 cursor-not-allowed" : ""}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVenueTBD(!venueTBD);
                    if (!venueTBD) setForm((f) => ({ ...f, venue: "" }));
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium
                             border transition-all whitespace-nowrap ${
                               venueTBD
                                 ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                 : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
                             }`}
                >
                  <MapPinOff className="w-3.5 h-3.5" />
                  {venueTBD ? "TBD" : "Not decided?"}
                </button>
              </div>
              {venueTBD && (
                <p className="text-xs text-amber-400/80 flex items-center gap-1.5">
                  <MapPinOff className="w-3 h-3" />
                  Venue will display as "To be announced"
                </p>
              )}
            </div>
          </Field>

          {/* Tags */}
          <Field label="Tags" hint="Up to 5 tags. Press Enter or click + to add.">
            <div className="space-y-2">
              {/* Existing tags */}
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 text-xs bg-brand-500/15 text-brand-300
                                 border border-brand-500/20 px-2.5 py-1 rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-brand-400 hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag input */}
              {form.tags.length < 5 && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="add a tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="input pl-10"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="button-ghost px-3 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </Field>

          {/* Event Poster */}
          <Field label="Event Poster" hint="JPG, PNG, or WebP. Max 5 MB.">
            {posterPreview ? (
              <div className="relative group/poster">
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  className="w-full max-h-64 object-cover rounded-xl border border-white/10"
                />
                {posterUploading && (
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
                  </div>
                )}
                {!posterUploading && (
                  <button
                    type="button"
                    onClick={removePoster}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-red-400
                               hover:text-white hover:bg-red-500/60 transition-all
                               opacity-0 group-hover/poster:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl
                           border-2 border-dashed border-white/15 hover:border-brand-500/40
                           bg-white/3 hover:bg-brand-500/5 cursor-pointer transition-all"
              >
                <div className="p-3 rounded-xl bg-brand-500/10">
                  <ImagePlus className="w-6 h-6 text-brand-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-300 font-medium">Click to upload poster</p>
                  <p className="text-xs text-slate-500 mt-0.5">or drag and drop</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePosterSelect}
                  className="hidden"
                />
              </label>
            )}
          </Field>

          {/* Divider */}
          <div className="divider" />

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate("/dashboard/organizer")}
              className="button-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="button-primary"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />
                  {editMode ? "Saving…" : "Creating…"}
                </>
              ) : (
                <><Save className="w-4 h-4" />
                  {editMode ? "Save Changes" : "Create Event"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
