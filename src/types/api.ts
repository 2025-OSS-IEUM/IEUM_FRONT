export type DisabilityType = "none" | "blind" | "low_vision" | "hearing" | "mobility" | "cognitive" | "other";

export interface CheckAvailabilityResponse {
  available: boolean;
  message?: string | null;
}

export interface ConsentCreate {
  terms: boolean;
  privacy: boolean;
}

export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface InputPathPoint {
  lat: number;
  lon: number;
}

export interface InputRoute {
  distance: number;
  duration: number;
  path: InputPathPoint[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserInLoginResponse {
  userId: string;
  username: string;
  name?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  token_type: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInLoginResponse;
}

export interface PasswordResetConfirmRequest {
  username: string;
  code: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface PasswordResetConfirmResponse {
  message?: string;
}

export interface PasswordResetRequest {
  username: string;
}

export interface PasswordResetResponse {
  expiresIn: number;
}

export type ReportType = "sidewalk_damage" | "construction" | "missing_crosswalk" | "no_tactile" | "etc";

export type SeverityLevel = "low" | "medium" | "high";
export type ReportStatus = "pending_review" | "approved" | "resolved";

export interface ReportCreate {
  type: ReportType;
  description: string;
  location: GeoJSONPoint;
  photoUrls?: string[] | null;
  detectedAt?: string | null;
  severity?: SeverityLevel;
  status?: ReportStatus;
}

export interface ReportResponse {
  type: ReportType;
  description: string;
  location: GeoJSONPoint;
  photoUrls?: string[] | null;
  detectedAt?: string | null;
  severity: SeverityLevel;
  status: ReportStatus;
  id: string;
  createdAt: string;
}

export interface RerouteRequest {
  current_lat: number;
  current_lon: number;
  dest_lat: number;
  dest_lon: number;
}

export interface RoutePoint {
  lat: number;
  lon: number;
}

export interface RouteOption {
  distance: number;
  duration: number;
  path: RoutePoint[];
}

export interface RouteRequest {
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  alternatives?: boolean | null;
}

export interface RouteResponse {
  routes: RouteOption[];
}

export interface SafeRouteSegment {
  lat: number;
  lon: number;
  riskScore?: number | null;
}

export interface SafeRouteOption {
  distance: number;
  duration: number;
  safetyScore: number;
  path: SafeRouteSegment[];
}

export interface SafeRouteRequest {
  routes: InputRoute[];
}

export interface SafeRouteResponse {
  routes: SafeRouteOption[];
  bestRouteIndex: number;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  name?: string | null;
  phone?: string;
  disabilityType: DisabilityType;
  consent: ConsentCreate;
}

export interface UserInDB {
  username: string;
  email: string;
  hashed_password: string;
  name?: string | null;
  disabilityType: DisabilityType;
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

export interface UsernameLookupRequest {
  email: string;
}

export interface UsernameLookupResponse {
  username: string;
}
