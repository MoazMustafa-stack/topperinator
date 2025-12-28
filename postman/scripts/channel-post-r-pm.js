// Channel videos response tests
pm.test('Status code 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Success true and videos array present', function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property('success', true);
  pm.expect(json.videos).to.be.an('array');
});

pm.test('Videos have id, title, thumbnail', function () {
  const json = pm.response.json();
  if (Array.isArray(json.videos)) {
    json.videos.forEach(v => {
      pm.expect(v).to.have.property('id');
      pm.expect(v).to.have.property('title');
      pm.expect(v).to.have.property('thumbnail');
    });
  }
});
