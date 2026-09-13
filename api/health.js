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
    }
  });
}
