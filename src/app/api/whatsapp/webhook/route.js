import { NextResponse } from 'next/server';

export async function GET(request) {
  // Webhook verification endpoint used by the WhatsApp provider (Wacloud)
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WEBHOOK_VERIFIED');
      // The provider requires the challenge string to be returned to verify the webhook
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.log('WEBHOOK_VERIFICATION_FAILED');
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
    }
  }

  return NextResponse.json({ message: 'Webhook endpoint is active. Send a GET request with hub parameters to verify.' }, { status: 200 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Log incoming webhook data (such as message read receipts, delivery statuses, or customer replies)
    console.log("Incoming WhatsApp Webhook Data:", JSON.stringify(body, null, 2));

    // Here we can eventually add logic to handle specific events 
    // e.g., updating the order status in Supabase if a customer replies or if a message is marked as 'delivered'.
    
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
