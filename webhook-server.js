#!/usr/bin/env node
'use strict';

const http = require('http');
const crypto = require('crypto');
const { execFile } = require('child_process');

const PORT = Number(process.env.PORT || 3000);
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const REPO_DIR = process.env.REPO_DIR || '/var/www/mariooliveiradev.online';
const GIT_BRANCH = process.env.GIT_BRANCH || 'deploy';

function send(res, status, body) {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(body);
}

function timingSafeEquals(a, b) {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifySignature(signature, rawBody) {
  if (!WEBHOOK_SECRET) return false;
  if (typeof signature !== 'string' || !signature.startsWith('sha256=')) return false;

  const expected = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return timingSafeEquals(signature, expected);
}

function runDeploy(cb) {
  execFile(
    '/usr/bin/git',
    ['-C', REPO_DIR, 'pull', '--ff-only', 'origin', GIT_BRANCH],
    { env: process.env },
    (error, stdout, stderr) => {
      cb(error, stdout, stderr);
    }
  );
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/webhook') {
    return send(res, 404, 'not found');
  }

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const rawBody = Buffer.concat(chunks);
    const signature = req.headers['x-hub-signature-256'];

    if (!verifySignature(signature, rawBody)) {
      return send(res, 401, 'invalid signature');
    }

    let payload;
    try {
      payload = JSON.parse(rawBody.toString('utf8') || '{}');
    } catch {
      return send(res, 400, 'invalid json');
    }

    const expectedRef = `refs/heads/${GIT_BRANCH}`;
    if (payload.ref && payload.ref !== expectedRef) {
      return send(res, 202, `ignored ref ${payload.ref}`);
    }

    runDeploy((error, stdout, stderr) => {
      if (error) {
        console.error('deploy failed:', stderr || error.message);
        return send(res, 500, 'deploy failed');
      }

      if (stdout) console.log(stdout.trim());
      return send(res, 200, 'deployed');
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`webhook listening on 127.0.0.1:${PORT}`);
});
