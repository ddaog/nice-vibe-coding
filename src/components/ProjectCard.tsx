"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { updateProject, deleteProject } from "@/lib/actions/projects";
import { useTranslations } from "next-intl";
import type { Project, Activity } from "@/types";
import type { ProjectStatus } from "@/types";
import { computeIceScore, ICE_VALUES, roundToNearestIceValue, scoreToLevel } from "@/types";

const STATUS_COLORS: Record<ProjectStatus, string> = {
  idea: "bg-zinc-600",
  building: "bg-emerald-600",
  blocked: "bg-amber-600",
  launched: "bg-blue-600",
};

const STATUSES: ProjectStatus[] = ["idea", "building", "blocked", "launched"];

export function ProjectCard({
  project,
  activities = [],
  onUpdate,
}: {
  project: Project;
  activities?: Activity[];
  onUpdate?: () => void;
}) {
  const router = useRouter();
  const t = useTranslations("projectCard");
  const tCreate = useTranslations("createProject");
  const tIce = useTranslations("ice");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [iceImpact, setIceImpact] = useState<number | null>(
    project.ice_impact != null ? roundToNearestIceValue(project.ice_impact) : null
  );
  const [iceConfidence, setIceConfidence] = useState<number | null>(
    project.ice_confidence != null ? roundToNearestIceValue(project.ice_confidence) : null
  );
  const [iceEase, setIceEase] = useState<number | null>(
    project.ice_ease != null ? roundToNearestIceValue(project.ice_ease) : null
  );
  const [statusNote, setStatusNote] = useState(project.status_note ?? "");
  const [statusNoteEditing, setStatusNoteEditing] = useState(false);
  const [iceOpen, setIceOpen] = useState(false);
  const iceTriggerRef = useRef<HTMLButtonElement>(null);
  const statusNoteInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().slice(0, 10);
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const rangeDays = 28;
  const rangeStart = daysAgo(rangeDays - 1);
  const recentActivityDates = new Set(
    activities.filter((a) => a.date >= rangeStart && a.date <= today).map((a) => a.date)
  );

  useEffect(() => {
    if (statusNoteEditing) statusNoteInputRef.current?.focus();
  }, [statusNoteEditing]);

  useEffect(() => {
    setTitle(project.title);
    setDescription(project.description ?? "");
    setStatus(project.status);
    setStatusNote(project.status_note ?? "");
    setIceImpact(project.ice_impact != null ? roundToNearestIceValue(project.ice_impact) : null);
    setIceConfidence(project.ice_confidence != null ? roundToNearestIceValue(project.ice_confidence) : null);
    setIceEase(project.ice_ease != null ? roundToNearestIceValue(project.ice_ease) : null);
  }, [project.id, project.title, project.description, project.status, project.status_note, project.ice_impact, project.ice_confidence, project.ice_ease]);

  const handleSave = async () => {
    await updateProject(project.id, {
      title,
      description,
      status,
      ice_impact: iceImpact,
      ice_confidence: iceConfidence,
      ice_ease: iceEase,
      status_note: statusNote.trim() || null,
    });
    setEditing(false);
    onUpdate?.();
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    setStatus(newStatus);
    await updateProject(project.id, { status: newStatus });
    router.refresh();
    onUpdate?.();
  };

  const handleStatusNoteSave = async () => {
    const trimmed = statusNote.trim() || null;
    await updateProject(project.id, { status_note: trimmed });
    setStatusNoteEditing(false);
    router.refresh();
    onUpdate?.();
  };

  const handleIceChange = async (impact: number | null, confidence: number | null, ease: number | null) => {
    setIceImpact(impact);
    setIceConfidence(confidence);
    setIceEase(ease);
    await updateProject(project.id, {
      ice_impact: impact,
      ice_confidence: confidence,
      ice_ease: ease,
    });
    router.refresh();
    onUpdate?.();
  };

  const handleDelete = async () => {
    if (confirm(t("deleteConfirm"))) {
      await deleteProject(project.id);
      onUpdate?.();
    }
  };

  return (
    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700/50 transition-colors overflow-visible">
      {editing ? (
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder={t("projectTitle")}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            placeholder={t("description")}
            rows={2}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {(["idea", "building", "blocked", "launched"] as const).map((s) => (
              <option key={s} value={s}>
                {tCreate(s)}
              </option>
            ))}
          </select>
          <input
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value.slice(0, 200))}
            maxLength={200}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder={t("statusNotePlaceholder")}
          />
          <div className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium text-zinc-400">{t("iceScores")}</p>
              <span
                className="group/tip relative inline-flex cursor-help"
                title={t("iceTooltip")}
              >
                <span className="text-zinc-500 hover:text-zinc-400 text-xs">ⓘ</span>
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1.5 rounded text-xs text-zinc-100 bg-zinc-800 border border-zinc-600 shadow-xl whitespace-normal w-56 text-center opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-opacity z-10 pointer-events-none">
                  {t("iceTooltip")}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-zinc-500">{tIce("impact")}</label>
                <select
                  value={iceImpact ?? ""}
                  onChange={(e) => setIceImpact(e.target.value ? Number(e.target.value) : null)}
                  className="mt-0.5 w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs"
                >
                  <option value="">—</option>
                  {ICE_VALUES.map((n) => (
                    <option key={n} value={n}>{tIce(scoreToLevel(n, false))}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500">{tIce("confidence")}</label>
                <select
                  value={iceConfidence ?? ""}
                  onChange={(e) => setIceConfidence(e.target.value ? Number(e.target.value) : null)}
                  className="mt-0.5 w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs"
                >
                  <option value="">—</option>
                  {ICE_VALUES.map((n) => (
                    <option key={n} value={n}>{tIce(scoreToLevel(n, false))}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500">{tIce("ease")}</label>
                <select
                  value={iceEase ?? ""}
                  onChange={(e) => setIceEase(e.target.value ? Number(e.target.value) : null)}
                  className="mt-0.5 w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs"
                >
                  <option value="">—</option>
                  {ICE_VALUES.map((n) => (
                    <option key={n} value={n}>{tIce(scoreToLevel(n, true))}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
            >
              {t("save")}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-zinc-100">{project.title}</h3>
              {project.description && (
                <p className="text-sm text-zinc-400 mt-0.5">{project.description}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              {/* ICE - 클릭 시 드롭다운에서 각 항목 선택 */}
              <div className="relative">
                {(() => {
                  const iceScore = computeIceScore({
                    ...project,
                    ice_impact: iceImpact,
                    ice_confidence: iceConfidence,
                    ice_ease: iceEase,
                  });
                  const isStrong = iceScore != null && iceScore >= 7;
                  return (
                    <span
                      className={isStrong ? "inline-block rounded p-[1px]" : ""}
                      style={
                        isStrong
                          ? {
                              background: "linear-gradient(90deg, #b91c1c, #c2410c, #a16207, #15803d, #1d4ed8, #6d28d9)",
                            }
                          : undefined
                      }
                    >
                      <button
                        ref={iceTriggerRef}
                        type="button"
                        onClick={() => setIceOpen((o) => !o)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                          isStrong
                            ? "bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                            : "bg-zinc-700/80 text-zinc-200 hover:bg-zinc-600/80"
                        }`}
                        title={t("iceTooltip")}
                      >
                        ICE {iceScore != null ? iceScore.toFixed(1) : "—"}
                        <span className="text-zinc-500 text-[10px]">▾</span>
                      </button>
                    </span>
                  );
                })()}
                {iceOpen &&
                  typeof document !== "undefined" &&
                  createPortal(
                    <>
                      <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setIceOpen(false)}
                        aria-hidden
                      />
                      <div
                        className="fixed z-[9999] p-3 rounded-lg bg-zinc-800 border border-zinc-600 shadow-xl min-w-[200px]"
                        style={{
                          top: (iceTriggerRef.current?.getBoundingClientRect().bottom ?? 0) + 4,
                          left: (iceTriggerRef.current?.getBoundingClientRect().left ?? 0),
                        }}
                      >
                        <p className="text-[10px] text-zinc-500 mb-2">{t("iceScores")}</p>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="text-[10px] text-zinc-500">{tIce("impact")}</label>
                            <select
                              value={iceImpact ?? ""}
                              onChange={(e) => {
                                const v = e.target.value ? Number(e.target.value) : null;
                                handleIceChange(v, iceConfidence, iceEase);
                              }}
                              className="mt-0.5 w-full px-2 py-1 rounded text-xs bg-zinc-700 border border-zinc-600 text-zinc-200"
                            >
                              <option value="">—</option>
                              {ICE_VALUES.map((n) => (
                                <option key={n} value={n}>{tIce(scoreToLevel(n, false))}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-500">{tIce("confidence")}</label>
                            <select
                              value={iceConfidence ?? ""}
                              onChange={(e) => {
                                const v = e.target.value ? Number(e.target.value) : null;
                                handleIceChange(iceImpact, v, iceEase);
                              }}
                              className="mt-0.5 w-full px-2 py-1 rounded text-xs bg-zinc-700 border border-zinc-600 text-zinc-200"
                            >
                              <option value="">—</option>
                              {ICE_VALUES.map((n) => (
                                <option key={n} value={n}>{tIce(scoreToLevel(n, false))}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-500">{tIce("ease")}</label>
                            <select
                              value={iceEase ?? ""}
                              onChange={(e) => {
                                const v = e.target.value ? Number(e.target.value) : null;
                                handleIceChange(iceImpact, iceConfidence, v);
                              }}
                              className="mt-0.5 w-full px-2 py-1 rounded text-xs bg-zinc-700 border border-zinc-600 text-zinc-200"
                            >
                              <option value="">—</option>
                              {ICE_VALUES.map((n) => (
                                <option key={n} value={n}>{tIce(scoreToLevel(n, true))}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
              </div>
              {/* 상태 */}
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                className={`px-2 py-1 rounded text-xs font-medium text-white cursor-pointer border-0 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none ${STATUS_COLORS[status]}`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {tCreate(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* 상태 메모: 빈 경우 밑줄 텍스트, 입력 중이면 input+체크, 있으면 텍스트 표시 */}
          {statusNoteEditing ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                ref={statusNoteInputRef}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value.slice(0, 200))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleStatusNoteSave();
                  if (e.key === "Escape") {
                    setStatusNote(project.status_note ?? "");
                    setStatusNoteEditing(false);
                  }
                }}
                maxLength={200}
                className="flex-1 px-2 py-1 rounded text-xs bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-zinc-600"
                placeholder={t("statusNotePlaceholder")}
                autoFocus
              />
              <button
                type="button"
                onClick={handleStatusNoteSave}
                className="p-1.5 rounded text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                title={t("save")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          ) : statusNote.trim() ? (
            <p
              onClick={() => setStatusNoteEditing(true)}
              className="mt-2 text-xs text-zinc-500 cursor-pointer hover:text-zinc-400"
            >
              {statusNote}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStatusNoteEditing(true);
              }}
              className="mt-2 text-xs text-zinc-600 hover:text-zinc-500 underline underline-offset-2"
            >
              {t("statusNoteAdd")}
            </button>
          )}
          {/* 최근 활동 (4주) */}
          <div className="mt-3 pt-3 border-t border-zinc-800/50">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs text-zinc-500">{t("recentActivity")}</span>
              <span className="text-[10px] text-zinc-600">({t("recentActivity4w")})</span>
            </div>
            <div className="flex gap-0.5 flex-wrap">
              {Array.from({ length: rangeDays }, (_, i) => {
                const d = daysAgo(rangeDays - 1 - i);
                const hasActivity = recentActivityDates.has(d);
                return (
                  <div
                    key={d}
                    className={`w-2.5 h-2.5 rounded-sm shrink-0 ${
                      hasActivity ? "bg-emerald-500/80" : "bg-zinc-800/80"
                    }`}
                    title={`${d}${hasActivity ? " ✓" : ""}`}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                router.push(`/dashboard?date=${today}&project=${project.id}`);
              }}
              className="text-xs px-2 py-1 rounded bg-emerald-600/80 hover:bg-emerald-500/80 text-white"
            >
              {t("logActivity")}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-zinc-400 hover:text-zinc-300"
            >
              {t("edit")}
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-300"
            >
              {t("delete")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
