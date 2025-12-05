/**
 * JWT 토큰 디코딩 유틸리티
 * JWT 토큰은 Base64로 인코딩되어 있으므로 디코딩하여 payload를 추출할 수 있습니다.
 */

interface JWTPayload {
  user_id?: string;
  userId?: string;
  sub?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * JWT 토큰을 디코딩하여 payload를 반환합니다.
 * @param token JWT 토큰 문자열
 * @returns 디코딩된 payload 또는 null
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // JWT는 header.payload.signature 형식
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("[decodeJWT] Invalid JWT token format");
      return null;
    }

    // payload 부분 디코딩 (Base64 URL-safe)
    const payload = parts[1];
    
    // Base64 URL-safe 디코딩
    // React Native에서는 atob와 Buffer가 없을 수 있으므로 직접 디코딩
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    
    // Base64 디코딩 (React Native 호환)
    let decoded: string;
    try {
      // Node.js 환경 (테스트 등)
      if (typeof Buffer !== "undefined") {
        decoded = Buffer.from(padded, "base64").toString("utf-8");
      } else if (typeof atob !== "undefined") {
        // 브라우저 환경
        decoded = atob(padded);
      } else {
        // React Native 환경: 직접 Base64 디코딩
        // Base64 문자를 바이너리로 변환
        const binaryString = padded.split("").map((char) => {
          const index = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(char);
          return index >= 0 ? index : 0;
        });
        
        // 바이너리를 UTF-8 문자열로 변환
        let result = "";
        for (let i = 0; i < binaryString.length; i += 4) {
          const byte1 = (binaryString[i] << 2) | (binaryString[i + 1] >> 4);
          const byte2 = ((binaryString[i + 1] & 15) << 4) | (binaryString[i + 2] >> 2);
          const byte3 = ((binaryString[i + 2] & 3) << 6) | binaryString[i + 3];
          
          if (binaryString[i + 2] !== 64) result += String.fromCharCode(byte1, byte2, byte3);
          else if (binaryString[i + 1] !== 64) result += String.fromCharCode(byte1, byte2);
          else result += String.fromCharCode(byte1);
        }
        decoded = result;
      }
    } catch (e) {
      // 간단한 Base64 디코딩 시도 (React Native용)
      // @ts-ignore - React Native에서 사용 가능한 경우
      if (global.btoa && global.atob) {
        // @ts-ignore
        decoded = global.atob(padded);
      } else {
        throw new Error("Base64 decoding not supported in this environment");
      }
    }
    
    const parsed = JSON.parse(decoded);
    
    return parsed;
  } catch (error) {
    console.error("[decodeJWT] Failed to decode JWT token:", error);
    return null;
  }
};

/**
 * JWT 토큰에서 user_id를 추출합니다.
 * @param token JWT 토큰 문자열
 * @returns user_id 또는 null
 */
export const getUserIdFromToken = (token: string): string | null => {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  // 다양한 필드명 시도 (user_id, userId, sub 등)
  return payload.user_id || payload.userId || payload.sub || null;
};

/**
 * JWT 토큰이 만료되었는지 확인합니다.
 * @param token JWT 토큰 문자열
 * @returns 만료 여부 (true: 만료됨, false: 유효함, null: 확인 불가)
 */
export const isTokenExpired = (token: string): boolean | null => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  // exp는 Unix timestamp (초 단위)
  const expirationTime = payload.exp * 1000; // 밀리초로 변환
  const currentTime = Date.now();

  return currentTime >= expirationTime;
};

