"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActivityType } from "@/types";

export async function getActivities(filters?: {
  projectId?: string;
  type?: ActivityType;
  startDate?: string;
  endDate?: string;
}) {
  const supabase = await createClient();
  let q = supabase.from("activities_nvc").select("*, projects_nvc(title)").order("date", { ascending: false });

  if (filters?.projectId) q = q.eq("project_id", filters.projectId);
  if (filters?.type) q = q.eq("type", filters.type);
  if (filters?.startDate) q = q.gte("date", filters.startDate);
  if (filters?.endDate) q = q.lte("date", filters.endDate);

  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function logActivity(
  projectId: string,
  date: string,
  type: ActivityType,
  intensity: number,
  note?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("activities_nvc")
    .upsert(
      {
        user_id: user.id,
        project_id: projectId,
        date,
        type,
        intensity: Math.min(5, Math.max(1, intensity)),
        note: note || null,
      },
      { onConflict: "user_id,project_id,date,type" }
    )
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/share");
  return data;
}

export async function updateActivity(
  id: string,
  updates: { type?: ActivityType; intensity?: number; note?: string | null }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("activities_nvc")
    .update({
      ...(updates.type != null && { type: updates.type }),
      ...(updates.intensity != null && { intensity: Math.min(5, Math.max(1, updates.intensity)) }),
      ...(updates.note !== undefined && { note: updates.note || null }),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/share");
}

export async function deleteActivity(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("activities_nvc").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/share");
}
