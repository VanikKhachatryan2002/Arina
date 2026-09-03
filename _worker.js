export default {
  async fetch(request, env) {
    // Basic CORS handling
    if (request.method === "OPTIONS") {
      return withCors(
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        })
      );
    }

    if (request.method !== "POST") {
      return withCors(new Response("Method Not Allowed", { status: 405 }));
    }

    const brevoKey = env.BREVO_API_KEY;
    const fromEmail = env.FROM_EMAIL;
    const toEmail = env.TO_EMAIL || "vanikkhachatryan2002@gmail.com";

    if (!brevoKey || !fromEmail) {
      return withCors(new Response("Missing email configuration", { status: 500 }));
    }

    let payload;
    try {
      payload = await request.json();
    } catch (err) {
      return withCors(new Response("Invalid JSON body", { status: 400 }));
    }

    const { lat, lng, accuracy, source, timestamp, userAgent, error } = payload || {};
    const hasCoords = typeof lat === "number" && typeof lng === "number";
    if (!hasCoords && !error) {
      return withCors(new Response("Missing coordinates or error info", { status: 400 }));
    }

    const record = {
      lat,  
      lng,
      accuracy,
      source: source || "unknown",
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || "",
      error: error || null,
    };

    const emailBody = {
      sender: { email: fromEmail },
      to: [{ email: toEmail }],
      subject: "New visitor location captured",
      textContent: JSON.stringify(record, null, 2),
    };
    const emailResp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(emailBody),
    });
    if (!emailResp.ok) {
      const text = await emailResp.text();
      return withCors(new Response(`Brevo error: ${emailResp.status} ${text}`, { status: 502 }));
    }

    return withCors(new Response("email sent", { status: 200 }));
  },
};

function withCors(resp) {
  resp.headers.set("Access-Control-Allow-Origin", "*");
  return resp;
}

