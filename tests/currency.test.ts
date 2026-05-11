import test from 'node:test';
import assert from 'node:assert/strict';

import { Currency } from '../src/currency.js';
import {
  CurrencyUnderflowError,
  InvalidCurrencyError,
} from '../src/errors.js';

test('fromMina integer', () => {
  assert.equal(Currency.fromMina('5').nanomina(), 5_000_000_000n);
});

test('fromMina decimal', () => {
  assert.equal(Currency.fromMina('1.5').nanomina(), 1_500_000_000n);
});

test('fromMina smallest unit', () => {
  assert.equal(Currency.fromMina('0.000000001').nanomina(), 1n);
});

test('fromMina without leading whole', () => {
  assert.equal(Currency.fromMina('.5').nanomina(), 500_000_000n);
});

test('fromGraphql', () => {
  const c = Currency.fromGraphql('1500000000');
  assert.equal(c.nanomina(), 1_500_000_000n);
  assert.equal(c.mina(), '1.500000000');
});

test('toNanominaStr', () => {
  assert.equal(Currency.fromMina('3').toNanominaStr(), '3000000000');
});

test('toString matches mina()', () => {
  const c = Currency.fromNanomina(1n);
  assert.equal(c.toString(), '0.000000001');
});

test('addition', () => {
  const a = Currency.fromMina('1');
  const b = Currency.fromMina('2');
  assert.equal(a.add(b).nanomina(), 3_000_000_000n);
});

test('subtraction', () => {
  const a = Currency.fromMina('3');
  const b = Currency.fromMina('1');
  assert.equal(a.sub(b).nanomina(), 2_000_000_000n);
});

test('subtraction underflow throws', () => {
  const a = Currency.fromMina('1');
  const b = Currency.fromMina('2');
  assert.throws(() => a.sub(b), CurrencyUnderflowError);
});

test('multiplication by scalar', () => {
  const c = Currency.fromMina('2');
  assert.equal(c.mul(3).nanomina(), 6_000_000_000n);
});

test('compare', () => {
  const a = Currency.fromMina('1');
  const b = Currency.fromMina('2');
  assert.equal(a.compare(b), -1);
  assert.equal(b.compare(a), 1);
  assert.equal(a.compare(a), 0);
});

test('equals across constructors', () => {
  const a = Currency.fromMina('1');
  const b = Currency.fromNanomina(1_000_000_000n);
  const c = Currency.fromGraphql('1000000000');
  assert.ok(a.equals(b));
  assert.ok(b.equals(c));
});

test('rejects too many decimal places', () => {
  assert.throws(() => Currency.fromMina('1.0000000001'), InvalidCurrencyError);
});

test('rejects invalid format', () => {
  assert.throws(() => Currency.fromMina('abc'), InvalidCurrencyError);
  assert.throws(() => Currency.fromMina(''), InvalidCurrencyError);
  assert.throws(() => Currency.fromGraphql('not_a_number'), InvalidCurrencyError);
});

test('rejects negative input', () => {
  assert.throws(() => Currency.fromMina('-1'), InvalidCurrencyError);
  assert.throws(() => Currency.fromNanomina(-1n), InvalidCurrencyError);
});

test('zero currency', () => {
  const c = Currency.fromNanomina(0n);
  assert.equal(c.mina(), '0.000000000');
  assert.equal(c.toNanominaStr(), '0');
});

test('large value preserves precision via bigint', () => {
  // ~1B MINA — would overflow Number
  const c = Currency.fromMina('1000000000');
  assert.equal(c.nanomina(), 1_000_000_000_000_000_000n);
});
