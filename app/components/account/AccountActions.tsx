"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import { useRouter } from "next/navigation";
import { 
  Download, 
  Trash2, 
  AlertTriangle,
  FileText,
  Database,
  Shield
} from "lucide-react";

export function AccountActions() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/user/export', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `account-data-${user?.email}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.show("success", "Account data exported successfully!", 3000);
    } catch (error) {
      console.error('Data export error:', error);
      toast.show("error", "Failed to export data. Please try again.", 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.show("error", "Please type DELETE to confirm account deletion", 3000);
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast.show("success", "Account deleted successfully. You will be signed out.", 3000);
      
      // Sign out and redirect after a short delay
      setTimeout(async () => {
        await signOut();
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.show("error", "Failed to delete account. Please try again.", 3000);
      setIsDeleting(false);
    }
  };

  return (
    <div className="card-glass p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6" style={{ color: "rgb(var(--text-primary))" }} />
        <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Account Actions
        </h2>
      </div>

      <div className="space-y-6">
        {/* Data Export */}
        <div>
          <h3 className="text-lg font-medium mb-3" style={{ color: "rgb(var(--text-primary))" }}>
            Export Account Data
          </h3>
          
          <div className="p-4 rounded-lg border border-white/10 bg-white/5">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 mt-0.5" style={{ color: "rgb(var(--text-primary))" }} />
              <div className="flex-1">
                <p className="text-sm mb-3" style={{ color: "rgb(var(--text-primary))" }}>
                  Download a copy of all your account data including profile information, telemetry data, and settings.
                </p>
                <div className="text-xs mb-3" style={{ color: "rgb(var(--text-muted))" }}>
                  <strong>Includes:</strong> Profile data, telemetry readings, alert settings, connected accounts, and activity history
                </div>
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="btn btn-sm btn-primary flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Deletion */}
        <div>
          <h3 className="text-lg font-medium mb-3 text-red-400">
            Delete Account
          </h3>
          
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm mb-3 text-red-300">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <div className="text-xs mb-4 text-red-200">
                  <strong>This will delete:</strong> Your profile, all telemetry data, settings, connected accounts, and activity history
                </div>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn btn-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-300">Confirm Account Deletion</span>
                      </div>
                      <p className="text-xs text-red-200 mb-3">
                        Type <strong>DELETE</strong> to confirm that you want to permanently delete your account.
                      </p>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="w-full px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300 placeholder-red-400/70"
                        disabled={isDeleting}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || deleteConfirmText !== "DELETE"}
                        className={`btn btn-sm flex items-center gap-2 ${
                          isDeleting || deleteConfirmText !== "DELETE"
                            ? "bg-red-500/10 text-red-400/50 cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        {isDeleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Delete Forever
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText("");
                        }}
                        disabled={isDeleting}
                        className="btn btn-sm btn-ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* GDPR Compliance Notice */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <h4 className="text-sm font-medium text-blue-400 mb-2">Data Rights & Privacy</h4>
          <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
            You have the right to access, export, and delete your personal data at any time. 
            We comply with GDPR and other privacy regulations to protect your information.
          </p>
        </div>
      </div>
    </div>
  );
}
