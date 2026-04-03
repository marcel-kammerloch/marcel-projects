"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPlaylists() {
  try {
    const playlists = await prisma.playlist.findMany({
      include: { songs: true },
      orderBy: { createdAt: "desc" },
    });
    return { data: playlists, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function getPlaylist(id: string) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: { songs: true },
    });
    return { data: playlist, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createPlaylist(name: string) {
  try {
    const playlist = await prisma.playlist.create({
      data: { name },
    });
    revalidatePath("/");
    revalidatePath("/playlists");
    return { data: playlist, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function addSongToPlaylist(playlistId: string, songId: string) {
  try {
    const playlist = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        songs: {
          connect: { id: songId },
        },
      },
      include: { songs: true }
    });
    revalidatePath("/");
    revalidatePath(`/playlist/${playlistId}`);
    return { data: playlist, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function removeSongFromPlaylist(playlistId: string, songId: string) {
  try {
    const playlist = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        songs: {
          disconnect: { id: songId },
        },
      },
      include: { songs: true }
    });
    revalidatePath("/");
    revalidatePath(`/playlist/${playlistId}`);
    return { data: playlist, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}
