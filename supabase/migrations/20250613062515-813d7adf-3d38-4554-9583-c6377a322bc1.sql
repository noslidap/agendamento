
-- Criar tabela para agendamentos
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  data DATE NOT NULL,
  horario TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para horários disponíveis
CREATE TABLE public.horarios_disponiveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  horario TEXT NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir horários padrão
INSERT INTO public.horarios_disponiveis (horario) VALUES
  ('08:00'), ('08:30'), ('09:00'), ('09:30'), ('10:00'), ('10:30'),
  ('11:00'), ('11:30'), ('14:00'), ('14:30'), ('15:00'), ('15:30'),
  ('16:00'), ('16:30'), ('17:00'), ('17:30'), ('18:00');

-- Habilitar Row Level Security (RLS) - por enquanto permitindo acesso público
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_disponiveis ENABLE ROW LEVEL SECURITY;

-- Criar políticas que permitem acesso público (para demonstração)
CREATE POLICY "Permitir acesso público aos agendamentos" 
  ON public.agendamentos 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Permitir acesso público aos horários" 
  ON public.horarios_disponiveis 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at nos agendamentos
CREATE TRIGGER update_agendamentos_updated_at 
  BEFORE UPDATE ON public.agendamentos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
