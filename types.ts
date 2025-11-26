
export enum PlatformStatus {
  OPERATIONAL = 'Ativa',
  NON_OPERATIONAL = 'Não Ativa'
}

export enum MaintenanceType {
  PREVENTIVE = 'Preventiva',
  PREDICTIVE = 'Preditiva',
  CORRECTIVE = 'Corretiva',
  EMERGENCY = 'Emergencial'
}

export enum ScheduleStatus {
  PENDING = 'Pendente',
  COMPLETED = 'Concluido',
  CANCELED = 'Cancelado',
  DELAYED = 'Atrasado'
}

export enum UserRole {
  MANAGER = 'GESTOR',
  TECHNICIAN = 'TECNICO'
}

export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string; // Optional for display, required for auth logic
  role: UserRole;
}

export interface Platform {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  installDate: string;
  status: PlatformStatus;
}

export interface Maintenance {
  id: string;
  platformId: string;
  executionDate: string;
  type: MaintenanceType;
  technician: string;
  description: string;
  cost: number;
}

export interface Schedule {
  id: string;
  platformId: string;
  date: string;
  type: MaintenanceType;
  status: ScheduleStatus;
  observations: string;
  operationalState?: 'Ativa' | 'Não Ativa'; // Updated field
}

export interface Part {
  id: string;
  name: string;
  code: string;
  manufacturer: string;
  stock: number;
  minStock: number;
}

export interface PartExchanged {
  id: string;
  maintenanceId: string;
  partId: string;
  quantity: number;
  observation?: string;
}

export interface DatabaseSchema {
  users: User[];
  platforms: Platform[];
  maintenances: Maintenance[];
  schedules: Schedule[];
  parts: Part[];
  partsExchanged: PartExchanged[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PLATFORMS = 'PLATFORMS',
  SCHEDULES = 'SCHEDULES',
  MAINTENANCE = 'MAINTENANCE',
  INVENTORY = 'INVENTORY',
  SETTINGS = 'SETTINGS'
}
