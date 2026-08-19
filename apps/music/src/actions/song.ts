"use server";

import prisma from "@/lib/prisma";
import { cacheTag, updateTag } from "next/cache";
import { del } from "@vercel/blob";
import type { Genre, Song } from "@db/client";
import { validateAccess } from "@repo/auth";

type MinimalSong = Pick<Song, "id" | "title" | "artist">;

export async function getSongs(options: {
  min: true;
}): Promise<{ data: MinimalSong[] | null; error: string | null }>;
export async function getSongs(options?: {
  min?: false;
}): Promise<{ data: Song[] | null; error: string | null }>;
export async function getSongs({ min = false }: { min?: boolean } = {}) {
  // const hasAccess = await validateAccess({ scope: "music" });

  // if (!hasAccess) return { data: null, error: "Forbidden" };

  return getSongsCached({ min });
}

async function getSongsCached({ min = false }: { min?: boolean } = {}) {
  "use cache";
  cacheTag("music:library", "music:songs");

  try {
    const songs = await prisma.song.findMany({
      orderBy: { order: "asc" },
      ...(min
        ? {
            select: {
              id: true,
              title: true,
              artist: true,
            },
          }
        : {}),
    });

    return { data: songs, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createSong(data: {
  title: string;
  artist: string;
  genre: Genre;
  duration: number; // in seconds
  path: string; // the path after the Vercel Blob URL
}) {
  const hasAccess = await validateAccess({ admin: true });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  try {
    const currentMax = await prisma.song.aggregate({
      _max: { order: true },
    });
    const nextOrder = (currentMax._max.order ?? -1) + 1;

    const song = await prisma.song.create({
      data: {
        ...data,
        order: nextOrder,
      },
    });

    updateTag("music:library");
    updateTag("music:songs");
    updateTag("music:genres");

    return { data: song, error: null };
  } catch (error: unknown) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteSong(id: string) {
  const hasAccess = await validateAccess({ admin: true });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  try {
    const song = await prisma.song.findUnique({ where: { id } });
    if (song?.path) {
      await del(song.path);
    }
    await prisma.song.delete({ where: { id } });

    updateTag("music:library");
    updateTag("music:songs");
    updateTag("music:genres");

    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateSong(
  id: string,
  data: {
    title?: string;
    artist?: string;
    genre?: Genre;
    speed?: number;
  },
) {
  const hasAccess = await validateAccess({ admin: true });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  if (data.speed !== undefined) {
    if (typeof data.speed !== "number" || isNaN(data.speed)) {
      return { data: null, error: "Speed must be a number" };
    }
    if (data.speed < 0.5 || data.speed > 1.5) {
      return { data: null, error: "Speed must be between 0.50 and 1.50" };
    }
    if (Number(data.speed.toFixed(2)) !== data.speed) {
      return { data: null, error: "Speed must have at most 2 decimal places" };
    }
  }

  try {
    const song = await prisma.song.update({
      where: { id },
      data,
    });

    updateTag("music:library");
    updateTag("music:songs");
    updateTag("music:genres");

    return { data: song, error: null };
  } catch (error: unknown) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
