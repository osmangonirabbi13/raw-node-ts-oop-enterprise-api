import pg, { type QueryResult, type QueryResultRow } from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

export class Database {
  private readonly pool: pg.Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  public async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  public async healthCheck(): Promise<boolean> {
    const result = await this.query<{ ok: number }>("SELECT 1 as ok");
    return result.rows[0]?.ok === 1;
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export const db = new Database();