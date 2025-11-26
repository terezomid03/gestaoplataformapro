
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { PlatformsView } from './components/PlatformsView';
import { InventoryView } from './components/InventoryView';
import { MaintenanceView } from './components/MaintenanceView';
import { SchedulesView } from './components/SchedulesView';
import { LoginView } from './components/LoginView';
import { SettingsView } from './components/SettingsView';
import { ViewState, Platform, Part, Schedule, Maintenance, PartExchanged, User, UserRole, PlatformStatus } from './types';
import { Menu, Loader2 } from 'lucide-react';
import { storageService } from './services/storage';
import { firebaseService } from './services/firebaseService';

// --- CONFIGURATION ---
const USE_FIREBASE = true; // Enabled for production

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewState>(ViewState.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [platformFilterStatus, setPlatformFilterStatus] = useState<string | null>(null);
  const [scheduleFilterStatus, setScheduleFilterStatus] = useState<string | null>(null);
  const [inventoryLowStockFilter, setInventoryLowStockFilter] = useState(false);
  
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [partsExchanged, setPartsExchanged] = useState<PartExchanged[]>([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (USE_FIREBASE) {
        await firebaseService.init();
        const data = await firebaseService.getAllData();
        setUsers(data.users || []);
        setPlatforms(data.platforms);
        setParts(data.parts);
        setMaintenances(data.maintenances);
        setSchedules(data.schedules);
        setPartsExchanged(data.partsExchanged);
      } else {
        const data = storageService.init();
        // Mock users for local dev if not in DB schema
        setUsers([
            { name: 'Administrador', email: 'admin@admin.com', password: '123456', role: UserRole.MANAGER },
            { name: 'Técnico', email: 'tec@tec.com', password: '123456', role: UserRole.TECHNICIAN }
        ]);
        setPlatforms(data.platforms);
        setParts(data.parts);
        setMaintenances(data.maintenances);
        setSchedules(data.schedules);
        setPartsExchanged(data.partsExchanged);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveView(ViewState.DASHBOARD);
  };

  const handleRegister = async (newUser: User) => {
      if (USE_FIREBASE) {
          try {
            const registeredUser = await firebaseService.registerUser(newUser);
            const updatedUsers = [...users, registeredUser as User];
            setUsers(updatedUsers);
            setCurrentUser(registeredUser as User);
            setIsAuthenticated(true);
            setActiveView(ViewState.DASHBOARD);
          } catch (error) {
            console.error("Registration failed:", error);
            throw error; 
          }
      } else {
          const userWithId = { ...newUser, id: `user-${Date.now()}` };
          const updatedUsers = [...users, userWithId];
          setUsers(updatedUsers);
          setCurrentUser(userWithId);
          setIsAuthenticated(true);
          setActiveView(ViewState.DASHBOARD);
      }
  };

  const handleUpdateUser = async (updatedUser: User) => {
      setCurrentUser(updatedUser);
      const updatedList = users.map(u => u.email === updatedUser.email ? updatedUser : u);
      setUsers(updatedList);
      if (USE_FIREBASE && updatedUser.id) {
          await firebaseService.update('users', updatedUser.id, updatedUser);
      } 
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // --- CRUD HANDLERS ---

  const handleAddPlatform = async (newPlatform: Platform) => {
    const updated = [...platforms, newPlatform];
    setPlatforms(updated);
    if (USE_FIREBASE) {
       await firebaseService.add('platforms', newPlatform);
    } else {
       storageService.save({ platforms: updated });
    }
  };

  const handleUpdatePlatform = async (updatedPlatform: Platform) => {
      const updated = platforms.map(p => p.id === updatedPlatform.id ? updatedPlatform : p);
      setPlatforms(updated);
      if (USE_FIREBASE) {
          await firebaseService.update('platforms', updatedPlatform.id, updatedPlatform);
      } else {
          storageService.save({ platforms: updated });
      }
  };

  const handleDeletePlatform = async (id: string) => {
    const previousPlatforms = [...platforms];
    setPlatforms(prev => prev.filter(p => p.id !== id));

    try {
      if (USE_FIREBASE) {
        await firebaseService.delete('platforms', id);
      } else {
        storageService.save({ platforms: previousPlatforms.filter(p => p.id !== id) });
      }
    } catch (error) {
      console.error("Failed to delete platform", error);
      setPlatforms(previousPlatforms);
      alert("Erro ao excluir plataforma. Tente novamente.");
    }
  };

  // Sync Helper: Updates platform status based on schedule condition
  const syncPlatformStatus = async (platformId: string, operationalState: string) => {
      const platform = platforms.find(p => p.id === platformId);
      if (platform) {
          // Map 'Ativa' -> OPERATIONAL, 'Não Ativa' -> NON_OPERATIONAL
          const newStatus = operationalState === 'Ativa' 
              ? PlatformStatus.OPERATIONAL 
              : PlatformStatus.NON_OPERATIONAL;
          
          if (platform.status !== newStatus) {
              const updatedPlatform = { ...platform, status: newStatus };
              await handleUpdatePlatform(updatedPlatform);
          }
      }
  };

  const handleAddSchedule = async (newSchedule: Schedule) => {
    const updated = [...schedules, newSchedule];
    setSchedules(updated);
    
    // Sync Platform Status
    if (newSchedule.operationalState) {
        await syncPlatformStatus(newSchedule.platformId, newSchedule.operationalState);
    }

    if (USE_FIREBASE) {
        await firebaseService.add('schedules', newSchedule);
    } else {
        storageService.save({ schedules: updated });
    }
  };

  const handleUpdateSchedule = async (updatedSchedule: Schedule) => {
      const updated = schedules.map(s => s.id === updatedSchedule.id ? updatedSchedule : s);
      setSchedules(updated);

      // Sync Platform Status
      if (updatedSchedule.operationalState) {
          await syncPlatformStatus(updatedSchedule.platformId, updatedSchedule.operationalState);
      }

      if (USE_FIREBASE) {
          await firebaseService.update('schedules', updatedSchedule.id, updatedSchedule);
      } else {
          storageService.save({ schedules: updated });
      }
  };

  const handleDeleteSchedule = async (id: string) => {
      const previousSchedules = [...schedules];
      setSchedules(prev => prev.filter(s => s.id !== id));

      try {
          if (USE_FIREBASE) {
              await firebaseService.delete('schedules', id);
          } else {
              storageService.save({ schedules: previousSchedules.filter(s => s.id !== id) });
          }
      } catch (error) {
          console.error("Failed to delete schedule", error);
          setSchedules(previousSchedules);
          alert("Erro ao excluir agendamento.");
      }
  };

  const handleAddPart = async (newPart: Part) => {
    const updated = [...parts, newPart];
    setParts(updated);
    if (USE_FIREBASE) {
        await firebaseService.add('parts', newPart);
    } else {
        storageService.save({ parts: updated });
    }
  };

  const handleUpdatePart = async (updatedPart: Part) => {
      const updated = parts.map(p => p.id === updatedPart.id ? updatedPart : p);
      setParts(updated);
      if (USE_FIREBASE) {
          await firebaseService.update('parts', updatedPart.id, updatedPart);
      } else {
          storageService.save({ parts: updated });
      }
  };

  const handleRegisterMaintenance = async (newMaintenance: Maintenance, partsUsed: { partId: string, quantity: number }[]) => {
      setMaintenances(prev => [...prev, newMaintenance]);

      const newExchanges: PartExchanged[] = partsUsed.map(p => ({
          id: `PE${Date.now()}-${p.partId}`,
          maintenanceId: newMaintenance.id,
          partId: p.partId,
          quantity: p.quantity,
          observation: 'Manutenção Registrada'
      }));
      setPartsExchanged(prev => [...prev, ...newExchanges]);

      const updatedParts = parts.map(part => {
          const used = partsUsed.find(u => u.partId === part.id);
          if (used) {
              return { ...part, stock: Math.max(0, Number(part.stock) - Number(used.quantity)) };
          }
          return part;
      });
      setParts(updatedParts);

      if (USE_FIREBASE) {
          // Important: Pass the full maintenance object including ID to ensure DB consistency
          await firebaseService.registerMaintenance(newMaintenance, partsUsed, parts);
      } else {
          storageService.save({ 
              maintenances: [...maintenances, newMaintenance],
              parts: updatedParts,
              partsExchanged: [...partsExchanged, ...newExchanges]
          });
      }
  };

  const handleUpdateMaintenance = async (updatedMaintenance: Maintenance, currentPartsUsed: { partId: string, quantity: number }[]) => {
      // Logic for reconciling stock during update (simplified for brevity)
      setMaintenances(prev => prev.map(m => m.id === updatedMaintenance.id ? updatedMaintenance : m));
      
      if (USE_FIREBASE) {
          await firebaseService.update('maintenances', updatedMaintenance.id, updatedMaintenance);
      } else {
          storageService.save({
              maintenances: maintenances.map(m => m.id === updatedMaintenance.id ? updatedMaintenance : m)
          });
      }
  };

  const handleDeleteMaintenance = async (id: string) => {
      const previousMaintenances = [...maintenances];
      const previousExchanges = [...partsExchanged];

      // Optimistic UI
      setMaintenances(prev => prev.filter(m => m.id !== id));
      setPartsExchanged(prev => prev.filter(pe => pe.maintenanceId !== id));

      try {
          if (USE_FIREBASE) {
              await firebaseService.deleteMaintenance(id);
          } else {
              storageService.save({ 
                  maintenances: previousMaintenances.filter(m => m.id !== id),
                  partsExchanged: previousExchanges.filter(pe => pe.maintenanceId !== id)
              });
          }
      } catch (error) {
          console.error("Failed to delete maintenance", error);
          setMaintenances(previousMaintenances);
          setPartsExchanged(previousExchanges);
          alert("Erro ao excluir manutenção.");
      }
  };

  const handleDashboardNavigate = (view: ViewState, filterContext?: string) => {
      setActiveView(view);
      setPlatformFilterStatus(null);
      setScheduleFilterStatus(null);
      setInventoryLowStockFilter(false);

      if (view === ViewState.PLATFORMS && filterContext) setPlatformFilterStatus(filterContext);
      if (view === ViewState.SCHEDULES && filterContext) setScheduleFilterStatus(filterContext);
      if (view === ViewState.INVENTORY && filterContext === 'LOW_STOCK') setInventoryLowStockFilter(true);
  };

  const handleViewHistory = (platformId: string) => {
      setSelectedPlatformId(platformId);
      setActiveView(ViewState.MAINTENANCE);
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} onRegister={handleRegister} users={users} />;
  }

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 text-blue-600">
              <div className="text-center">
                  <Loader2 size={48} className="animate-spin mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Carregando Sistema...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 p-4 flex justify-between items-center shadow-lg">
          <h1 className="font-bold text-lg">GestPlataform<span className="text-blue-400">Pro</span></h1>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu /></button>
      </div>

      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block fixed inset-0 z-40 md:relative md:inset-auto md:w-64 transition-all`}>
        <Sidebar 
            activeView={activeView} 
            setActiveView={(view) => { setActiveView(view); setMobileMenuOpen(false); }} 
            user={currentUser}
            onLogout={handleLogout}
        />
        {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}
      </div>

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {activeView === ViewState.DASHBOARD && (
            <DashboardView 
                platforms={platforms} 
                maintenances={maintenances} 
                schedules={schedules} 
                parts={parts}
                onNavigate={handleDashboardNavigate}
            />
          )}
          {activeView === ViewState.PLATFORMS && (
            <PlatformsView 
                platforms={platforms} 
                onAddPlatform={handleAddPlatform}
                onUpdatePlatform={handleUpdatePlatform}
                onDeletePlatform={handleDeletePlatform}
                onViewHistory={handleViewHistory}
                filterStatus={platformFilterStatus}
                onClearFilter={() => setPlatformFilterStatus(null)}
                currentUser={currentUser}
            />
          )}
          {activeView === ViewState.SCHEDULES && (
            <SchedulesView 
                schedules={schedules} 
                platforms={platforms}
                onAddSchedule={handleAddSchedule}
                onUpdateSchedule={handleUpdateSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                filterStatus={scheduleFilterStatus}
                onClearFilter={() => setScheduleFilterStatus(null)}
                currentUser={currentUser}
            />
          )}
          {activeView === ViewState.INVENTORY && (
            <InventoryView 
                parts={parts} 
                onAddPart={handleAddPart}
                onUpdatePart={handleUpdatePart}
                currentUser={currentUser}
                showLowStockOnly={inventoryLowStockFilter}
                onClearFilter={() => setInventoryLowStockFilter(false)}
            />
          )}
          {activeView === ViewState.MAINTENANCE && (
            <MaintenanceView 
                maintenances={maintenances} 
                platforms={platforms}
                partsExchanged={partsExchanged}
                parts={parts}
                filterPlatformId={selectedPlatformId}
                onClearFilter={() => setSelectedPlatformId(null)}
                onRegisterMaintenance={handleRegisterMaintenance}
                onUpdateMaintenance={handleUpdateMaintenance}
                onDeleteMaintenance={handleDeleteMaintenance}
                currentUser={currentUser}
            />
          )}
          {activeView === ViewState.SETTINGS && (
            <SettingsView 
                user={currentUser}
                onUpdateUser={handleUpdateUser}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
