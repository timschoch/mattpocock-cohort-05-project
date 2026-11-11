import { Link } from "react-router";
import type { Route } from "./+types/saved";
import { db } from "~/db";
import { requireUserId } from "~/lib/access.server";
import { listBookmarks } from "~/lib/bookmarks.server";
import { listNotes } from "~/lib/notes.server";
import { Card, CardContent } from "~/components/ui/card";
import { Bookmark, NotebookPen } from "lucide-react";
import { formatRelativeTime } from "~/lib/utils";

export function meta() {
  return [
    { title: "Saved — Cadence" },
    { name: "description", content: "Your bookmarks and notes" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  return {
    bookmarks: listBookmarks(db, userId),
    notes: listNotes(db, userId),
  };
}

export default function Saved({ loaderData }: Route.ComponentProps) {
  const { bookmarks, notes } = loaderData;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Saved</h1>
        <p className="text-sm text-muted-foreground">
          The lessons you flagged, and what you wrote about them.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Bookmark className="size-4 text-muted-foreground" />
            Bookmarks
          </h2>

          {bookmarks.length === 0 ? (
            <EmptyList>No bookmarks yet.</EmptyList>
          ) : (
            <div className="space-y-2">
              {bookmarks.map((bookmark) => (
                <Card key={bookmark.id}>
                  <CardContent className="space-y-1 py-3">
                    <LessonLink row={bookmark} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <NotebookPen className="size-4 text-muted-foreground" />
            Notes
          </h2>

          {notes.length === 0 ? (
            <EmptyList>No notes yet.</EmptyList>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="space-y-1 py-3">
                    <LessonLink row={note} />
                    <p className="whitespace-pre-wrap text-sm">{note.body}</p>
                    <p
                      suppressHydrationWarning
                      className="text-xs text-muted-foreground"
                    >
                      Edited {formatRelativeTime(note.updatedAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyList({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="py-8 text-center text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

function LessonLink({
  row,
}: {
  row: {
    lessonId: number;
    lessonTitle: string;
    courseTitle: string;
    courseSlug: string;
  };
}) {
  return (
    <>
      <Link
        to={`/courses/${row.courseSlug}/lessons/${row.lessonId}`}
        className="text-sm font-medium hover:underline"
      >
        {row.lessonTitle}
      </Link>
      <p className="text-xs text-muted-foreground">{row.courseTitle}</p>
    </>
  );
}
