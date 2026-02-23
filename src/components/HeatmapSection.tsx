"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heatmap } from "@/components/Heatmap";
import { DayDetailModal } from "@/components/DayDetailModal";
import type { Activity, DayActivity } from "@/types";

export function HeatmapSection({
  dayActivities,
  activities,
  projectTitles,
  startDate,
  endDate,
}: {
  dayActivities: Record<string, DayActivity>;
  activities: Activity[];
  projectTitles: Record<string, string>;
  startDate: string;
  endDate: string;
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const activitiesByDate = activities.reduce<Record<string, Activity[]>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {});

  const handleCellClick = (date: string) => {
    const dayActs = activitiesByDate[date];
    if (dayActs && dayActs.length > 0) {
      setSelectedDate(date);
    } else {
      router.push(`/dashboard?date=${date}`);
    }
  };

  const handleAddActivity = () => {
    if (selectedDate) {
      router.push(`/dashboard?date=${selectedDate}`);
      setSelectedDate(null);
    }
  };

  return (
    <>
      <Heatmap
        dayActivities={dayActivities}
        startDate={startDate}
        endDate={endDate}
        variant="default"
        activitiesByDate={activitiesByDate}
        onCellClick={handleCellClick}
      />
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          activities={activitiesByDate[selectedDate] ?? []}
          projectTitles={projectTitles}
          onClose={() => setSelectedDate(null)}
          onAddActivity={handleAddActivity}
        />
      )}
    </>
  );
}
