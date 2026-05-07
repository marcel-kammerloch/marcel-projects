"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function reorderSongs(songIds: string[]) {
  try {
    // Transaction to update all songs with their new order
    await prisma.$transaction(
      songIds.map((id, index) =>
        prisma.song.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    revalidatePath("/");
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reorderPlaylistSongs(
  playlistId: string,
  songIds: string[],
) {
  try {
    // Transaction to update all playlist songs with their new order
    await prisma.$transaction(
      songIds.map((id, index) =>
        prisma.playlistSong.update({
          where: { playlistId_songId: { playlistId, songId: id } },
          data: { order: index },
        }),
      ),
    );

    revalidatePath(`/playlist/${playlistId}`);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
