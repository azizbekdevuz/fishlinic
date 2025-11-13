/**
 * Environment Variable Types
 * Type-safe environment variable access
 */

/**
 * OAuth Configuration from environment
 */
export interface OAuthConfig {
  google: {
    clientId: string;
    clientSecret: string;
  };
  kakao: {
    clientId: string;
    clientSecret: string;
  };
}

/**
 * Application Environment Configuration
 * All environment variables used in the application
 */
export interface AppEnvironment {
  // NextAuth
  nextAuthUrl: string;
  nextAuthSecret: string;
  
  // OAuth
  oauth: OAuthConfig;
  
  // API URLs
  wsUrl: string;
  camUrl: string | undefined;
  
  // Ollama (for AI Assistant)
  ollamaUrl: string;
  assistantModel: string;
  
  // Database
  databaseUrl: string;
  
  // Node Environment
  nodeEnv: "development" | "production" | "test";
}

/**
 * Get OAuth configuration from environment variables
 * Validates that required variables are present
 */
export function getOAuthConfig(): OAuthConfig {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const kakaoClientId = process.env.KAKAO_CLIENT_ID;
  const kakaoClientSecret = process.env.KAKAO_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    console.warn("Google OAuth credentials not configured. Google sign-in will not work.");
  }

  if (!kakaoClientId || !kakaoClientSecret) {
    console.warn("Kakao OAuth credentials not configured. Kakao sign-in will not work.");
  }

  return {
    google: {
      clientId: googleClientId || "",
      clientSecret: googleClientSecret || "",
    },
    kakao: {
      clientId: kakaoClientId || "",
      clientSecret: kakaoClientSecret || "",
    },
  };
}

/**
 * Check if OAuth providers are properly configured
 */
export function isOAuthConfigured(): {
  google: boolean;
  kakao: boolean;
} {
  return {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    kakao: !!(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET),
  };
}

/**
 * Get application environment configuration
 * Provides type-safe access to all environment variables
 */
export function getAppEnvironment(): AppEnvironment {
  const nodeEnv = (process.env.NODE_ENV || "development") as "development" | "production" | "test";
  
  return {
    nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
    nextAuthSecret: process.env.NEXTAUTH_SECRET || "",
    oauth: getOAuthConfig(),
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000",
    camUrl: process.env.NEXT_PUBLIC_CAM_URL,
    ollamaUrl: process.env.OLLAMA_URL || "http://localhost:11434",
    assistantModel: process.env.ASSISTANT_MODEL || "qwen2.5:3b",
    databaseUrl: process.env.DATABASE_URL || "",
    nodeEnv,
  };
}

/**
 * Validate critical environment variables
 * Throws error if required variables are missing in production
 */
export function validateEnvironment(): void {
  const env = getAppEnvironment();
  const isProduction = env.nodeEnv === "production";
  
  const errors: string[] = [];
  
  if (isProduction) {
    if (!env.nextAuthSecret) {
      errors.push("NEXTAUTH_SECRET is required in production");
    }
    if (!env.databaseUrl) {
      errors.push("DATABASE_URL is required in production");
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join("\n")}`);
  }
}
