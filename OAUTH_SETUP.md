# OAuth Provider Setup Guide

## Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Kakao OAuth
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to `.env.local`

## Kakao OAuth Setup

1. Go to [Kakao Developers](https://developers.kakao.com/)
2. Create an application
3. Go to "앱 설정" (App Settings) → "플랫폼" (Platform)
4. Add platform:
   - Web: `http://localhost:3000` (development)
   - Web: `https://yourdomain.com` (production)
5. Go to "제품 설정" (Product Settings) → "카카오 로그인" (Kakao Login)
6. Enable "카카오 로그인" (Kakao Login)
7. Set Redirect URI:
   - `http://localhost:3000/api/auth/callback/kakao` (development)
   - `https://yourdomain.com/api/auth/callback/kakao` (production)
8. Go to "앱 키" (App Keys) and copy:
   - REST API 키 → Use as `KAKAO_CLIENT_ID`
   - Client Secret → Use as `KAKAO_CLIENT_SECRET`
9. In "카카오 로그인" settings, enable:
   - "이메일" (Email)
   - "닉네임" (Nickname)
   - "프로필 사진" (Profile Picture)

## Features

- ✅ Google OAuth integration
- ✅ Kakao OAuth integration
- ✅ Email/Password authentication (existing)
- ✅ Automatic account linking (same email = same account)
- ✅ User creation for OAuth users
- ✅ Works with existing verification system
- ✅ Bearer token generation for OAuth users

## How It Works

1. User clicks "Sign in with Google" or "Sign in with Kakao"
2. Redirects to OAuth provider
3. User authorizes
4. NextAuth handles callback
5. `signIn` callback:
   - Checks if user exists (by email)
   - If exists: Links OAuth account to existing user
   - If not: Creates new user
6. User is signed in with same session structure as credentials

## Notes

- OAuth users don't need passwords (password field is empty)
- Same email = same account (accounts are linked automatically)
- Verification status is preserved for OAuth users
- All existing features work with OAuth users

