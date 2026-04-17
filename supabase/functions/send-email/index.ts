import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { to, sender, content } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'engXchange Alerts <notifications@resend.dev>',
        to: [to],
        subject: `New Message from ${sender} on engXchange`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">You've got mail! 📬</h2>
            <p><strong>${sender}</strong> sent you a message about an item on engXchange:</p>
            <blockquote style="background: #f1f5f9; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
              "${content}"
            </blockquote>
            <p><a href="https://engxchange.com/inbox" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reply on engXchange</a></p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 0.8rem; color: #64748b;">This is an automated notification. You can manage your alerts in your profile settings.</p>
          </div>
        `,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
