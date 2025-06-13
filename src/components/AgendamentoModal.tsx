
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useTelefoneFormat } from "@/hooks/useTelefoneFormat";

interface AgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AgendamentoModal = ({ open, onOpenChange }: AgendamentoModalProps) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    telefone,
    handleTelefoneChange,
    getTelefoneNumbers,
    isValidTelefone
  } = useTelefoneFormat();

  // Buscar serviços disponíveis
  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar serviços:', error);
        return [];
      }
      
      return data;
    }
  });

  // Buscar horários disponíveis
  const { data: horariosDisponiveis = [] } = useQuery({
    queryKey: ['horarios-disponiveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('horarios_disponiveis')
        .select('horario')
        .eq('ativo', true)
        .order('horario');
      
      if (error) {
        console.error('Erro ao buscar horários:', error);
        return [];
      }
      
      return data.map(item => item.horario);
    }
  });

  // Buscar agendamentos existentes para verificar disponibilidade
  const { data: agendamentosExistentes = [] } = useQuery({
    queryKey: ['agendamentos-existentes', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select('horario')
        .eq('data', format(selectedDate, 'yyyy-MM-dd'))
        .neq('status', 'cancelado');
      
      if (error) {
        console.error('Erro ao buscar agendamentos existentes:', error);
        return [];
      }
      
      return data.map(item => item.horario);
    },
    enabled: !!selectedDate
  });

  // Filtrar horários disponíveis baseado nos agendamentos existentes
  const horariosLivres = horariosDisponiveis.filter(
    horario => !agendamentosExistentes.includes(horario)
  );

  const servicoSelecionado = servicos.find(s => s.id === selectedService);

  const isFormValid = () => {
    return nome.trim() !== "" && 
           isValidTelefone() && 
           selectedDate && 
           selectedTime !== "" && 
           selectedService !== "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios corretamente.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('agendamentos')
        .insert([
          {
            nome,
            telefone: getTelefoneNumbers(),
            email: email || null,
            data: format(selectedDate!, 'yyyy-MM-dd'),
            horario: selectedTime,
            servico_id: selectedService,
            status: 'pendente'
          }
        ]);

      if (error) {
        throw error;
      }

      // Enviar notificação via webhook
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            nome,
            telefone: telefone,
            servico: servicoSelecionado?.nome || 'Serviço não identificado',
            preco: servicoSelecionado?.preco || 0,
            data: format(selectedDate!, "dd/MM/yyyy"),
            horario: selectedTime
          }
        });
        console.log('Notificação enviada com sucesso');
      } catch (notificationError) {
        console.error('Erro ao enviar notificação:', notificationError);
        // Não falhar o agendamento se a notificação falhar
      }

      setIsSuccess(true);
      
      setTimeout(() => {
        resetForm();
        setIsSuccess(false);
        onOpenChange(false);
      }, 3000);

    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNome("");
    handleTelefoneChange("");
    setEmail("");
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedService("");
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
            {servicoSelecionado && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Serviço:</strong> {servicoSelecionado.nome}<br />
                  <strong>Preço:</strong> R$ {servicoSelecionado.preco.toFixed(2)}<br />
                  <strong>Duração:</strong> {servicoSelecionado.duracao_minutos} minutos
                </p>
              </div>
            )}
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
                onChange={(e) => handleTelefoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                required
                className={!isValidTelefone() && telefone ? "border-red-300" : ""}
              />
              {telefone && !isValidTelefone() && (
                <p className="text-red-500 text-xs">
                  Digite um telefone válido com 11 dígitos
                </p>
              )}
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

          <div className="space-y-2">
            <Label>Escolha o Serviço *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {servicos.map((servico) => (
                  <SelectItem key={servico.id} value={servico.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{servico.nome}</span>
                      <span className="ml-2 text-green-600 font-semibold">
                        R$ {servico.preco.toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {servicoSelecionado && (
              <div className="bg-blue-50 rounded-lg p-3 mt-2">
                <p className="text-sm text-blue-800">
                  <strong>{servicoSelecionado.nome}</strong><br />
                  {servicoSelecionado.descricao && (
                    <>
                      {servicoSelecionado.descricao}<br />
                    </>
                  )}
                  <strong>Preço:</strong> R$ {servicoSelecionado.preco.toFixed(2)} | 
                  <strong> Duração:</strong> {servicoSelecionado.duracao_minutos} min
                </p>
              </div>
            )}
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
              {selectedDate ? (
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {horariosLivres.length === 0 ? (
                      <div className="p-2 text-center text-gray-500">
                        Nenhum horário disponível para esta data
                      </div>
                    ) : (
                      horariosLivres.map((horario) => (
                        <SelectItem key={horario} value={horario}>
                          {horario}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 border rounded-md bg-gray-50 text-gray-500 text-center">
                  Selecione uma data primeiro
                </div>
              )}
              
              {selectedDate && (
                <p className="text-sm text-gray-600 mt-2">
                  Data selecionada: {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              )}
              
              {selectedDate && agendamentosExistentes.length > 0 && (
                <p className="text-xs text-orange-600">
                  Horários ocupados: {agendamentosExistentes.join(", ")}
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
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
