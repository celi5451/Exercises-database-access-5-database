// The entry point. Build and run with:
//
//     npm run build
//     npm start
//
// npm start passes your .env to Node, so the pool finds the database.
// Uncomment each block as you get to it.

import { pool } from './db.js';
import {
  listDepartments, findInstructor, instructorsIn, staffCount,
  instructorsWithBuilding, insertInstructor, raiseSalary, deleteInstructor,
} from './queries.js';
import { budgetOf, transferWithoutTransaction, transferBudget } from './transaction.js';

// --- 2a: reading ---
console.log((await listDepartments()).length);                 // 7
console.log((await listDepartments())[0]);
//   { deptName: 'Biology', building: 'Watson', budget: 90000 }
console.log(await findInstructor('22222'));
//   { id: '22222', name: 'Einstein', deptName: 'Physics', salary: 95000 }
console.log(await findInstructor('99999'));                    // undefined
console.log((await instructorsIn('Comp. Sci.')).map(i => i.name));
//   [ 'Brandt', 'Katz', 'Srinivasan' ]
console.log(await instructorsIn('Nursing'));                   // []

// --- 2b: aggregating ---
console.log(await staffCount());
//   [ { deptName: 'Biology', staff: 1 }, { deptName: 'Comp. Sci.', staff: 3 }, ... ]
console.log(typeof (await staffCount())[0].staff);             // number, not string

// --- 3: a join ---
console.log((await instructorsWithBuilding())[0]);
//   { name: 'Brandt', building: 'Taylor' }

// --- 4: writing ---
// The three of these belong together: the last one puts the database back
// the way it was, so you can run this file as often as you like.
const added = await insertInstructor(
  { id: '99999', name: 'Nobody', deptName: 'Music', salary: 50000 });
console.log(added);
//   { id: '99999', name: 'Nobody', deptName: 'Music', salary: 50000 }
console.log(await raiseSalary('99999', 5000));
//   { id: '99999', name: 'Nobody', deptName: 'Music', salary: 55000 }
console.log(await raiseSalary('00000', 5000));                 // undefined
console.log(await deleteInstructor('99999'));                  // true
console.log(await deleteInstructor('99999'));                  // false

// --- 5: your own function in the database ---
// Write danish_grade in functions.sql first, in pgAdmin.
// const { rows } = await pool.query(
//   `SELECT danish_grade('A')  AS a,
//           danish_grade('C-') AS c_minus,
//           danish_grade('F')  AS f,
//           danish_grade(NULL) AS nothing`);
// console.log(rows[0]);
//   { a: '12', c_minus: '02', f: '00', nothing: null }
//
// Calling a function you wrote is an ordinary query. Nothing about it is
// special from here, which is the point.

// --- 6: a transaction ---
// Music starts with 80000 and Physics with 70000. Nursing does not exist, so
// a transfer to it fails on the second UPDATE, after the first has run.
//
// Without a transaction first:
// try {
//   await transferWithoutTransaction('Music', 'Nursing', 10000);
// } catch (err) {
//   console.log('caught:', (err as Error).message);              // No such department
// }
// console.log(await budgetOf('Music'));                           // 70000: the money is gone
// await pool.query("UPDATE department SET budget = 80000 WHERE dept_name = 'Music'");
//
// Now yours, with the same failure:
// try {
//   await transferBudget('Music', 'Nursing', 10000);
// } catch (err) {
//   console.log('caught:', (err as Error).message);              // No such department
// }
// console.log(await budgetOf('Music'));                           // 80000: rolled back
//
// And one that works, then back again:
// console.log(await transferBudget('Music', 'Physics', 10000));  // { from: 70000, to: 80000 }
// console.log(await transferBudget('Physics', 'Music', 10000));  // { from: 70000, to: 80000 }

// The pool keeps the program alive until it is closed.
await pool.end();
