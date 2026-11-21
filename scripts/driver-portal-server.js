const http = require('http');

const PORT = 3004;
const TARGET_PORT = 3000;
const TARGET_HOST = '127.0.0.1';

const server = http.createServer((req, res) => {
  // If user visits root /, redirect to driver dashboard
  if (req.url === '/' || req.url === '') {
    res.writeHead(302, { Location: '/drivers/dashboard' });
    res.end();
    return;
  }

  // Forward all other requests to the User Portal on port 3000
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${TARGET_PORT}`,
      'x-forwarded-host': `localhost:${PORT}`,
      'x-forwarded-port': `${PORT}`,
      'x-driver-portal': 'true',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // If redirect contains port 3000, rewrite to port 3004
    const headers = { ...proxyRes.headers };
    if (headers.location && headers.location.includes(`:${TARGET_PORT}`)) {
      headers.location = headers.location.replace(`:${TARGET_PORT}`, `:${PORT}`);
    }

    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[Driver Portal Proxy Error]: ${err.message}`);
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body style="font-family: sans-serif; background: #0f172a; color: white; padding: 40px; text-align: center;">
          <h1 style="color: #f59e0b;">🚖 Cabi Driver Portal (Port ${PORT})</h1>
          <p>Connecting to backend web services on port ${TARGET_PORT}...</p>
          <p style="color: #94a3b8;">${err.message}</p>
          <button onclick="location.reload()" style="background: #f59e0b; border: none; padding: 10px 20px; color: black; font-weight: bold; border-radius: 8px; cursor: pointer;">Retry Connection</button>
        </body>
      </html>
    `);
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚖 Cabi Driver Portal is running on http://localhost:${PORT}`);
  console.log(`   Default View: http://localhost:${PORT}/drivers/dashboard`);
  console.log(`   Demand Intelligence: http://localhost:${PORT}/drivers/demand-analysis`);
  console.log(`   Proxying to Next.js user-portal at http://127.0.0.1:${TARGET_PORT}`);
  console.log(`=======================================================`);
});
