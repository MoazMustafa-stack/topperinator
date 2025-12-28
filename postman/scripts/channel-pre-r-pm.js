// Prepare request body for channel videos if missing
const channelUrl = pm.environment.get('channelUrl');
if (!pm.request.body || !pm.request.body.raw) {
  const payload = {
    channelUrl: channelUrl || 'https://www.youtube.com/@RickAstley',
    maxVideos: 10
  };
  pm.request.body.update(JSON.stringify(payload));
}
