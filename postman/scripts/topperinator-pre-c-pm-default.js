// Set dynamic headers and variables for collection-level requests
pm.environment.set('currentTimestamp', Date.now());

// Add X-APP-KEY header if apiToken is set
const apiToken = pm.environment.get('apiToken');
if (apiToken) {
  pm.request.headers.upsert({ key: 'X-APP-KEY', value: apiToken });
}

// Ensure Content-Type for JSON requests
pm.request.headers.upsert({ key: 'Content-Type', value: 'application/json' });

// Add Origin header from environment to help origin checks server-side
const origin = pm.environment.get('appOrigin');
if (origin) {
  pm.request.headers.upsert({ key: 'Origin', value: origin });
}
