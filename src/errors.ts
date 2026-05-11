/**
 * Typed errors emitted by `ArchiveClient`. Match on `.name` or `instanceof`
 * for fine-grained handling.
 */

export interface GraphqlErrorEntry {
  message: string;
}

export class GraphqlError extends Error {
  override name = 'GraphqlError';
  constructor(
    public queryName: string,
    public errors: GraphqlErrorEntry[],
  ) {
    super(
      `GraphQL error in ${queryName}: ${errors.map((e) => e.message).join('; ')}`,
    );
  }
}

export class ConnectionError extends Error {
  override name = 'ConnectionError';
  constructor(
    public queryName: string,
    public attempts: number,
    public override cause: unknown,
  ) {
    super(
      `failed to execute ${queryName} after ${attempts} attempts: ${String(cause)}`,
    );
  }
}

export class HttpError extends Error {
  override name = 'HttpError';
  constructor(
    public queryName: string,
    public status: number,
    public statusText: string,
  ) {
    super(`HTTP ${status} ${statusText} in ${queryName}`);
  }
}

export class MissingFieldError extends Error {
  override name = 'MissingFieldError';
  constructor(
    public queryName: string,
    public field: string,
  ) {
    super(`missing field '${field}' in ${queryName} response`);
  }
}

export class InvalidCurrencyError extends Error {
  override name = 'InvalidCurrencyError';
  constructor(public input: string) {
    super(`invalid currency format: ${input}`);
  }
}

export class CurrencyUnderflowError extends Error {
  override name = 'CurrencyUnderflowError';
  constructor(
    public lhs: bigint,
    public rhs: bigint,
  ) {
    super(`currency underflow: ${lhs} - ${rhs} would be negative`);
  }
}
