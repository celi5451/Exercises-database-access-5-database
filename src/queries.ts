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
  // TODO
  throw new Error('not implemented');
}

/** One instructor, or undefined when there is no such id. */
export async function findInstructor(id: string): Promise<Instructor | undefined> {
  // TODO
  throw new Error('not implemented');
}

/** The instructors of one department, ordered by name. */
export async function instructorsIn(deptName: string): Promise<Instructor[]> {
  // TODO
  throw new Error('not implemented');
}

// --- 2b. Aggregating ------------------------------------------------------

/**
 * How many instructors each department has, ordered by department name.
 * Departments with nobody may be left out.
 *
 * count(*) comes back as a string unless you cast it: count(*)::int
 */
export async function staffCount(): Promise<StaffCount[]> {
  // TODO
  throw new Error('not implemented');
}

// --- 3. A join ------------------------------------------------------------

/**
 * Every instructor with the building their department sits in, ordered by
 * instructor name: { name: 'Brandt', building: 'Taylor' }, ...
 *
 * Two tables, joined on dept_name.
 */
export async function instructorsWithBuilding(): Promise<{ name: string; building: string }[]> {
  // TODO
  throw new Error('not implemented');
}

// --- 4. Writing -----------------------------------------------------------

/**
 * Adds an instructor and returns the row the database stored.
 * Use RETURNING rather than a second query.
 */
export async function insertInstructor(instructor: Instructor): Promise<Instructor> {
  // TODO
  throw new Error('not implemented');
}

/**
 * Gives an instructor a raise and returns the updated row, or undefined when
 * there is no such instructor.
 */
export async function raiseSalary(id: string, amount: number): Promise<Instructor | undefined> {
  // TODO
  throw new Error('not implemented');
}

/**
 * Deletes an instructor. True when a row went, false when there was nothing
 * to delete. The query result tells you how many rows it touched.
 */
export async function deleteInstructor(id: string): Promise<boolean> {
  // TODO
  throw new Error('not implemented');
}
