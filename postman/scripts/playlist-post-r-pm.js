// Playlist videos response tests
pm.test('Status code 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Success true and videos array present', function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property('success', true);
  pm.expect(json.videos).to.be.an('array');
});

pm.test('Optional playlistName present when available', function () {
  const json = pm.response.json();
  if (json.playlistName !== undefined) {
    pm.expect(json.playlistName).to.be.a('string');
  }
});
