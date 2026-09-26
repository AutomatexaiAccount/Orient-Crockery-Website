export async function sendWhatsAppMessage(phoneNumber, templateName, templateParameters = []) {
  const endpoint = process.env.WHATSAPP_API_ENDPOINT; // e.g., https://wacloud.innuvissolutions.com/api/v1/messages
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN; 
  
  if (!endpoint || !accessToken) {
    console.error("WhatsApp API credentials missing. Please check your .env file.");
    return false;
  }

  try {
    // Assuming standard WhatsApp Cloud API payload format.
    // We may need to adjust this depending on the exact Wacloud API documentation.
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "en"
          },
          components: [
            {
              type: "body",
              parameters: templateParameters
            }
          ]
        }
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to send WhatsApp message:", errorData);
        return false;
    }

    const data = await response.json();
    console.log("WhatsApp message sent successfully:", data);
    return data;

  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}
