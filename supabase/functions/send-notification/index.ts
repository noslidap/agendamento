
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationData {
  nome: string;
  telefone: string;
  servico: string;
  preco: number;
  data: string;
  horario: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, telefone, servico, preco, data, horario }: NotificationData = await req.json();

    // Formatear a mensagem da notificação
    const message = `🔔 NOVO AGENDAMENTO!\n\n👤 Cliente: ${nome}\n📞 Telefone: ${telefone}\n✂️ Serviço: ${servico}\n💰 Preço: R$ ${preco.toFixed(2)}\n📅 Data: ${data}\n⏰ Horário: ${horario}`;

    // URL do webhook do WirePusher (você deve configurar seu ID)
    const webhookUrl = `https://wirepusher.com/send?id=GsCqmpGem&title=Novo Agendamento - BarberApp&message=${encodeURIComponent(message)}`;

    console.log('Enviando notificação:', { nome, telefone, servico, data, horario });

    // Enviar a notificação
    const response = await fetch(webhookUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Erro ao enviar notificação: ${response.status}`);
    }

    console.log('Notificação enviada com sucesso');

    return new Response(
      JSON.stringify({ success: true, message: 'Notificação enviada com sucesso' }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erro:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
