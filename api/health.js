export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: 'ANTENEH RESEARCH HUB',
    mode: 'research-platform',
    timestamp: new Date().toISOString(),
    capabilities: {
      literature: ['OpenAlex', 'Crossref', 'PubMed'],
      statistics: ['R', 'SPSS', 'Stata'],
      collection: ['KoboToolbox'],
      storage: ['Supabase', 'Google Drive'],
      references: ['EndNote']
    },
    integrations: {
      kobo: {
        api: 'KPI v2',
        serverConfigured: Boolean(process.env.KOBO_SERVER_URL),
        tokenConfigured: Boolean(process.env.KOBO_API_TOKEN),
        tokenExposed: false,
        clientTokenStorage: false
      },
      researchAI: {
        serverKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
        clientKeyExposure: false
      }
    }
  });
}
