import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Smoke test configuration: 2 VUs for 15s
export const options = {
  vus: 2,
  duration: '15s',
  thresholds: {
    // Assert that 99% of requests succeed
    http_req_failed: ['rate<0.01'],
    // 95% of requests must complete below 500ms
    http_req_duration: ['p(95)<500'],
  },
};

// 2. Base URL parameterization (environment variable with local default)
const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:5173';
const TARGET_ENDPOINT = __ENV.TARGET_ENDPOINT || '/';

export default function () {
  const url = `${BASE_URL}${TARGET_ENDPOINT}`;
  const params = {
    headers: {
      'User-Agent': 'k6-performance-test/antigravity',
      'Accept': 'application/json, text/plain, text/html, */*',
    },
    tags: { name: 'SmokeTestEndpoint' },
  };

  const res = http.get(url, params);

  // 3. Verifications
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response received within 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
