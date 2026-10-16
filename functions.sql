-- Task 5: your first routine in the database.
--
-- Write this in pgAdmin, against the university database, and test it there
-- before you call it from TypeScript.
--
-- Why this one
-- ------------
-- The university database stores grades on the American letter scale
-- (A, A-, B+, B, B-, C+, C, C-, F), because that is the scale it came with.
-- Everything else in this course uses the Danish 7-point scale. Rewriting
-- somebody else's data is rarely an option: other systems may depend on it.
-- So the conversion goes into the database as a function, and every query
-- that returns a grade calls it. You will use it in the assignment.
--
-- What it must do
-- ---------------
--     danish_grade('A')    ->  '12'
--     danish_grade('A-')   ->  '10'      danish_grade('B+')  ->  '10'
--     danish_grade('B')    ->  '7'       danish_grade('B-')  ->  '7'
--     danish_grade('C+')   ->  '4'       danish_grade('C')   ->  '4'
--     danish_grade('C-')   ->  '02'
--     danish_grade('F')    ->  '00'
--     danish_grade(NULL)   ->  NULL      anything else       ->  NULL
--
-- A grade that was never awarded is still not awarded after converting.
--
-- This routine only maps one value to another: it queries nothing and
-- changes nothing. So it needs no procedural language, only a CASE
-- expression, and it is written with LANGUAGE sql.
--
-- IMMUTABLE tells PostgreSQL that the answer depends on nothing but the
-- argument. The planner may then compute it once, cache it, or use it in an
-- index. Saying that about a function that reads tables would be a lie, and
-- would produce wrong answers.

CREATE OR REPLACE FUNCTION danish_grade(p_letter varchar)
RETURNS varchar
LANGUAGE sql IMMUTABLE AS $$
  -- TODO: replace this with
  --     SELECT CASE p_letter WHEN 'A' THEN '12' ... ELSE NULL END::varchar;
  SELECT NULL::varchar;
$$;

-- Test it in pgAdmin first:
--
--     SELECT danish_grade('A')   AS a,
--            danish_grade('C-')  AS c_minus,
--            danish_grade('F')   AS f,
--            danish_grade(NULL)  AS nothing,
--            danish_grade('?')   AS unknown;
--
-- Then run the Task 5 block in src/index.ts, which calls it from TypeScript.
