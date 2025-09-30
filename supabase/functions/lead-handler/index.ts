// File: supabase/functions/lead-handler/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Definiamo gli header per la gestione del CORS.
// Questi header danno il "permesso" al browser di comunicare con la nostra funzione da un altro sito.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// La funzione `serve` gestisce le richieste in arrivo.
serve(async (req) => {
  // Il browser invia una richiesta 'OPTIONS' (pre-flight) prima del POST per chiedere i permessi.
  // Dobbiamo rispondere positivamente a questa richiesta.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Inizializza il client di Supabase usando le variabili d'ambiente sicure fornite da Supabase.
    const supabase = createClient(
      (Deno as any).env.get('SUPABASE_URL')!,
      (Deno as any).env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Usiamo la chiave 'service_role' per poter scrivere nel database.
    );

    // Estrae i dati inviati dal modulo HTML.
    const formData = await req.formData();
    
    // Recupera i dati dai campi del modulo.
    const productId = formData.get('product_id') as string;
    const affiliateId = formData.get('aff_id') as string;
    const subId = formData.get('sub_id') as string;
    const customerName = formData.get('customerName') as string;
    const customerPhone = formData.get('customerPhone') as string;
    const customerAddress = formData.get('customerAddress') as string;
    const thankYouUrl = formData.get('redirect_url') as string || 'https://mws-platform.com'; // URL di fallback

    // Valida i dati essenziali.
    if (!productId || !affiliateId || !customerName || !customerPhone || !customerAddress) {
      throw new Error('Missing required form fields.');
    }

    // Prendi i dettagli del prodotto dal database per ottenere prezzo e commissione.
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('price, commission')
      .eq('id', parseInt(productId, 10))
      .single();

    if (productError || !productData) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    // Prepara i dati per l'inserimento nella tabella 'sales'.
    const saleData = {
      product_id: parseInt(productId, 10),
      affiliate_id: parseInt(affiliateId, 10),
      sub_id: subId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      total_price: productData.price,
      commission_value: productData.commission,
      status: 'in attesa',
      country: 'IT',
    };

    // Inserisci il nuovo ordine nel database.
    const { error: insertError } = await supabase.from('sales').insert(saleData);

    if (insertError) {
      throw insertError;
    }

    // *** NUOVA LOGICA DI RISPOSTA ***
    // Se tutto va bene, rispondi con un JSON di successo che include l'URL di reindirizzamento.
    // Il reindirizzamento verrà gestito dal JavaScript sul lato client.
    return new Response(JSON.stringify({ success: true, redirectUrl: thankYouUrl }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in lead-handler function:', error.message);
    // Anche la risposta di errore deve includere gli header CORS e un messaggio chiaro.
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});