import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { courses, lessons, modules, notes } from "~/db/schema";
import type { Db } from "~/lib/comments.server";

// ─── Notes ───
// A Student's own writing about a Lesson, private to the Student who wrote it.
// See GLOSSARY.md. One per Student per Lesson, held by the unique index on
// (user_id, lesson_id).
//
// Only the owning Student's Lesson page and Saved page may read Note bodies.
// No Instructor or Platform Admin view calls into this module.
//
// Every function takes the database first, so tests can hand in an in-memory
// one. Callers check content access before they call in.

export const MAX_NOTE_LENGTH = 2000;

/** Plain text, trimmed. Shared by the form schema and saveNote. */
export const noteBodySchema = z
  .string()
  .trim()
  .min(1, "Write something before you save your note.")
  .max(
    MAX_NOTE_LENGTH,
    `A note must be ${MAX_NOTE_LENGTH.toLocaleString("en-US")} characters or fewer.`
  );

type Note = typeof notes.$inferSelect;

export function getNote(db: Db, userId: number, lessonId: number) {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.lessonId, lessonId)))
    .get();
}

export type SaveNoteResult =
  { ok: true; note: Note } | { ok: false; error: string };

/** Creates the Student's Note on the Lesson, or replaces its body and moves `updatedAt` on. */
export function saveNote(
  db: Db,
  userId: number,
  lessonId: number,
  body: string,
  now: Date
): SaveNoteResult {
  const parsed = noteBodySchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const at = now.toISOString();
  const note = db
    .insert(notes)
    .values({
      userId,
      lessonId,
      body: parsed.data,
      createdAt: at,
      updatedAt: at,
    })
    .onConflictDoUpdate({
      target: [notes.userId, notes.lessonId],
      set: { body: parsed.data, updatedAt: at },
    })
    .returning()
    .get();

  return { ok: true, note };
}

/** The Student's Notes, most recently edited first, each with the Lesson and Course it belongs to. */
export function listNotes(db: Db, userId: number) {
  return db
    .select({
      id: notes.id,
      body: notes.body,
      updatedAt: notes.updatedAt,
      lessonId: lessons.id,
      lessonTitle: lessons.title,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    })
    .from(notes)
    .innerJoin(lessons, eq(lessons.id, notes.lessonId))
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, modules.courseId))
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.updatedAt), desc(notes.id))
    .all();
}
