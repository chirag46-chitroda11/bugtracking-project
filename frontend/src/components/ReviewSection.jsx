import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Send, MessageSquarePlus, Quote } from "lucide-react";
import { getApprovedReviews, getReviewStats, submitReview } from "../services/reviewService";
import toast from "react-hot-toast";

/* ─── Star Rating Picker ─── */
const StarPicker = ({ rating, setRating, size = 24 }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        onClick={() => setRating(i)}
        style={{ cursor: "pointer", transition: "0.2s" }}
        fill={i <= rating ? "#f59e0b" : "none"}
        color={i <= rating ? "#f59e0b" : "#cbd5e1"}
      />
    ))}
  </div>
);

/* ─── Star Display (read-only) ─── */
const StarDisplay = ({ rating, size = 14 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        fill={i <= rating ? "#f59e0b" : "none"}
        color={i <= rating ? "#f59e0b" : "#e2e8f0"}
      />
    ))}
  </div>
);

/* ─── Review Submit Modal ─── */
const ReviewFormModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({ name: "", role: "", company: "", rating: 5, message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Name and message are required");
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      toast.error("Please select a rating");
      return;
    }
    setLoading(true);
    try {
      await submitReview(form);
      toast.success("Review submitted! It will appear after admin approval. 🎉");
      setForm({ name: "", role: "", company: "", rating: 5, message: "" });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
            borderRadius: 24, padding: "36px 32px",
            width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.12)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>Share Your Experience</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginTop: 4 }}>Your feedback helps us improve Fixify</p>
            </div>
            <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} color="#64748b" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Your Name *</label>
              <input
                type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none", fontSize: 14, fontWeight: 500, transition: "0.3s", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Role</label>
                <input
                  type="text" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="QA Lead"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none", fontSize: 14, fontWeight: 500, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Company</label>
                <input
                  type="text" value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Acme Inc."
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none", fontSize: 14, fontWeight: 500, boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Rating *</label>
              <StarPicker rating={form.rating} setRating={(r) => setForm({ ...form, rating: r })} size={28} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Your Review *</label>
              <textarea
                required rows={4} value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about your experience with Fixify..."
                style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none", fontSize: 14, fontWeight: 500, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: 14,
                background: loading ? "#94a3b8" : "#0f172a", color: "#fff",
                fontWeight: 700, fontSize: 15, border: "none", cursor: loading ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "0.3s", boxShadow: "0 8px 20px rgba(15,23,42,0.15)"
              }}
            >
              <Send size={16} />
              {loading ? "Submitting..." : "Submit Review"}
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12, fontWeight: 500 }}>
              Your review will be visible after admin approval
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─── Main Review Section ─── */
const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          getApprovedReviews(),
          getReviewStats()
        ]);
        setReviews(reviewsRes.data.data || []);
        setStats(statsRes.data.data || { averageRating: 0, totalReviews: 0 });
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };
    fetchData();
  }, []);

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  };

  const avatarColors = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #43e97b, #38f9d7)",
    "linear-gradient(135deg, #fa709a, #fee140)",
    "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  ];

  return (
    <div id="reviews" style={{ padding: "100px 8%", position: "relative", zIndex: 10 }}>
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: 60 }}
      >
        <span style={{
          fontSize: 12, fontWeight: 800, color: "#7c3aed", textTransform: "uppercase",
          letterSpacing: 3, background: "rgba(124,58,237,0.08)",
          padding: "6px 18px", borderRadius: 50, display: "inline-block"
        }}>
          Testimonials
        </span>
        <h2 style={{
          fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900,
          marginTop: 18, letterSpacing: "-1px", color: "#0f172a"
        }}>
          What our users <span style={{ color: "#7c3aed" }}>say about us</span>
        </h2>
        <p style={{ fontSize: 16, color: "#64748b", maxWidth: 500, margin: "12px auto 0", fontWeight: 500 }}>
          Real feedback from real teams using Fixify every day
        </p>

        {/* Average Rating Badge */}
        {stats.totalReviews > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              marginTop: 24, padding: "12px 24px",
              background: "rgba(255,255,255,0.8)", backdropFilter: "blur(15px)",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
            }}
          >
            <StarDisplay rating={Math.round(stats.averageRating)} size={18} />
            <span style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{stats.averageRating}</span>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>/ 5 from {stats.totalReviews}+ reviews</span>
          </motion.div>
        )}
      </motion.div>

      {/* Reviews Grid */}
      {reviews.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
          gap: 24, maxWidth: 1200, margin: "0 auto"
        }}>
          {reviews.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{
                background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.8)", borderRadius: 20,
                padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
                transition: "0.3s", cursor: "default", position: "relative",
                overflow: "hidden"
              }}
              whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(124,58,237,0.08)" }}
            >
              {/* Quote icon */}
              <Quote size={40} style={{
                position: "absolute", top: 16, right: 16,
                color: "rgba(124,58,237,0.06)"
              }} />

              {/* Stars */}
              <div style={{ marginBottom: 16 }}>
                <StarDisplay rating={review.rating} size={16} />
              </div>

              {/* Review text */}
              <p style={{
                fontSize: 15, color: "#334155", lineHeight: 1.7,
                marginBottom: 20, fontWeight: 500, fontStyle: "italic"
              }}>
                "{review.message}"
              </p>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid rgba(241,245,249,0.8)", paddingTop: 16 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: avatarColors[i % avatarColors.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 14,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)", flexShrink: 0
                }}>
                  {review.avatar ? (
                    <img src={review.avatar} alt={review.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
                  ) : getInitials(review.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{review.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                    {review.role}{review.company ? `, ${review.company}` : ""}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            textAlign: "center", padding: 40,
            background: "rgba(255,255,255,0.5)", borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.8)", maxWidth: 500, margin: "0 auto"
          }}
        >
          <MessageSquarePlus size={40} style={{ color: "#cbd5e1", marginBottom: 12 }} />
          <p style={{ color: "#94a3b8", fontWeight: 600, fontSize: 15 }}>No reviews yet. Be the first to share your experience!</p>
        </motion.div>
      )}

      {/* Write Review CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        style={{ textAlign: "center", marginTop: 50 }}
      >
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "14px 36px", borderRadius: 14,
            background: "#7c3aed", color: "#fff",
            fontWeight: 700, fontSize: 15, border: "none",
            cursor: "pointer", display: "inline-flex",
            alignItems: "center", gap: 8,
            boxShadow: "0 8px 25px rgba(124,58,237,0.25)",
            transition: "0.3s"
          }}
        >
          <MessageSquarePlus size={18} />
          Write a Review
        </button>
      </motion.div>

      <ReviewFormModal isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
};

export default ReviewSection;
