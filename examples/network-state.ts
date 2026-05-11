/**
 * Check the archive node's sync state — useful for monitoring how far behind
 * the archive is relative to the chain.
 */

import { ArchiveClient } from '../src/index.js';

const client = new ArchiveClient(
  process.env.ARCHIVE_GRAPHQL_URI ?? 'http://localhost:8080/',
);

const state = await client.getNetworkState();
const max = state.maxBlockHeight;

if (!max) {
  console.error('archive returned no maxBlockHeight — is it synced?');
  process.exit(1);
}

console.log(`canonical max: ${max.canonicalMaxBlockHeight}`);
console.log(`pending max:   ${max.pendingMaxBlockHeight}`);
console.log(`gap:           ${max.pendingMaxBlockHeight - max.canonicalMaxBlockHeight}`);
