/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { createHash } from "crypto";
import stringify from "json-stable-stringify";
import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";

export interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  clear(): Promise<void>;
}

export interface CacheManager {
  getCache(model: object): Cache;
}

export class SQLiteCache implements Cache {
  private dbPromise: Promise<Database>;
  private tableName: string;

  constructor(model: object, dbPromise: Promise<Database>) {
    const hash = createHash("md5");
    hash.update(stringify(model));
    this.tableName = "cache_" + hash.digest("hex");

    this.dbPromise = this.createTable(dbPromise);
  }

  async createTable(dbPromise: Promise<Database>): Promise<Database> {
    const db = await dbPromise;
    await db.run(
      `CREATE TABLE IF NOT EXISTS ${this.tableName}(key TEXT PRIMARY KEY, value TEXT)`
    );
    return db;
  }

  async get(key: string): Promise<string | null> {
    const db = await this.dbPromise;
    const row = await db.all(
      `SELECT value FROM ${this.tableName} WHERE key = ?`,
      [key]
    );
    return row.length ? row[0].value : null;
  }

  async set(key: string, value: string): Promise<void> {
    const db = await this.dbPromise;
    await db.run(
      `INSERT OR REPLACE INTO ${this.tableName}(key, value) VALUES (?, ?)`,
      [key, value]
    );
  }

  async clear(): Promise<void> {
    const db = await this.dbPromise;
    await db.run(`DELETE FROM ${this.tableName}`);
  }
}

export class SQLiteCacheManager implements CacheManager {
  private dbPromise: Promise<Database>;

  constructor(path: string) {
    this.dbPromise = open({
      filename: path,
      driver: sqlite3.Database,
    });
  }

  getCache(model: object): Cache {
    return new SQLiteCache(model, this.dbPromise);
  }
}
