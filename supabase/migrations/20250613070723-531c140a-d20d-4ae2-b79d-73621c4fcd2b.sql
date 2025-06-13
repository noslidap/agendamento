
-- Criar tabela para serviços oferecidos pelo barbeiro
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  duracao_minutos INTEGER NOT NULL DEFAULT 30,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para anúncios
CREATE TABLE public.anuncios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar coluna servico_id na tabela agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN servico_id UUID REFERENCES public.servicos(id),
ADD COLUMN observacoes TEXT;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

-- Criar políticas para acesso público
CREATE POLICY "Permitir acesso público aos serviços" 
  ON public.servicos 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Permitir acesso público aos anúncios" 
  ON public.anuncios 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Inserir alguns serviços padrão
INSERT INTO public.servicos (nome, descricao, preco, duracao_minutos) VALUES
  ('Corte Simples', 'Corte de cabelo masculino tradicional', 25.00, 30),
  ('Corte + Barba', 'Corte de cabelo + barba completa', 40.00, 45),
  ('Barba', 'Apenas barba', 20.00, 20),
  ('Corte Degradê', 'Corte moderno com degradê', 35.00, 40),
  ('Sobrancelha', 'Design de sobrancelha masculina', 15.00, 15);

-- Triggers para updated_at
CREATE TRIGGER update_servicos_updated_at 
  BEFORE UPDATE ON public.servicos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anuncios_updated_at 
  BEFORE UPDATE ON public.anuncios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
