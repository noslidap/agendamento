
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check } from "lucide-react";

interface AgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AgendamentoModal = ({ open, onOpenChange }: AgendamentoModalProps) => {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Horários disponíveis (simulando dados do barbeiro)
  const horariosDisponiveis = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !telefone || !selectedDate || !selectedTime) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Simular salvamento no banco de dados
    const agendamento = {
      id: Date.now(),
      nome,
      telefone,
      email,
      data: selectedDate,
      horario: selectedTime,
      status: "pendente"
    };

    // Salvar no localStorage (simular banco de dados)
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    agendamentos.push(agendamento);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

    setIsSuccess(true);
    
    setTimeout(() => {
      resetForm();
      setIsSuccess(false);
      onOpenChange(false);
    }, 3000);
  };

  const resetForm = () => {
    setNome("");
    setTelefone("");
    setEmail("");
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  const handleClose = () => {
    resetForm();
    setIsSuccess(false);
    onOpenChange(false);
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Agendamento Realizado!
            </h3>
            <p className="text-gray-600 mb-4">
              Seu agendamento foi registrado com sucesso.<br />
              O barbeiro irá confirmar seu horário em breve.
            </p>
            <p className="text-sm text-gray-500">
              Status: <span className="font-semibold text-yellow-600">Pendente de confirmação</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Agendar Horário
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone (DDD + Número) *</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Escolha a Data *</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                locale={ptBR}
                className="rounded-md border"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Escolha o Horário *</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {horariosDisponiveis.map((horario) => (
                    <SelectItem key={horario} value={horario}>
                      {horario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedDate && (
                <p className="text-sm text-gray-600 mt-2">
                  Data selecionada: {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
            >
              Confirmar Agendamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
