import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, sender, content } = await req.json()

    console.log(`Sending email to: ${to} from: ${sender}`)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'engXchange <notifications@engxchange.com>',
        to: [to],
        reply_to: sender,
        subject: `New Message from ${sender} on engXchange`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">You've got mail! 📬</h2>
            <p><strong>${sender}</strong> sent you a message on engXchange:</p>
            <blockquote style="background: #f1f5f9; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
              "${content}"
            </blockquote>
            <p><a href="https://engxchange.com/inbox" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reply on engXchange</a></p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 0.8rem; color: #64748b;">This is an automated notification from engXchange.</p>
          </div>
        `,
      }),
    })

    const data = await res.json()
    console.log("Resend API Response:", data)

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("Function Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
