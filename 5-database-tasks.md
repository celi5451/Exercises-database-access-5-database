# Exercises: database access

Complex IT Systems – Theory E2026 (40417)
Section 2 - backend development

Lessons: Connecting to PostgreSQL, Queries and typed results.

This is where your code first talks to a real database. Task 1 must work
before anything else will, so start there and ask early if it does not.

---

## Before you start

**Install PostgreSQL and pgAdmin** from postgresql.org, and remember the
password you choose for the `postgres` user. Do this at home, before the
session: an installer that goes wrong costs an hour you would rather spend on
the exercises. If it does go wrong, bring it to the exercises and we will fix
it together.

**Create the database and load the schema.** In pgAdmin, create a database
called `university`, open the Query Tool on it, open `university_database.sql`
from this folder, and run it. Then check:

```sql
select count(*) from instructor;   -- 12
select count(*) from department;   -- 7
```

---

## Task 1 – Reach the database from Node.js

Copy `.env.example` to `.env` and put your own password in it:

```
PGHOST=localhost
PGPORT=5432
PGDATABASE=university
PGUSER=postgres
PGPASSWORD=your password here
```

`.env` is in `.gitignore` and must stay there: a password committed once
stays in the history even after you delete it.

Then:

```
npm install
npm run build
npm run ping
```

Expected: `Connected. The student table has 13 rows.`

If it fails, read the message rather than guessing. "password authentication
failed" is a wrong password, "ECONNREFUSED" means nothing is listening, and
"database ... does not exist" means the database was never created.

`src/db.ts` is worth reading while you are here. The pool is created **once**
and imported everywhere. It hands out connections, takes them back, and
keeps a small number of them open, because opening a connection per query is
slow.

---

## Task 2 – Queries with parameters and typed results

`src/queries.ts`, then uncomment the blocks in `src/index.ts` and run
`npm start`.

Every function in this task and the next must pass values to the database as
parameters (`$1`, `$2`), never inside the SQL text. The objects it returns
must match the interfaces at the top of the file: property names such as
`deptName`, not `dept_name`, and numbers as numbers, not strings.

**2a Reading**

- `listDepartments()` returns every department, ordered by name.
- `findInstructor(id)` returns one instructor, or `undefined` when there is
  no instructor with that id.
- `instructorsIn(deptName)` returns the instructors of one department,
  ordered by name, or an empty array when there are none.

Example: `listDepartments()` returns 7 departments, the first being Biology.
`findInstructor('99999')` returns `undefined`. `instructorsIn('Comp. Sci.')`
returns Brandt, Katz and Srinivasan.

**2b `staffCount()`**

Write a function that returns how many instructors each department has,
ordered by department name, as `{ deptName, staff }` objects where `staff` is
a number. Departments with no instructors may be left out.

Example: the first entry is `{ deptName: 'Biology', staff: 1 }`, and Comp.
Sci. has 3.

---

## Task 3 – A join

Write `instructorsWithBuilding()`, which returns the name of every instructor
together with the building of the instructor's department, ordered by
instructor name.

Example: the first entry is `{ name: 'Brandt', building: 'Taylor' }`.

---

## Task 4 – Writing

- `insertInstructor(instructor)` adds an instructor and returns the
  instructor as the database stored it, without running a second query.
- `raiseSalary(id, amount)` raises an instructor's salary by the amount and
  returns the updated instructor, or `undefined` when there is no instructor
  with that id.
- `deleteInstructor(id)` deletes an instructor and returns `true`, or `false`
  when there was nothing to delete.

Example: after inserting Nobody with salary 50000, `raiseSalary('99999',
5000)` returns Nobody with salary 55000. Deleting 99999 returns `true` the
first time and `false` the second.

The three blocks in `index.ts` belong together: the delete puts the database
back as it was, so you can run the file as often as you like.

---

## Task 5 – Your first routine in the database

`functions.sql`, then the Task 5 block in `src/index.ts`.

Write the SQL function `danish_grade(letter)`, which converts a grade from
the American letter scale this database uses to the Danish 7-point scale.
The full conversion table is in `functions.sql`. `NULL`, or any letter not in
the table, gives `NULL`. Create the function in the `university` database
with pgAdmin, test it there, and then run the Task 5 block.

Example: `danish_grade('A')` returns `'12'`, `danish_grade('C-')` returns
`'02'`, and `danish_grade(NULL)` returns `NULL`.

The assignment calls this function in every query that returns a grade, so
it must work before you start the assignment.

---

## Task 6 – A transaction

`src/transaction.ts`, then the Task 6 block in `src/index.ts`.

**6a** `transferWithoutTransaction`, already written, moves money from one
department's budget to another's. Run the Task 6 block, which sends money
from Music to `Nursing`, a department that does not exist. Find out what
happens to the budget of Music, and why.

**6b** Write `transferBudget(fromDept, toDept, amount)`, which moves the
amount from one department's budget to the other's and returns both new
budgets as `{ from, to }`. Either both budgets change, or neither does. When
either department does not exist, the function fails with the error "No such
department", and no budget has changed.

Example: `transferBudget('Music', 'Physics', 10000)` returns `{ from: 70000,
to: 80000 }`. `transferBudget('Music', 'Nursing', 10000)` fails, and Music
still has 80000.

The block in `index.ts` puts every budget back as it was, so you can run it
as often as you like.

---

## If you finish early

- Ask for an instructor that does not exist, and make `findInstructor` throw
  instead of returning `undefined`. Which do you prefer here, and why?
- `instructorsIn` orders by name. Add a second parameter for the order, and
  notice what you cannot do with `$1`: a parameter can be a value, never a
  column name. How would you solve that safely?
- Run `insertInstructor` twice with the same id. Read the error message, and
  find the `code` property on the error object. What would a Web API do with
  that?
- Transfer 80000 from `Music`, which has exactly 80000. Which error do you
  get, and what is its `code`? Look at the `department` table in
  `university_database.sql` to see why.
- Leave out `client.release()` and call `transferBudget` eleven times in a
  loop. What happens, and why at that number?
- Open pgAdmin and write the same queries there. Which is quicker for trying
  things out, and which one do you want in your program?

---

## Reference

- **[PG]** node-postgres: Getting started, Queries, Pooling, Data types,
  Transactions
- **[TS]** The TypeScript Handbook: Generics (the `pool.query<T>` form)
