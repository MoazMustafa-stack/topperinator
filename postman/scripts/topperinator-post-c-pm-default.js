// Parse JSON once per test as needed
pm.test('Status code is 2xx', function () {
  pm.expect(pm.response.code).to.be.within(200, 299);
});

pm.test('Response time < 2000ms', function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test('Content-Type is JSON when body exists', function () {
  const len = pm.response.headers.get('Content-Length');
  const ct = pm.response.headers.get('Content-Type') || '';
  if (len && Number(len) > 0) {
    pm.expect(ct.toLowerCase()).to.include('application/json');
  }
});
