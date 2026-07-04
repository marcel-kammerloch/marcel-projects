"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Genre } from "@db/client";
import { validateAccess } from "@repo/auth";

/**
 * Fetches songs for a given genre, ordered by GenreSong.order.
 * If a song in this genre doesn't have a GenreSong row yet (e.g. newly uploaded),
 * we auto-initialize all missing rows using Song.order so existing users keep
 * their current ordering context.
 */
export async function getGenreSongs(genre: Genre) {
  const hasAccess = validateAccess({ scope: "music-pwa" });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  try {
    // Find all songs of this genre
    const allSongs = await prisma.song.findMany({
      where: { genre },
      orderBy: { order: "asc" },
    });

    if (allSongs.length === 0) {
      return { data: [], error: null };
    }

    // Find existing GenreSong rows
    const existing = await prisma.genreSong.findMany({
      where: { genre },
      select: { songId: true },
    });
    const existingIds = new Set(existing.map((gs) => gs.songId));

    // Initialize missing rows
    const missing = allSongs.filter((s) => !existingIds.has(s.id));
    if (missing.length > 0) {
      await prisma.$transaction(
        missing.map((s) =>
          prisma.genreSong.create({
            data: { genre, songId: s.id, order: s.order },
          }),
        ),
      );
    }

    // Fetch ordered songs via GenreSong
    const genreSongs = await prisma.genreSong.findMany({
      where: { genre },
      orderBy: { order: "asc" },
      include: { song: true },
    });

    return { data: genreSongs.map((gs) => gs.song), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Persists a new GenreSong order after drag-and-drop reordering.
 * Does NOT modify Song.order (the global songs-page order).
 */
export async function reorderGenreSongs(genre: Genre, songIds: string[]) {
  const hasAccess = validateAccess({ admin: true });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  try {
    await prisma.$transaction(
      songIds.map((id, index) =>
        prisma.genreSong.update({
          where: { genre_songId: { genre, songId: id } },
          data: { order: index },
        }),
      ),
    );

    revalidatePath(`/genre/${genre.toLowerCase()}`);
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
