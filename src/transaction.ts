// Task 6 - a transaction (lesson Queries and typed results)
//
// Two writes that must agree. Moving money from one department to another is
// two UPDATE statements: one takes the amount off, the other adds it on. If
// the first happens and the second does not, the money has simply vanished.

import { pool } from './db.js';

/** The new budgets of both departments after a transfer. */
export interface Transfer {
  from: number;
  to: number;
}

/** Given: the budget of one department, so you can see what happened. */
export async function budgetOf(deptName: string): Promise<number | undefined> {
  const { rows } = await pool.query<{ budget: number }>(
    'SELECT budget::float8 AS budget FROM department WHERE dept_name = $1', [deptName]);
  return rows[0]?.budget;
}

/**
 * Written for you, and wrong: there is no transaction.
 *
 * Every statement sent through pool.query is committed the moment it
 * finishes. Run it with a department that does not exist as the receiver,
 * then look at the budget of the one that paid.
 */
export async function transferWithoutTransaction(
  fromDept: string, toDept: string, amount: number): Promise<Transfer> {
  const paid = await pool.query<{ budget: number }>(
    `UPDATE department SET budget = budget - $2 WHERE dept_name = $1
     RETURNING budget::float8 AS budget`, [fromDept, amount]);
  const received = await pool.query<{ budget: number }>(
    `UPDATE department SET budget = budget + $2 WHERE dept_name = $1
     RETURNING budget::float8 AS budget`, [toDept, amount]);
  if (paid.rowCount === 0 || received.rowCount === 0) {
    throw new Error('No such department');
  }
  return { from: paid.rows[0].budget, to: received.rows[0].budget };
}

/**
 * The same transfer, done properly: both updates happen, or neither does.
 *
 *     transferBudget('Music', 'Physics', 10000)   ->  { from: 70000, to: 80000 }
 *
 * - Take a client from the pool with pool.connect(). A transaction runs on
 *   one connection, and pool.query does not promise you the same one twice.
 * - BEGIN, both UPDATEs on that client, COMMIT.
 * - An UPDATE that matches no row is not an error to PostgreSQL. Check
 *   rowCount yourself, and throw an Error('No such department').
 * - On any error: ROLLBACK, then throw the error on, so the caller still
 *   learns what happened.
 * - Release the client in a finally block, or it never goes back to the pool.
 */
export async function transferBudget(
  fromDept: string, toDept: string, amount: number): Promise<Transfer> {
  // TODO
  throw new Error('not implemented');
}
