/**
 * End-to-end integration test against a live `Archive-Node-API` server backed
 * by the static `archive_db.sql` fixture.
 *
 * Setup is owned by `.github/workflows/integration.yml` (Postgres service,
 * fixture load, server start). When ARCHIVE_GRAPHQL_URI is unset, the test
 * is skipped — keeps `npm run test:unit` runnable on a developer laptop
 * without infrastructure.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { ArchiveClient } from '../src/index.js';

const URI = process.env.ARCHIVE_GRAPHQL_URI;

const FIXTURE_ADDRESS =
  'B62qiaEMrWiYdK7LcJ2ScdMyG8LzUxi7yaw17XvBD34on7UKfhAkRML';

if (!URI) {
  test('skip: ARCHIVE_GRAPHQL_URI not set', () => {
    assert.ok(true);
  });
} else {
  const client = new ArchiveClient(URI, { retries: 2, retryDelayMs: 1000 });

  test('networkState returns max block heights', async () => {
    const state = await client.getNetworkState();
    assert.ok(state.maxBlockHeight, 'maxBlockHeight present');
    assert.ok(
      state.maxBlockHeight!.canonicalMaxBlockHeight >= 0,
      'canonicalMaxBlockHeight non-negative',
    );
  });

  test('events query against fixture address returns array (zero rows is fine)', async () => {
    const events = await client.getEvents({
      address: FIXTURE_ADDRESS,
      status: 'CANONICAL',
    });
    assert.ok(Array.isArray(events));
  });

  test('actions query against fixture address returns array', async () => {
    const actions = await client.getActions({
      address: FIXTURE_ADDRESS,
      status: 'CANONICAL',
    });
    assert.ok(Array.isArray(actions));
  });

  test('blocks query returns the latest few canonical blocks', async () => {
    const blocks = await client.getBlocks({
      query: { canonical: true },
      limit: 3,
      sortBy: 'BLOCKHEIGHT_DESC',
    });
    assert.ok(Array.isArray(blocks));
    if (blocks.length > 1) {
      assert.ok(
        blocks[0].blockHeight >= blocks[1].blockHeight,
        'sortBy DESC honored',
      );
    }
  });
}
