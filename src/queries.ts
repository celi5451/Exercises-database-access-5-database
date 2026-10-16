// Tasks 2 and 3 - queries against the real database (lesson Queries and
// typed results)
//
// Three rules for every query in this file.
//
// 1. Values go in as $1, $2, never joined into the SQL text. Building SQL by
//    joining strings is also a security risk, which the security section of
//    the course covers. Here, simply always use parameters.
//
// 2. Column names must be renamed in the query. The database has dept_name
//    and tot_cred; our TypeScript has deptName. The double quotes are
//    required, or PostgreSQL folds the alias to lower case:
//
//        SELECT dept_name AS "deptName" FROM instructor
//
// 3. numeric columns arrive as strings, because a numeric can be larger than
//    a JavaScript number. salary and budget are numeric, so cast them in the
//    query: salary::float8 AS salary. The same goes for count(*)::int.

import { pool } from './db.js';

export interface Department {
  deptName: string;
  building: string;
  budget: number;
}

export interface Instructor {
  id: string;
  name: string;
  deptName: string;
  salary: number;
}

export interface StaffCount {
  deptName: string;
  staff: number;
}

// --- 2a. Reading ----------------------------------------------------------

/** Every department, ordered by name. */
export async function listDepartments(): Promise<Department[]> {
  const { rows } = await pool.query<Department>(
    `SELECT dept_name AS "deptName", building, budget 
    FROM department 
    ORDER BY dept_name`
  );
  return rows;
}
/** One instructor, or undefined when there is no such id. */
export async function findInstructor(id: string): Promise<Instructor | undefined> {
  const { rows } = await pool.query<Instructor>(
    `SELECT id, name, dept_name AS "deptName", salary 
    FROM instructor 
    WHERE id = $1`, // first argument: the SQL
    [id]  // second argument: the values
  );
  return rows.length > 0 ? rows[0] : undefined;
}

/** The instructors of one department, ordered by name. */
export async function instructorsIn(deptName: string): Promise<Instructor[]> {
  const { rows } = await pool.query<Instructor>(
    `SELECT id, name, dept_name AS "deptName", salary 
    FROM instructor
    WHERE dept_name = $1 
    ORDER BY name`,
    [deptName]
  );
  return rows;
}

// --- 2b. Aggregating ------------------------------------------------------

/**
 * How many instructors each department has, ordered by department name.
 * Departments with nobody may be left out.
 *
 * count(*) comes back as a string unless you cast it: count(*)::int
 */
export async function staffCount(): Promise<StaffCount[]> {
  const { rows } = await pool.query<StaffCount>(
    `SELECT dept_name AS "deptName", 
    COUNT(*)::int AS staff 
    FROM instructor 
    GROUP BY dept_name 
    ORDER BY dept_name`
  );
  return rows;
}

// --- 3. A join ------------------------------------------------------------

/**
 * Every instructor with the building their department sits in, ordered by
 * instructor name: { name: 'Brandt', building: 'Taylor' }, ...
 *
 * Two tables, joined on dept_name.
 */
export async function instructorsWithBuilding(): Promise<{ name: string; building: string }[]> {
  const { rows } = await pool.query<{ name: string; building: string }>(
    `SELECT i.name,d.building 
    FROM instructor i 
    JOIN department d 
    ON i.dept_name = d.dept_name 
    ORDER BY i.name`
  );
  return rows;
}

// --- 4. Writing -----------------------------------------------------------

/**
 * Adds an instructor and returns the row the database stored.
 * Use RETURNING rather than a second query.
 */
export async function insertInstructor(instructor: Instructor): Promise<Instructor> {
  const { rows } = await pool.query<Instructor>(
    `INSERT INTO instructor (id, name, dept_name, salary)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, dept_name AS "deptName", salary`,
    [instructor.id, instructor.name, instructor.deptName, instructor.salary]
  );
  return rows[0];
}

/**
 * Gives an instructor a raise and returns the updated row, or undefined when
 * there is no such instructor.
 */
export async function raiseSalary(id: string, amount: number): Promise<Instructor | undefined> {
    const { rows } = await pool.query<Instructor>(
      `UPDATE instructor
       SET salary = salary + $2
       WHERE id = $1
       RETURNING id, name, dept_name AS "deptName", salary`,
      [id, amount]
    );
    return rows.length > 0 ? rows[0] : undefined;
}

/**
 * Deletes an instructor. True when a row went, false when there was nothing
 * to delete. The query result tells you how many rows it touched.
 */
export async function deleteInstructor(id: string): Promise<boolean> {
    const { rows } = await pool.query<Instructor>(
      `DELETE FROM instructor WHERE id = $1
       RETURNING id, name, dept_name AS "deptName", salary`, 
       [id]
      );
    return rows.length > 0; 
}
