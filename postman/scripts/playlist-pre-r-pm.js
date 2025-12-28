// Prepare request body for playlist videos if missing
const playlistUrl = pm.environment.get('playlistUrl');
if (!pm.request.body || !pm.request.body.raw) {
  const payload = {
    playlistUrl: playlistUrl || 'https://www.youtube.com/playlist?list=PL1234567890'
  };
  pm.request.body.update(JSON.stringify(payload));
}
