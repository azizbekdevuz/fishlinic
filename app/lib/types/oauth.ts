/**
 * OAuth Provider Types
 * Type definitions for OAuth providers (Google, Kakao, etc.)
 */

/**
 * Kakao OAuth Profile Structure
 * Based on Kakao API v2 user/me endpoint
 */
export interface KakaoProfile {
  id: number;
  connected_at?: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile_nickname_needs_agreement?: boolean;
    profile_image_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image?: boolean;
    };
    has_email?: boolean;
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    email?: string;
    has_age_range?: boolean;
    age_range_needs_agreement?: boolean;
    age_range?: string;
    has_birthday?: boolean;
    birthday_needs_agreement?: boolean;
    birthday?: string;
    birthday_type?: string;
    has_gender?: boolean;
    gender_needs_agreement?: boolean;
    gender?: string;
  };
}

/**
 * Normalized user profile from OAuth providers
 * Used internally by NextAuth
 */
export interface OAuthUserProfile {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

/**
 * OAuth Account Information
 * From NextAuth account object
 */
export interface OAuthAccount {
  provider: string;
  type: string;
  providerAccountId: string;
  access_token?: string;
  expires_at?: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
  session_state?: string;
}

/**
 * OAuth Provider Configuration
 * Base structure for custom OAuth providers
 */
export interface OAuthProviderConfig {
  id: string;
  name: string;
  type: "oauth";
  authorization: {
    url: string;
    params: Record<string, string>;
  };
  token: string;
  userinfo: string;
  clientId: string;
  clientSecret: string;
  profile: (profile: unknown) => OAuthUserProfile;
}

