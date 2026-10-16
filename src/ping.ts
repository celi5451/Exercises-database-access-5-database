// Task 1 check: can this program reach the database at all?
//
//     npm run build
//     npm run ping

import { pool } from './db.js';

async function main(): Promise<void> {
  try {
    const { rows } = await pool.query<{ n: string }>(
      'SELECT count(*) AS n FROM student');
    console.log(`Connected. The student table has ${rows[0].n} rows.`);
    console.log('Expected: 13');
  } catch (err) {
    console.error('Could not reach the database:');
    console.error((err as Error).message);
    console.error('\nCheck your .env file, and that PostgreSQL is running.');
  } finally {
    await pool.end();
  }
}

main();
