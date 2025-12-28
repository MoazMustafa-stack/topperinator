// Extract endpoint response tests
pm.test('Status code 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Success true and transcript present', function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property('success', true);
  pm.expect(json).to.have.property('transcript');
  pm.expect(json.transcript).to.be.a('string').that.is.not.empty;
});

pm.test('Word count is a positive integer', function () {
  const json = pm.response.json();
  pm.expect(json.wordCount).to.be.a('number').that.is.above(0);
});
