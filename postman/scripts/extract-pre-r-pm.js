// Prepare request body for extract if missing
const videoId = pm.environment.get('videoId');
if (!pm.request.body || !pm.request.body.raw) {
  const payload = {
    videoId: videoId || 'dQw4w9WgXcQ',
    options: { format: 'txt', includeTimestamps: false }
  };
  pm.request.body.update(JSON.stringify(payload));
}
