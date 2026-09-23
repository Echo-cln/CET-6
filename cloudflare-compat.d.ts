/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "cloudflare:workers" {
  export const env: any;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}
interface Fetcher {
  fetch(request: Request): Promise<Response>;
}
