import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { updateRobot } from '../services/robotsService';
import { type Robot, type UpdateRobotRequest, type ClientType, type ExecutionType, type RobotStatus } from '../types';
import { Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface RobotEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: Robot | null;
  onRobotUpdated: (robot: Robot) => void;
}

export default function RobotEditModal({ isOpen, onClose, robot, onRobotUpdated }: RobotEditModalProps) {
  const [formData, setFormData] = useState<UpdateRobotRequest>({
    id: 0,
    name: '',
    cell: '',
    technology: '',
    executionType: 'UNATTENDED',
    client: 'NECXT',
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (robot && isOpen) {
      setFormData({
        id: robot.id!,
        name: robot.name,
        cell: robot.cell,
        technology: robot.technology,
        executionType: robot.executionType,
        client: robot.client,
        status: robot.status
      });
      setErrors({});
    }
  }, [robot, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.cell?.trim()) {
      newErrors.cell = 'Célula é obrigatória';
    }
    if (!formData.technology?.trim()) {
      newErrors.technology = 'Tecnologia é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const updatedRobot = await updateRobot(formData);
      onRobotUpdated(updatedRobot);
      handleClose();
    } catch (error) {
      console.error('Error updating robot:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar robô. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof UpdateRobotRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!robot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Robô</DialogTitle>
          <DialogDescription>
            Atualize os dados do robô RPA
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Robô *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite o nome do robô"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cell">Célula *</Label>
            <Input
              id="cell"
              value={formData.cell}
              onChange={(e) => handleInputChange('cell', e.target.value)}
              placeholder="Digite a célula"
              className={errors.cell ? 'border-red-500' : ''}
            />
            {errors.cell && <p className="text-sm text-red-600">{errors.cell}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="technology">Tecnologia *</Label>
           <Select
                value={formData.technology}
                onValueChange={(value: string) => handleInputChange('technology', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Javascript">Javascript</SelectItem>
                  <SelectItem value="Power Automate Desktop">Power Automate Desktop</SelectItem>
                  <SelectItem value="Power Automate Cloud">Power Automate Cloud</SelectItem>
                  <SelectItem value="UiPath">UiPath</SelectItem>
                  <SelectItem value="Blue Prism">Blue Prism</SelectItem>
                  <SelectItem value="Automation Anywhere">Automation Anywhere</SelectItem>
                </SelectContent>
              </Select>
            {errors.technology && <p className="text-sm text-red-600">{errors.technology}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={formData.client}
                onValueChange={(value: ClientType) => handleInputChange('client', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NECXT">NECXT</SelectItem>
                  <SelectItem value="STEFANINI">STEFANINI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Execução</Label>
              <Select
                value={formData.executionType}
                onValueChange={(value: ExecutionType) => handleInputChange('executionType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATTENDED">Assistido</SelectItem>
                  <SelectItem value="UNATTENDED">Não Assistido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: RobotStatus) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}