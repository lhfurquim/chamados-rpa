import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SearchableSelect } from './ui/searchable-select';
import { createRobot } from '../services/robotsService';
import { type Robot, type CreateRobotRequest, type ClientType, type ExecutionType, type RobotStatus } from '../types';
import { Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useCascadingSelects } from '../hooks/useCascadingSelects';

interface RobotCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRobotCreated: (robot: Robot) => void;
}

export default function RobotCreateModal({ isOpen, onClose, onRobotCreated }: RobotCreateModalProps) {
  const [formData, setFormData] = useState<CreateRobotRequest>({
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

  // Configure cascading selects hook for cells only
  const cascadingSelects = useCascadingSelects({
    onCellChange: (cellId) => {
      setFormData(prev => ({ ...prev, cell: cellId || '' }));
      // Clear cell error when a cell is selected
      if (cellId && errors.cell) {
        setErrors(prev => ({ ...prev, cell: '' }));
      }
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    // Use the selected cell from cascading selects
    if (!cascadingSelects.selectedCell) {
      newErrors.cell = 'Célula é obrigatória';
    }
    if (!formData.technology.trim()) {
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
      // Ensure cell is synced from cascading select
      const dataToSubmit = {
        ...formData,
        cell: cascadingSelects.selectedCell || formData.cell
      };
      const newRobot = await createRobot(dataToSubmit);
      onRobotCreated(newRobot);
      handleClose();
    } catch (error) {
      console.error('Error creating robot:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar robô. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      cell: '',
      technology: '',
      executionType: 'UNATTENDED',
      client: 'NECXT', 
      status: 'ACTIVE'
    });
    setErrors({});
    // Reset cascading selections
    cascadingSelects.resetSelections();
    onClose();
  };

  const handleInputChange = (field: keyof CreateRobotRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Robô</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo robô RPA
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
            {cascadingSelects.cellsLoading ? (
              <div className="flex items-center space-x-2 p-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando células...</span>
              </div>
            ) : (
              <SearchableSelect
                options={cascadingSelects.cells}
                value={cascadingSelects.selectedCell}
                onValueChange={cascadingSelects.onCellChange}
                placeholder="Pesquise ou selecione a célula"
                emptyMessage="Nenhuma célula encontrada"
                className={errors.cell ? 'border-red-500' : ''}
              />
            )}
            {errors.cell && <p className="text-sm text-red-600">{errors.cell}</p>}
            {cascadingSelects.error && (
              <p className="text-sm text-red-600">Erro ao carregar células: {cascadingSelects.error}</p>
            )}
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
                  Criando...
                </>
              ) : (
                'Criar Robô'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}