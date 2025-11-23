"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import { signIn } from "next-auth/react";
import { 
  Link as LinkIcon, 
  Unlink, 
  CheckCircle, 
  Plus,
  AlertTriangle
} from "lucide-react";

type ConnectedAccount = {
  id: string;
  provider: "google" | "kakao";
  name: string;
  email?: string;
  connectedAt: string;
  isConnected: boolean;
};

export function ConnectedAccounts() {
  const { user } = useAuth();
  const toast = useToast();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);

  // Mock connected accounts data - in production, this would come from the database
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    {
      id: "google",
      provider: "google",
      name: "Google",
      email: user?.email?.includes("gmail") ? user.email : undefined,
      connectedAt: new Date().toISOString(),
      isConnected: user?.email?.includes("gmail") || false
    },
    {
      id: "kakao",
      provider: "kakao",
      name: "Kakao",
      connectedAt: new Date().toISOString(),
      isConnected: false
    }
  ]);

  const handleConnect = async (provider: string) => {
    setIsConnecting(provider);
    
    try {
      // Use NextAuth signIn to connect the account
      const result = await signIn(provider, { 
        redirect: false,
        callbackUrl: "/account"
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Update the connected accounts state
      setConnectedAccounts(prev => 
        prev.map(account => 
          account.provider === provider 
            ? { ...account, isConnected: true, connectedAt: new Date().toISOString() }
            : account
        )
      );

      toast.show("success", `${provider} account connected successfully!`, 3000);
    } catch (error) {
      console.error(`${provider} connection error:`, error);
      toast.show("error", `Failed to connect ${provider} account. Please try again.`, 3000);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (provider: string) => {
    // Check if this is the only authentication method
    const connectedCount = connectedAccounts.filter(acc => acc.isConnected).length;
    const hasPassword = user?.email && !user.email.includes("oauth"); // Simple check

    if (connectedCount === 1 && !hasPassword) {
      toast.show("error", "Cannot disconnect your only authentication method. Please set a password first.", 5000);
      return;
    }

    setIsDisconnecting(provider);
    
    try {
      const response = await fetch(`/api/user/accounts/${provider}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect account');
      }

      // Update the connected accounts state
      setConnectedAccounts(prev => 
        prev.map(account => 
          account.provider === provider 
            ? { ...account, isConnected: false }
            : account
        )
      );

      toast.show("success", `${provider} account disconnected successfully!`, 3000);
    } catch (error) {
      console.error(`${provider} disconnection error:`, error);
      toast.show("error", `Failed to disconnect ${provider} account. Please try again.`, 3000);
    } finally {
      setIsDisconnecting(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "google":
        return (
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
        );
      case "kakao":
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000">
              <path d="M12 3C7.03 3 3 6.14 3 10.1c0 2.52 1.65 4.73 4.1 6.09l-.95 3.51c-.08.3.23.56.5.42l4.28-2.43c.36.02.72.03 1.07.03 4.97 0 9-3.14 9-7.1S16.97 3 12 3z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
            <LinkIcon className="w-4 h-4 text-white" />
          </div>
        );
    }
  };

  return (
    <div className="card-glass p-6">
      <div className="flex items-center gap-3 mb-6">
        <LinkIcon className="w-6 h-6" style={{ color: "rgb(var(--text-primary))" }} />
        <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Connected Accounts
        </h2>
      </div>

      <div className="space-y-4">
        <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
          Connect your social accounts to sign in with multiple methods and sync your profile information.
        </p>

        {/* Connected Accounts List */}
        <div className="space-y-3">
          {connectedAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                {getProviderIcon(account.provider)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                      {account.name}
                    </span>
                    {account.isConnected ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full border border-gray-500/30">
                        <span className="text-xs">Not Connected</span>
                      </div>
                    )}
                  </div>
                  {account.email && (
                    <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                      {account.email}
                    </div>
                  )}
                  {account.isConnected && (
                    <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                      Connected on {new Date(account.connectedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {account.isConnected ? (
                  <button
                    onClick={() => handleDisconnect(account.provider)}
                    disabled={isDisconnecting === account.provider}
                    className="btn btn-sm btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    {isDisconnecting === account.provider ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400"></div>
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Unlink className="w-3 h-3" />
                        Disconnect
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(account.provider)}
                    disabled={isConnecting === account.provider}
                    className="btn btn-sm btn-primary flex items-center gap-2"
                  >
                    {isConnecting === account.provider ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Connect
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-400 mb-1">Security Notice</h4>
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                Make sure you have at least one authentication method (password or connected account) to avoid being locked out of your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
