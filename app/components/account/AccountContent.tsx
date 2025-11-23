"use client";

import { SecuritySettings } from "./SecuritySettings";
import { EmailManagement } from "./EmailManagement";
import { ConnectedAccounts } from "./ConnectedAccounts";
import { VerificationStatus } from "./VerificationStatus";
import { AccountActions } from "./AccountActions";

export function AccountContent() {
  return (
    <div className="space-y-6">
      {/* Verification Status - Top Priority */}
      <VerificationStatus />
      
      {/* Security Settings */}
      <SecuritySettings />
      
      {/* Email Management */}
      <EmailManagement />
      
      {/* Connected Accounts */}
      <ConnectedAccounts />
      
      {/* Account Actions - Bottom */}
      <AccountActions />
    </div>
  );
}
