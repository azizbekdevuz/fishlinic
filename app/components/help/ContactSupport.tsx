"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import { 
  MessageCircle, 
  Mail, 
  Send, 
  Clock,
  CheckCircle,
  Github
} from "lucide-react";

export function ContactSupport() {
  const { user } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "normal" as "low" | "normal" | "high"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.show("error", "Please fill in all required fields", 3000);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userEmail: user?.email,
          userName: user?.name
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast.show("success", "Support request sent successfully! We'll get back to you soon.", 5000);
      setFormData({ subject: "", message: "", priority: "normal" });
    } catch (error) {
      console.error('Contact support error:', error);
      toast.show("error", "Failed to send message. Please try again or use email.", 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="card-glass p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6" style={{ color: "rgb(var(--text-primary))" }} />
        <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Contact Support
        </h2>
      </div>

      {/* Contact Methods */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
          <Mail className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
              Email Support
            </div>
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              support@smartaquaculture.com
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
          <Github className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
              GitHub Issues
            </div>
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              Report bugs or request features
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
          <Clock className="w-5 h-5 text-green-400" />
          <div>
            <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
              Response Time
            </div>
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              Usually within 24 hours
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
            Subject *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
            placeholder="Brief description of your issue"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
            style={{ color: "rgb(var(--text-primary))" }}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange("priority", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
            style={{ color: "rgb(var(--text-primary))" }}
            disabled={isSubmitting}
          >
            <option value="low">Low - General question</option>
            <option value="normal">Normal - Need help</option>
            <option value="high">High - System not working</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
            Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            placeholder="Describe your issue in detail. Include any error messages, steps you've tried, and your browser/device information."
            rows={6}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm resize-none"
            style={{ color: "rgb(var(--text-primary))" }}
            disabled={isSubmitting}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.subject.trim() || !formData.message.trim()}
          className={`w-full btn btn-sm flex items-center justify-center gap-2 ${
            isSubmitting || !formData.subject.trim() || !formData.message.trim()
              ? "btn-ghost opacity-50 cursor-not-allowed"
              : "btn-primary"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Message
            </>
          )}
        </button>
      </form>

      {/* User Info */}
      {user && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs" style={{ color: "rgb(var(--text-muted))" }}>
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Signed in as {user.email}</span>
          </div>
        </div>
      )}
    </div>
  );
}
