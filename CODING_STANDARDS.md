# Coding standards

## Fail with a thrown response, not a return value

A loader or an action that cannot continue throws. It does not return an
error shape for the component to unpack.

```ts
if (!course) throw data("Course not found", { status: 404 });
```

The route then has one success path. A returned error shape gives every
component a second path to forget about.

## Parse untrusted input with a schema

Form data, search parameters and request bodies get a zod schema before the
values reach any query. Do not read `formData.get("x") as string`. The cast
is a lie the type checker believes.

## Check content access in every action intent

An intent that reads or writes a Course's content calls
`requireContentAccess` itself. Loader guards do not protect actions. Check
the Course the target record really belongs to, not only the Course in the
URL: a Lesson id from another Course must 404.

## Keep domain rules in a service module

Business rules live in `app/lib/<concept>.server.ts`, take the database as
the first parameter and the time as a `Date`, and have a
`<concept>.server.test.ts` against `createTestDb`. Routes parse input, check
access, call the service and render. Model: `app/lib/comments.server.ts`.

## Load a list with joins, one query per list

A list that needs data from related tables joins them in one query. A query
inside a `.map` over rows is a defect.

## A comment says what the code does

A comment states intent or a reason the code cannot show. A comment that
disagrees with the code below it is a defect, as bad as a wrong line of
code. A limit lives in one named constant that the schema, the service and
the message all read.

## Do not write `any`, and do not write `!`

Both switch the type checker off at the exact point you are least sure. If a
value can be missing, narrow it with a check. If you cannot name the type,
the shape is wrong — fix the shape.
