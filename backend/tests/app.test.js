const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const app = require('../app');

test('GET / returns a JSON status response', async () => {
  const server = app.listen(0);
  await once(server, 'listening');

  const { port } = server.address();
  const response = await new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port, path: '/' }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
  });

  server.close();

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /TeamPulse API is running/i);
});
