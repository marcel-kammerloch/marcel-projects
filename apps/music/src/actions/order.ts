"use server";

import prisma from "@/lib/prisma";
import { validateAccess } from "@repo/auth";
import { revalidatePath } from "next/cache";

export async function reorderSongs(songIds: string[]) {
  const hasAccess = await validateAccess({ admin: true });

  if (!hasAccess) return { success: false, error: "Forbidden" };

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
  const hasAccess = await validateAccess({ admin: true });

  if (!hasAccess) return { success: false, error: "Forbidden" };

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
