"use client";

import { useState, useTransition } from "react";
import {
  approveUser,
  updateUserRole,
  updateUserScopes,
} from "@repo/auth/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ALL_SCOPES } from "@repo/utils";
import { useRouter } from "next/navigation";

const ROLES = ["user", "admin"];

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string | null;
  createdAt: Date;
  isApproved: boolean | null;
  scopes: string[];
};

export default function UserRow({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [selectedScopes, setSelectedScopes] = useState<string[]>(user.scopes);
  const [selectedRole, setSelectedRole] = useState<string>(user.role ?? "user");

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      if (selectedRole !== user.role && user.isApproved) {
        await updateUserRole(user.id, selectedRole);
      }
      await updateUserScopes(user.id, selectedScopes);
      setOpen(false);
      router.refresh();
    });
  };

  const handleApprove = () => {
    startTransition(async () => {
      await approveUser(user.id);
      router.refresh();
    });
  };

  return (
    <tr className="hover:bg-zinc-800/40 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-400">
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="font-medium text-zinc-100">{user.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-zinc-400 text-sm">{user.email}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === "admin"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              : "bg-zinc-700/60 text-zinc-300 border border-zinc-600/30"
          }`}
        >
          {user.role ?? "user"}
        </span>
      </td>
      <td className="px-6 py-4">
        {user.isApproved ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            Approved
          </span>
        ) : (
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
            {isPending ? "Approving..." : "Pending — Click to approve"}
          </button>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {(user.scopes ?? []).length === 0 ? (
            <span className="text-zinc-600 text-xs italic">None</span>
          ) : (
            user.scopes.map((scope) => (
              <span
                key={scope}
                className="px-2 py-0.5 bg-zinc-700/60 text-zinc-300 border border-zinc-600/30 rounded text-xs"
              >
                {scope}
              </span>
            ))
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                Edit
              </Button>
            }
          />
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-zinc-100">
                Edit User: {user.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-2">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Role
                </label>
                {!user.isApproved ? (
                  <p className="text-xs text-zinc-500 italic">
                    Approve the user first before changing their role.
                  </p>
                ) : (
                  <div className="flex gap-2">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedRole === role
                            ? "bg-purple-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Scopes */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Scopes
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SCOPES.map((scope) => {
                    const isSelected = selectedScopes.includes(scope);
                    return (
                      <button
                        key={scope}
                        onClick={() => toggleScope(scope)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}
                        {scope}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}
