import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Cabi Africa Phase 3 Load, Concurrency & Security-Gate Verification (k6)
 *
 * Usage:
 *   k6 run -e BASE_URL=https://api.cabi.africa tests/load/dispatch-and-mobile-money.k6.js
 */
export const options = {
  scenarios: {
    health_and_slo: {
      executor: 'ramping-vus',
      startVUs: 2,
      stages: [
        { duration: '20s', target: 20 },
        { duration: '30s', target: 20 },
        { duration: '10s', target: 0 },
      ],
      exec: 'healthAndAuthzCheck',
    },
    mobile_money_webhook_replay_flood: {
      executor: 'constant-vus',
      vus: 10,
      duration: '20s',
      exec: 'webhookSpoofRejectionCheck',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.99'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3030';

export function healthAndAuthzCheck() {
  const health = http.get(`${BASE_URL}/health`);
  check(health, {
    'health responds 200': (r) => r.status === 200,
  });

  // Verify Tier 0 protected endpoints fail closed under concurrency
  const protectedPaths = [
    '/api/finance/drivers/test-driver/cashout',
    '/api/privacy/export/test-user',
    '/api/settings/system',
  ];

  for (const path of protectedPaths) {
    const res = http.post(`${BASE_URL}${path}`, '{}', {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, {
      [`${path} rejects unauthenticated`]: (r) => r.status === 401 || r.status === 403 || r.status === 404,
    });
  }

  sleep(0.2);
}

export function webhookSpoofRejectionCheck() {
  // Attempt to bypass Mobile Money webhook origin validation via spoofed X-Forwarded-For
  const payload = JSON.stringify({
    Body: {
      stkCallback: {
        CheckoutRequestID: `spoof-${__VU}-${__ITER}`,
        ResultCode: 0,
      },
    },
  });

  const res = http.post(`${BASE_URL}/api/mpesa/stk-callback`, payload, {
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '196.201.214.200',
    },
  });

  check(res, {
    'spoofed Mobile Money webhook rejected (401/403)': (r) =>
      r.status === 401 || r.status === 403,
  });

  sleep(0.2);
}
