"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProjectStatus } from "@/types";

export async function getProjects(sortByIce = false) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects_nvc")
    .select("*");
  if (error) throw error;

  if (sortByIce) {
    data.sort((a, b) => {
      const scoreA = iceScore(a);
      const scoreB = iceScore(b);
      if (scoreA == null && scoreB == null) return 0;
      if (scoreA == null) return 1;
      if (scoreB == null) return -1;
      return scoreB - scoreA;
    });
  } else {
    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  return data;
}

function iceScore(p: { ice_impact?: number | null; ice_confidence?: number | null; ice_ease?: number | null }) {
  const i = p.ice_impact ?? 0;
  const c = p.ice_confidence ?? 0;
  const e = p.ice_ease ?? 0;
  if (i === 0 && c === 0 && e === 0) return null;
  return (i + c + e) / 3;
}

export async function createProject(
  title: string,
  description: string,
  status: ProjectStatus = "idea"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects_nvc")
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      status,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/dashboard");
  return data;
}

export async function updateProject(
  id: string,
  updates: {
    title?: string;
    description?: string;
    status?: ProjectStatus;
    ice_impact?: number | null;
    ice_confidence?: number | null;
    ice_ease?: number | null;
    status_note?: string | null;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects_nvc").update(updates).eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects_nvc").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/dashboard");
}
