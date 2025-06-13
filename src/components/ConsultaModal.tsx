
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, Phone, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useTelefoneFormat } from "@/hooks/useTelefoneFormat";
import { useQueryClient } from "@tanstack/react-query";

type AgendamentoType = Tables<'agendamentos'> & {
  servicos?: Tables<'servicos'>;
};

interface ConsultaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ConsultaModal = ({ open, onOpenChange }: ConsultaModalProps) => {
  const [agendamentos, setAgendamentos] = useState<AgendamentoType[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    telefone,
    handleTelefoneChange,
    getTelefoneNumbers,
    isValidTelefone
  } = useTelefoneFormat();

  const buscarAgendamentos = async () => {
    if (!isValidTelefone()) {
      toast({
        title: "Erro",
        description: "Por favor, digite um telefone válido com 11 dígitos.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          servicos (*)
        `)
        .eq('telefone', getTelefoneNumbers())
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) {
        throw error;
      }

      setAgendamentos(data || []);
      setMostrarResultados(true);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setAgendamentos([]);
      setMostrarResultados(true);
      toast({
        title: "Erro",
        description: "Erro ao buscar agendamentos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelarAgendamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Atualizar lista local
      setAgendamentos(prev => 
        prev.map(agendamento => 
          agendamento.id === id 
            ? { ...agendamento, status: 'cancelado' }
            : agendamento
        )
      );

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      
      toast({
        title: "Sucesso!",
        description: "Agendamento cancelado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmado":
        return "Confirmado";
      case "cancelado":
        return "Cancelado";
      default:
        return "Pendente";
    }
  };

  const handleClose = () => {
    handleTelefoneChange("");
    setAgendamentos([]);
    setMostrarResultados(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Consultar Agendamentos
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telefoneConsulta">
                Digite seu telefone (DDD + Número)
              </Label>
              <Input
                id="telefoneConsulta"
                value={telefone}
                onChange={(e) => handleTelefoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className={!isValidTelefone() && telefone ? "border-red-300" : ""}
              />
              {telefone && !isValidTelefone() && (
                <p className="text-red-500 text-xs">
                  Digite um telefone válido com 11 dígitos
                </p>
              )}
            </div>
            
            <Button 
              onClick={buscarAgendamentos}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              disabled={!isValidTelefone() || isLoading}
            >
              <Phone className="mr-2 h-4 w-4" />
              {isLoading ? "Buscando..." : "Buscar Agendamentos"}
            </Button>
          </div>
          
          {mostrarResultados && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Seus Agendamentos
              </h3>
              
              {agendamentos.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">
                      Nenhum agendamento encontrado para este telefone.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {agendamentos.map((agendamento) => (
                    <Card key={agendamento.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{agendamento.nome}</span>
                          </div>
                          <Badge className={getStatusColor(agendamento.status)}>
                            {getStatusText(agendamento.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(agendamento.data), "dd 'de' MMMM 'de' yyyy", { 
                                locale: ptBR 
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{agendamento.horario}</span>
                          </div>
                        </div>

                        {agendamento.servicos && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-800">
                              <strong>Serviço:</strong> {agendamento.servicos.nome}<br />
                              <strong>Preço:</strong> R$ {agendamento.servicos.preco.toFixed(2)}<br />
                              <strong>Duração:</strong> {agendamento.servicos.duracao_minutos} minutos
                              {agendamento.servicos.descricao && (
                                <>
                                  <br />
                                  <strong>Descrição:</strong> {agendamento.servicos.descricao}
                                </>
                              )}
                            </p>
                          </div>
                        )}
                        
                        {agendamento.email && (
                          <p className="text-sm text-gray-500 mb-3">
                            E-mail: {agendamento.email}
                          </p>
                        )}

                        {agendamento.observacoes && (
                          <div className="bg-orange-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-orange-800">
                              <strong>Observação:</strong> {agendamento.observacoes}
                            </p>
                          </div>
                        )}

                        {agendamento.status === "pendente" && (
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => cancelarAgendamento(agendamento.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancelar Agendamento
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
