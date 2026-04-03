"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import type { Genre } from "../../prisma/generated/client";

export async function getSongs() {
  try {
    const songs = await prisma.song.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { data: songs, error: null };
  } catch (error: unknown) {
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
  try {
    const song = await prisma.song.create({
      data: {
        ...data,
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
