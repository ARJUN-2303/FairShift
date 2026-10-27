'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { createApp } = require('../server');

let server;
let base;

test.before(async function () {
  await new Promise(function (resolve) {
    server = createApp().listen(0, '127.0.0.1', resolve);
  });
  base = 'http://127.0.0.1:' + server.address().port;
});

test.after(function () {
  server.close();
});

test('GET /healthz returns 200 and status ok', async function () {
  const res = await fetch(base + '/healthz');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('GET /api/status does not claim Firebase is configured', async function () {
  const res = await fetch(base + '/api/status');
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.firebaseConfigured, false);
});

test('unknown /api route returns 404 JSON', async function () {
  const res = await fetch(base + '/api/does-not-exist');
  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(await res.json(), { error: 'not_found' });
});

test('GET / serves the FairShift website', async function () {
  const res = await fetch(base + '/');
  assert.strictEqual(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  assert.ok((await res.text()).includes('<title>FairShift</title>'));
});

test('served index.html is identical to the file in /public', async function () {
  const res = await fetch(base + '/index.html');
  const onDisk = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  assert.strictEqual(await res.text(), onDisk);
});

test('security headers are set and X-Powered-By is hidden', async function () {
  const res = await fetch(base + '/healthz');
  assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
  assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
  assert.strictEqual(res.headers.get('x-powered-by'), null);
});

test('files outside /public cannot be fetched', async function () {
  const res = await fetch(base + '/..%2fpackage.json');
  assert.notStrictEqual(res.status, 200);
  const res2 = await fetch(base + '/server.js');
  assert.strictEqual(res2.status, 404);
});
