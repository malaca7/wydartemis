export type ServerStatusType = 'online' | 'maintenance' | 'offline' | 'unconnected';

export interface ServerStatusInfo {
  status: ServerStatusType;
  label: string;
  onlinePlayers?: number;
  maxPlayers?: number;
  serverVersion: string;
  isDemonstrative: boolean;
}

export interface NavItem {
  name: string;
  href: string;
  badge?: string;
  isConfigured?: boolean;
}

export interface PendingFeatureDetail {
  title: string;
  featureName: string;
  description: string;
  type?: 'download' | 'auth' | 'shop' | 'external' | 'general';
}
