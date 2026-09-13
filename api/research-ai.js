export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'POST required' });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ ok:false, configured:false, error:'OPENAI_API_KEY is not configured on the server.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const packet = body.packet || {};
    const instruction = body.instruction || 'Act as a rigorous research director. Review the research packet, identify evidence-grounded next decisions, distinguish evidence from inference, and never invent citations, statistics, study findings, or references.';
    const prompt = `${instruction}\n\nRESEARCH PACKET (JSON):\n${JSON.stringify(packet, null, 2)}\n\nReturn structured research guidance. For every substantive claim, identify the supporting evidence record or say that evidence is insufficient. Flag decisions requiring human approval.`;
    const r = await fetch('https://api.openai.com/v1/responses', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
      body:JSON.stringify({model:process.env.RESEARCH_AI_MODEL || 'gpt-5-mini',input:prompt})
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ok:false,error:data?.error?.message || 'AI provider request failed'});
    const text = Array.isArray(data.output) ? data.output.flatMap(x=>x.content||[]).map(x=>x.text||'').filter(Boolean).join('\n') : '';
    return res.status(200).json({ok:true,model:process.env.RESEARCH_AI_MODEL || 'gpt-5-mini',text,provider:'OpenAI Responses API',generatedAt:new Date().toISOString()});
  } catch (e) {
    return res.status(500).json({ok:false,error:e?.message || 'Research AI request failed'});
  }
}
