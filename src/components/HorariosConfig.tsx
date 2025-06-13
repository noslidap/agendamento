
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const HorariosConfig = () => {
  const [novoHorario, setNovoHorario] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar horários do Supabase
  const { data: horarios = [] } = useQuery({
    queryKey: ['horarios-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('horarios_disponiveis')
        .select('*')
        .eq('ativo', true)
        .order('horario');
      
      if (error) {
        console.error('Erro ao buscar horários:', error);
        return [];
      }
      
      return data;
    }
  });

  const adicionarHorario = async () => {
    if (!novoHorario) {
      toast({
        title: "Erro",
        description: "Por favor, digite um horário válido.",
        variant: "destructive",
      });
      return;
    }

    // Validar formato HH:MM
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(novoHorario)) {
      toast({
        title: "Erro",
        description: "Por favor, use o formato HH:MM (ex: 14:30).",
        variant: "destructive",
      });
      return;
    }

    // Verificar se já existe
    if (horarios.some(h => h.horario === novoHorario)) {
      toast({
        title: "Erro",
        description: "Este horário já existe.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('horarios_disponiveis')
        .insert([{ horario: novoHorario }]);

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['horarios-config'] });
      queryClient.invalidateQueries({ queryKey: ['horarios-disponiveis'] });
      setNovoHorario("");
      
      toast({
        title: "Sucesso!",
        description: "Horário adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar horário:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar horário. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const removerHorario = async (id: string) => {
    try {
      const { error } = await supabase
        .from('horarios_disponiveis')
        .update({ ativo: false })
        .eq('id', id);

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['horarios-config'] });
      queryClient.invalidateQueries({ queryKey: ['horarios-disponiveis'] });
      
      toast({
        title: "Sucesso!",
        description: "Horário removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover horário:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover horário. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const resetarHorarios = async () => {
    try {
      // Desativar todos os horários existentes
      await supabase
        .from('horarios_disponiveis')
        .update({ ativo: false })
        .eq('ativo', true);

      // Horários padrão
      const horariosDefault = [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
        "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
        "16:00", "16:30", "17:00", "17:30", "18:00"
      ];

      // Inserir os horários padrão
      const { error } = await supabase
        .from('horarios_disponiveis')
        .insert(horariosDefault.map(horario => ({ horario })));

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['horarios-config'] });
      queryClient.invalidateQueries({ queryKey: ['horarios-disponiveis'] });
      
      toast({
        title: "Sucesso!",
        description: "Horários resetados para o padrão.",
      });
    } catch (error) {
      console.error('Erro ao resetar horários:', error);
      toast({
        title: "Erro",
        description: "Erro ao resetar horários. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Configurar Horários Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Adicionar novo horário */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Adicionar Novo Horário
            </h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="novoHorario" className="text-white">
                  Horário (HH:MM)
                </Label>
                <Input
                  id="novoHorario"
                  value={novoHorario}
                  onChange={(e) => setNovoHorario(e.target.value)}
                  placeholder="14:30"
                  className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={adicionarHorario}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de horários */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Horários Cadastrados ({horarios.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={resetarHorarios}
                className="border-white/30 text-white hover:bg-white/20"
              >
                Resetar para Padrão
              </Button>
            </div>
            
            {horarios.length === 0 ? (
              <p className="text-center text-gray-300 py-8">
                Nenhum horário cadastrado.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {horarios.map((horario) => (
                  <div
                    key={horario.id}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-2 border border-white/10"
                  >
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {horario.horario}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removerHorario(horario.id)}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="bg-blue-900/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">ℹ️ Informações:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Use o formato HH:MM (ex: 14:30, 09:15)</li>
              <li>• Os horários são exibidos automaticamente ordenados</li>
              <li>• Clientes só podem agendar nos horários cadastrados aqui</li>
              <li>• Você pode adicionar quantos horários quiser</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
