export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ok:false,error:'POST required'});
  const key=process.env.OPENAI_API_KEY;
  if(!key) return res.status(503).json({ok:false,configured:false,error:'OPENAI_API_KEY is not configured on the server.'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
    const packet=body.packet||{};
    const question=String(body.question||body.instruction||'Help me with my research.').trim();
    const mode=String(body.mode||'Ask');
    const system=`You are the integrated AI Research Companion inside ANTENEH RESEARCH HUB / MY PHD COMPANION. You are not a generic chatbot. You understand the user's current research project, lifecycle stage, saved work, methodology gate, analysis plan and evidence context supplied in the packet. Your job is to proactively help a PhD researcher even when they do not know the correct academic terminology. Translate vague questions into useful research actions. Teach clearly, ask only essential clarifying questions, identify hidden assumptions, detect contradictions, suggest the next best action, and explain why. Never fabricate citations, papers, statistics, data, results, methods, or institutional requirements. Separate VERIFIED EVIDENCE, REASONED INFERENCE, RECOMMENDATION, and HUMAN APPROVAL REQUIRED. Do not silently make methodology, sampling, ethics, or statistical decisions for the researcher. When current external evidence is needed, search the web and cite sources in the answer. For statistics, never pretend an analysis was executed unless actual data and an analysis result are supplied. For writing, improve rather than invent unsupported findings. Mode: ${mode}.`;
    const prompt=`${system}\n\nCURRENT RESEARCH CONTEXT (JSON):\n${JSON.stringify(packet,null,2)}\n\nRECENT CONVERSATION:\n${JSON.stringify(body.history||[],null,2)}\n\nUSER REQUEST:\n${question}\n\nRespond as a practical research mentor. Start with the direct answer, then give concrete next steps. If the user seems unsure what to ask, infer the likely need from the research context and offer a structured path. Preserve the evidence-first and human-approval rules.`;
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({model:process.env.RESEARCH_AI_MODEL||'gpt-5.6-luna',tools:[{type:'web_search'}],input:prompt,store:false})});
    const data=await r.json();
    if(!r.ok)return res.status(r.status).json({ok:false,error:data?.error?.message||'AI provider request failed'});
    const text=typeof data.output_text==='string'?data.output_text:(Array.isArray(data.output)?data.output.flatMap(x=>x.content||[]).map(x=>x.text||'').filter(Boolean).join('\n'):'');
    return res.status(200).json({ok:true,model:process.env.RESEARCH_AI_MODEL||'gpt-5.6-luna',text,provider:'OpenAI Responses API + web search',generatedAt:new Date().toISOString()});
  }catch(e){return res.status(500).json({ok:false,error:e?.message||'Research AI request failed'});}
}
