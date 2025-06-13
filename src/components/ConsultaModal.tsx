
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, Phone } from "lucide-react";

interface AgendamentoType {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  data: string;
  horario: string;
  status: "pendente" | "confirmado" | "cancelado";
}

interface ConsultaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ConsultaModal = ({ open, onOpenChange }: ConsultaModalProps) => {
  const [telefone, setTelefone] = useState("");
  const [agendamentos, setAgendamentos] = useState<AgendamentoType[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const buscarAgendamentos = () => {
    if (!telefone) return;
    
    const todosAgendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    const agendamentosFiltrados = todosAgendamentos.filter(
      (agendamento: AgendamentoType) => agendamento.telefone === telefone
    );
    
    setAgendamentos(agendamentosFiltrados);
    setMostrarResultados(true);
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
    setTelefone("");
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
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <Button 
              onClick={buscarAgendamentos}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              disabled={!telefone}
            >
              <Phone className="mr-2 h-4 w-4" />
              Buscar Agendamentos
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
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
                        
                        {agendamento.email && (
                          <p className="text-sm text-gray-500 mt-2">
                            E-mail: {agendamento.email}
                          </p>
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
