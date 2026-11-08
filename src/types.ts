export type ReactorState = 'IDLE' | 'WAKE_WORD_DETECTED' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';

export type EmotionType =
  | 'Calm'
  | 'Excited'
  | 'Happiness'
  | 'Confusion'
  | 'Frustration'
  | 'Stress'
  | 'Sadness'
  | 'Urgency';

export type WakeSensitivity = 'low' | 'medium' | 'high';
export type LanguageLock = 'auto' | 'English' | 'Telugu' | 'Tanglish' | 'Hindi';

export interface ActionApprovalRequest {
  id: string;
  type: 'ride_booking' | 'system_command' | 'device_control' | 'financial';
  service: 'Rapido' | 'Uber' | 'Ola' | 'RedBus' | 'System';
  title: string;
  vehicleType?: 'Bike' | 'Auto' | 'Cab' | 'Prime' | 'Delivery';
  pickup: string;
  destination: string;
  estimatedFare: string;
  estimatedEta: string;
  spokenPrompt: string;
  status: 'pending' | 'approved' | 'rejected' | 'dispatched';
  timestamp: string;
  driverDetails?: {
    name: string;
    vehicleNumber: string;
    rating: string;
    phone: string;
  };
}

export interface AppAuthSession {
  isAuthorized: boolean;
  ownerName: string;
  authLevel: 'MASTER' | 'GUEST';
  authorizedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  language?: string;
  emotion?: EmotionType;
  sources?: Array<{ title: string; url: string }>;
}

export interface PersonalMemoryItem {
  id: string;
  key: string;
  value: string;
  category: string;
  updated: string;
}

export interface ProjectMemoryItem {
  id: string;
  title: string;
  status: string;
  progress: number;
  details: string;
}

export interface PrivateVaultItem {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  tags: string[];
}

export interface RunningNote {
  id: string;
  title: string;
  content: string;
  category: string;
  language: string;
  timestamp: string;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop';
  status: 'online' | 'offline' | 'standby';
  battery: number;
  lastSync: string;
  ip: string;
  isCurrent: boolean;
}

export interface SystemTelemetry {
  status: string;
  system: string;
  version: string;
  model: string;
  hasApiKey: boolean;
  uptimeSeconds: number;
  memoryUsageMB: number;
  timestamp: string;
}
