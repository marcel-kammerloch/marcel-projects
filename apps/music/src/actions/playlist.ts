"use server";

import prisma from "@/lib/prisma";
import { validateAccess } from "@repo/auth";
import { cacheTag, updateTag } from "next/cache";

export async function getPlaylists() {
  const hasAccess = await validateAccess({ scope: "music" });

  if (!hasAccess) return { data: null, error: "Forbidden" };

  return getPlaylistsCached();
}

async function getPlaylistsCached() {
  "use cache";
  cacheTag("music:playlists");

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
  // const hasAccess = await validateAccess({ scope: "music" });

  // if (!hasAccess) return { data: null, error: "Forbidden" };

  return getPlaylistCached(id);
}

async function getPlaylistCached(id: string) {
  "use cache";
  cacheTag(`music:playlist:${id}`, "music:playlists");

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

    updateTag("music:playlists");

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

    updateTag("music:playlists");
    updateTag(`music:playlist:${id}`);

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

    updateTag("music:playlists");
    updateTag(`music:playlist:${playlistId}`);

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

    updateTag("music:playlists");
    updateTag(`music:playlist:${playlistId}`);

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

    updateTag("music:playlists");
    updateTag(`music:playlist:${id}`);

    return { data: playlist, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}
