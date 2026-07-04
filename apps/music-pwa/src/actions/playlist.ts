"use server";

import prisma from "@/lib/prisma";
import { validateAccess } from "@repo/auth";
import { revalidatePath } from "next/cache";

export async function getPlaylists() {
  const hasAccess = await validateAccess({ scope: "music-pwa" });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        songs: {
          include: { song: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const mapped = playlists.map((p) => ({
      ...p,
      songs: p.songs.map((ps) => ps.song),
    }));
    return { data: mapped, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function getPlaylist(id: string) {
  const hasAccess = await validateAccess({ scope: "music-pwa" });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          include: { song: true },
          orderBy: { order: "asc" },
        },
      },
    });
    if (!playlist) return { data: null, error: "Not found" };
    const mapped = {
      ...playlist,
      songs: playlist.songs.map((ps) => ps.song),
    };
    return { data: mapped, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createPlaylist(name: string) {
  const hasAccess = await validateAccess({ admin: true });

  if (!hasAccess) return { data: null, error: "Forbidden" };

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

export async function renamePlaylist(id: string, name: string) {
  const hasAccess = await validateAccess({ admin: true });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  try {
    const playlist = await prisma.playlist.update({
      where: { id },
      data: { name },
    });
    revalidatePath("/");
    revalidatePath("/playlists");
    revalidatePath(`/playlist/${id}`);
    return { data: playlist, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function addSongToPlaylist(playlistId: string, songId: string) {
  const hasAccess = await validateAccess({ admin: true });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  try {
    const currentMax = await prisma.playlistSong.aggregate({
      where: { playlistId },
      _max: { order: true },
    });
    const nextOrder = (currentMax._max.order ?? -1) + 1;

    await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
        order: nextOrder,
      },
    });

    revalidatePath("/");
    revalidatePath(`/playlist/${playlistId}`);
    return { error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function removeSongFromPlaylist(
  playlistId: string,
  songId: string,
) {
  const hasAccess = await validateAccess({ admin: true });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  try {
    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });

    revalidatePath("/");
    revalidatePath(`/playlist/${playlistId}`);
    return { error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function deletePlaylist(id: string) {
  const hasAccess = await validateAccess({ admin: true });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  try {
    const playlist = await prisma.playlist.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/playlists");
    return { data: playlist, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}
