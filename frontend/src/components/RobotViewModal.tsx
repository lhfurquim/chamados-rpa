import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { type Robot, type ClientType, type ExecutionType, type RobotStatus } from '../types';
import { Bot, Building2, Server, Zap, User, Activity } from 'lucide-react';

interface RobotViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: Robot | null;
}

export default function RobotViewModal({ isOpen, onClose, robot }: RobotViewModalProps) {
  if (!robot) return null;

  const getStatusColor = (status: RobotStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: RobotStatus) => {
    switch (status) {
      case 'ACTIVE': return 'Ativo';
      case 'INACTIVE': return 'Inativo';
      default: return status;
    }
  };

  const getExecutionTypeLabel = (type: ExecutionType) => {
    switch (type) {
      case 'ATTENDED': return 'Assistido';
      case 'UNATTENDED': return 'Não Assistido';
      default: return type;
    }
  };

  const getExecutionTypeColor = (type: ExecutionType) => {
    switch (type) {
      case 'ATTENDED': return 'bg-blue-100 text-blue-800';
      case 'UNATTENDED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientColor = (client: ClientType) => {
    switch (client) {
      case 'NECXT': return 'bg-orange-100 text-orange-800';
      case 'STEFANINI': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Detalhes do Robô
          </DialogTitle>
          <DialogDescription>
            Visualize as informações completas do robô RPA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{robot.name}</h2>
            <Badge className={getStatusColor(robot.status)}>
              {getStatusLabel(robot.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Célula</h3>
              </div>
              <p className="text-gray-700">{robot.cell}</p>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Tecnologia</h3>
              </div>
              <p className="text-gray-700">{robot.technology}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Cliente</h3>
                </div>
                <Badge className={getClientColor(robot.client)}>
                  {robot.client}
                </Badge>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Tipo de Execução</h3>
                </div>
                <Badge className={getExecutionTypeColor(robot.executionType)}>
                  {getExecutionTypeLabel(robot.executionType)}
                </Badge>
              </div>
            </div>

            {robot.id && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">ID do Sistema</h3>
                </div>
                <p className="text-gray-700 font-mono">#{robot.id}</p>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Status:</span>
                <span className="ml-2">{getStatusLabel(robot.status)}</span>
              </div>
              <div>
                <span className="font-medium">Execução:</span>
                <span className="ml-2">{getExecutionTypeLabel(robot.executionType)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}