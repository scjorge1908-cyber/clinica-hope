export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, token } = req.body;
  if (!email || !token) return res.status(400).json({ error: 'Dados inválidos' });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_Yu33UFpD_HqErYVXUVZPKwt8VcDMQ1rBg',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SublocaFácil <noreply@sublocafacil.com.br>',
        to: [email],
        subject: 'Seu código de verificação — SublocaFácil',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f5f2ed;border-radius:16px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="background:#0a6e55;color:white;width:48px;height:48px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;">S</div>
              <h2 style="color:#0e1117;font-size:20px;margin:12px 0 4px;">SublocaFácil</h2>
            </div>
            <div style="background:white;border-radius:12px;padding:28px;text-align:center;">
              <p style="color:#6b7385;font-size:14px;margin:0 0 20px;">Seu código de verificação é:</p>
              <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#0a6e55;margin:0 0 20px;">${token}</div>
              <p style="color:#6b7385;font-size:12px;margin:0;">
                Este código expira em <strong>15 minutos</strong>.<br/>
                Se não foi você, ignore este e-mail.
              </p>
            </div>
            <p style="text-align:center;color:#6b7385;font-size:11px;margin-top:20px;">
              SublocaFácil — sublocafacil.com.br
            </p>
          </div>`
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.message || 'Erro ao enviar' });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
