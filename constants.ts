
import { Platform, Maintenance, Schedule, Part, PlatformStatus, MaintenanceType, ScheduleStatus, PartExchanged } from './types';

export const MOCK_PLATFORMS: Platform[] = [
  { id: 'P001', name: 'Elevador 2T Alpha', code: 'ELV-2023-01', client: 'Oficina do Zé', location: 'Box 1', installDate: '2023-01-15', status: PlatformStatus.OPERATIONAL },
  { id: 'P002', name: 'Rampa Alinhamento Pro', code: 'RMP-2022-45', client: 'AutoCenter Prime', location: 'Setor B', installDate: '2022-11-20', status: PlatformStatus.OPERATIONAL },
  { id: 'P003', name: 'Elevador Hidráulico X', code: 'ELV-H-99', client: 'Mecânica Rápida', location: 'Box 4', installDate: '2021-05-10', status: PlatformStatus.NON_OPERATIONAL },
  { id: 'P004', name: 'Balanceadora Digital', code: 'BAL-D-05', client: 'Pneus & Cia', location: 'Loja 2', installDate: '2023-08-01', status: PlatformStatus.NON_OPERATIONAL },
  { id: 'P005', name: 'Elevador 4T Heavy', code: 'ELV-4000', client: 'Transportadora Silva', location: 'Galpão 1', installDate: '2024-01-10', status: PlatformStatus.OPERATIONAL },
];

export const MOCK_MAINTENANCE: Maintenance[] = [
  { id: 'M001', platformId: 'P001', executionDate: '2024-02-10', type: MaintenanceType.PREVENTIVE, technician: 'Carlos Souza', description: 'Troca de óleo e revisão de cabos', cost: 450.00 },
  { id: 'M002', platformId: 'P003', executionDate: '2024-05-15', type: MaintenanceType.CORRECTIVE, technician: 'Ana Lima', description: 'Substituição de vedação hidráulica vazando. Foi necessário desmontar o pistão central.', cost: 1200.00 },
  { id: 'M003', platformId: 'P002', executionDate: '2024-04-20', type: MaintenanceType.PREVENTIVE, technician: 'Carlos Souza', description: 'Calibração de sensores', cost: 300.00 },
  { id: 'M004', platformId: 'P005', executionDate: '2024-05-01', type: MaintenanceType.EMERGENCY, technician: 'Roberto Dias', description: 'Travamento do motor principal', cost: 2500.00 },
  { id: 'M005', platformId: 'P001', executionDate: '2023-11-10', type: MaintenanceType.PREVENTIVE, technician: 'Carlos Souza', description: 'Lubrificação geral', cost: 200.00 },
];

export const MOCK_SCHEDULES: Schedule[] = [
  { id: 'S001', platformId: 'P001', date: '2024-06-15', type: MaintenanceType.PREVENTIVE, status: ScheduleStatus.PENDING, observations: 'Revisão trimestral', operationalState: 'Ativa' },
  { id: 'S002', platformId: 'P002', date: '2024-06-18', type: MaintenanceType.PREVENTIVE, status: ScheduleStatus.PENDING, observations: 'Verificar alinhamento', operationalState: 'Ativa' },
  { id: 'S003', platformId: 'P003', date: '2024-06-10', type: MaintenanceType.CORRECTIVE, status: ScheduleStatus.DELAYED, observations: 'Aguardando peça', operationalState: 'Não Ativa' },
  { id: 'S004', platformId: 'P005', date: '2024-07-01', type: MaintenanceType.PREVENTIVE, status: ScheduleStatus.PENDING, observations: 'Troca de filtros', operationalState: 'Ativa' },
];

export const MOCK_PARTS: Part[] = [
  { id: 'PT001', name: 'Óleo Hidráulico ISO 68', code: 'OIL-68', manufacturer: 'LubriTech', stock: 50, minStock: 20 },
  { id: 'PT002', name: 'Cabo de Aço 10mm', code: 'CAB-10', manufacturer: 'SteelCo', stock: 15, minStock: 30 },
  { id: 'PT003', name: 'Sensor de Nível', code: 'SENS-L2', manufacturer: 'Eletronix', stock: 5, minStock: 5 },
  { id: 'PT004', name: 'Kit Vedação O-Ring', code: 'ORING-K1', manufacturer: 'SealMaster', stock: 8, minStock: 10 },
  { id: 'PT005', name: 'Filtro de Ar', code: 'FIL-AIR', manufacturer: 'CleanAir', stock: 100, minStock: 25 },
];

export const MOCK_PARTS_EXCHANGED: PartExchanged[] = [
  { id: 'PE001', maintenanceId: 'M001', partId: 'PT001', quantity: 5, observation: 'Troca completa' },
  { id: 'PE002', maintenanceId: 'M002', partId: 'PT004', quantity: 1, observation: 'Kit reparo' },
  { id: 'PE003', maintenanceId: 'M002', partId: 'PT001', quantity: 2, observation: 'Reposição nível' },
  { id: 'PE004', maintenanceId: 'M004', partId: 'PT002', quantity: 2, observation: 'Cabos rompidos' },
];
