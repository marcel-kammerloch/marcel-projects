"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import type { Genre, Prisma, Song } from "@db/client";
import { validateAccess } from "@repo/auth";

type MinimalSong = Pick<Song, "id" | "title" | "artist">;

export async function getSongs(options: {
  min: true;
}): Promise<{ data: MinimalSong[] | null; error: string | null }>;
export async function getSongs(options?: {
  min?: false;
}): Promise<{ data: Song[] | null; error: string | null }>;
export async function getSongs({ min = false }: { min?: boolean } = {}) {
  const hasAccess = await validateAccess({ scope: "music-pwa" });

  if (!hasAccess) return { data: null, error: "Forbidden" };

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
  url: string; // Vercel Blob URL
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
    revalidatePath("/");
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
    if (song?.url) {
      await del(song.url);
    }
    await prisma.song.delete({ where: { id } });
    revalidatePath("/");
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
  },
) {
  const hasAccess = await validateAccess({ admin: true });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  try {
    const song = await prisma.song.update({
      where: { id },
      data,
    });
    revalidatePath("/");
    return { data: song, error: null };
  } catch (error: unknown) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
