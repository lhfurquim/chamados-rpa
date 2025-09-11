import { useState, useEffect, useCallback } from 'react';
import { dpApiService } from '../services/dpApi';
import { getRobotsByCell } from '../services/robotsApi';
import type { DpCell, DpClient, DpService, Robot } from '../types';
import type { SearchableSelectOption } from '../components/ui/searchable-select';

export interface UseCascadingSelectsReturn {
  cells: SearchableSelectOption[];
  clients: SearchableSelectOption[];
  services: SearchableSelectOption[];
  robots: SearchableSelectOption[];
  cellsLoading: boolean;
  clientsLoading: boolean;
  servicesLoading: boolean;
  robotsLoading: boolean;
  error: string | null;
  selectedCell: string | undefined;
  selectedClient: string | undefined;
  selectedService: string | undefined;
  selectedRobot: string | undefined;
  onCellChange: (cellId: string) => void;
  onClientChange: (clientId: string) => void;
  onServiceChange: (serviceId: string) => void;
  onRobotChange: (robotName: string) => void;
  resetSelections: () => void;
}

interface UseCascadingSelectsProps {
  onCellChange?: (cellId: string | undefined) => void;
  onClientChange?: (clientId: string | undefined) => void;
  onServiceChange?: (serviceId: string | undefined) => void;
  onRobotChange?: (robotName: string | undefined) => void;
  initialCellId?: string;
  initialClientId?: string;
  initialServiceId?: string;
  initialRobotName?: string;
}

export function useCascadingSelects({
  onCellChange: onCellChangeCallback,
  onClientChange: onClientChangeCallback,
  onServiceChange: onServiceChangeCallback,
  onRobotChange: onRobotChangeCallback,
  initialCellId,
  initialClientId,
  initialServiceId,
  initialRobotName,
}: UseCascadingSelectsProps = {}): UseCascadingSelectsReturn {
  const [cells, setCells] = useState<SearchableSelectOption[]>([]);
  const [clients, setClients] = useState<SearchableSelectOption[]>([]);
  const [services, setServices] = useState<SearchableSelectOption[]>([]);
  const [robots, setRobots] = useState<SearchableSelectOption[]>([]);
  
  const [selectedCell, setSelectedCell] = useState<string | undefined>(initialCellId);
  const [selectedClient, setSelectedClient] = useState<string | undefined>(initialClientId);
  const [selectedService, setSelectedService] = useState<string | undefined>(initialServiceId);
  const [selectedRobot, setSelectedRobot] = useState<string | undefined>(initialRobotName);
  
  const [cellsLoading, setCellsLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [robotsLoading, setRobotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCellOption = useCallback((cell: DpCell): SearchableSelectOption => ({
    value: cell.ID_CELULA.toString(),
    label: cell.NOME_CELULA ? `${cell.ID_CELULA} - ${cell.NOME_CELULA}` : cell.ID_CELULA.toString()
  }), []);

  const formatClientOption = useCallback((client: DpClient): SearchableSelectOption => ({
    value: client.ID_CLIENTE.toString(),
    label: client.NOME_CLIENT || `Cliente ${client.ID_CLIENTE}`
  }), []);

  const formatServiceOption = useCallback((service: DpService): SearchableSelectOption => ({
    value: service.ID_SERVICO.toString(),
    label: service.NOME_SERVICE || `Serviço ${service.ID_SERVICO}`
  }), []);

  const formatRobotOption = useCallback((robot: Robot): SearchableSelectOption => ({
    value: robot.name,
    label: robot.name
  }), []);

  const loadCells = useCallback(async () => {
    try {
      setCellsLoading(true);
      setError(null);
      
      const cellsData = await dpApiService.getCells();
      const formattedCells = cellsData.map(formatCellOption);
      setCells(formattedCells);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar células';
      setError(errorMessage);
    } finally {
      setCellsLoading(false);
    }
  }, [formatCellOption]);

  const loadClients = useCallback(async (cellId: number) => {
    try {
      setClientsLoading(true);
      setError(null);
      
      const clientsData = await dpApiService.getClientsByCell(cellId);
      const formattedClients = clientsData.map(formatClientOption);
      setClients(formattedClients);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes';
      setError(errorMessage);
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  }, [formatClientOption]);

  const loadServices = useCallback(async (cellId: number, clientId: number) => {
    try {
      setServicesLoading(true);
      setError(null);
      
      const servicesData = await dpApiService.getServicesByCellAndClient(cellId, clientId);
      const formattedServices = servicesData.map(formatServiceOption);
      setServices(formattedServices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar serviços';
      setError(errorMessage);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, [formatServiceOption]);

  const loadRobots = useCallback(async (cellId: string) => {
    try {
      setRobotsLoading(true);
      setError(null);
      
      const robotsData = await getRobotsByCell(cellId);
      const formattedRobots = robotsData.map(formatRobotOption);
      setRobots(formattedRobots);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar robôs';
      setError(errorMessage);
      setRobots([]);
    } finally {
      setRobotsLoading(false);
    }
  }, [formatRobotOption]);

  const onCellChange = useCallback((cellId: string) => {
    setSelectedCell(cellId);
    setSelectedClient(undefined);
    setSelectedService(undefined);
    setSelectedRobot(undefined);
    setClients([]);
    setServices([]);
    setRobots([]);

    if (cellId) {
      loadClients(parseInt(cellId));
      loadRobots(cellId);
    }

    onCellChangeCallback?.(cellId || undefined);
    onClientChangeCallback?.(undefined);
    onServiceChangeCallback?.(undefined);
    onRobotChangeCallback?.(undefined);
  }, [loadClients, loadRobots, onCellChangeCallback, onClientChangeCallback, onServiceChangeCallback, onRobotChangeCallback]);

  const onClientChange = useCallback((clientId: string) => {
    setSelectedClient(clientId);
    setSelectedService(undefined);
    setServices([]);

    if (clientId && selectedCell) {
      loadServices(parseInt(selectedCell), parseInt(clientId));
    }

    onClientChangeCallback?.(clientId || undefined);
    onServiceChangeCallback?.(undefined);
  }, [loadServices, selectedCell, onClientChangeCallback, onServiceChangeCallback]);

  const onServiceChange = useCallback((serviceId: string) => {
    setSelectedService(serviceId);
    onServiceChangeCallback?.(serviceId || undefined);
  }, [onServiceChangeCallback]);

  const onRobotChange = useCallback((robotName: string) => {
    setSelectedRobot(robotName);
    onRobotChangeCallback?.(robotName || undefined);
  }, [onRobotChangeCallback]);

  const resetSelections = useCallback(() => {
    setSelectedCell(undefined);
    setSelectedClient(undefined);
    setSelectedService(undefined);
    setSelectedRobot(undefined);
    setClients([]);
    setServices([]);
    setRobots([]);
    
    onCellChangeCallback?.(undefined);
    onClientChangeCallback?.(undefined);
    onServiceChangeCallback?.(undefined);
    onRobotChangeCallback?.(undefined);
  }, [onCellChangeCallback, onClientChangeCallback, onServiceChangeCallback, onRobotChangeCallback]);

  useEffect(() => {
    loadCells();
  }, [loadCells]);

  useEffect(() => {
    if (initialCellId && cells.length > 0) {
      const cellExists = cells.find(cell => cell.value === initialCellId);
      if (cellExists) {
        loadClients(parseInt(initialCellId));
      }
    }
  }, [initialCellId, cells, loadClients]);

  useEffect(() => {
    if (initialClientId && initialCellId && clients.length > 0) {
      const clientExists = clients.find(client => client.value === initialClientId);
      if (clientExists) {
        loadServices(parseInt(initialCellId), parseInt(initialClientId));
      }
    }
  }, [initialClientId, initialCellId, clients, loadServices]);

  return {
    cells,
    clients,
    services,
    robots,
    cellsLoading,
    clientsLoading,
    servicesLoading,
    robotsLoading,
    error,
    selectedCell,
    selectedClient,
    selectedService,
    selectedRobot,
    onCellChange,
    onClientChange,
    onServiceChange,
    onRobotChange,
    resetSelections,
  };
}