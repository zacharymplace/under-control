import { getTurnRisk, getTurnStory } from "./timelineStory";

type TimelineSnapshot = {
  load?: number;
  drift?: number;
  integrity?: number;
  signalClarity?: number;
  [key: string]: unknown;
};

export type CompressedTimelineEntry = {
  turn?: number;
  action?: string;
  before: TimelineSnapshot;
  after: TimelineSnapshot;
  [key: string]: unknown;
};

export type TimelineItem =
  | {
      type: "single";
      entry: CompressedTimelineEntry;
      startTurn: number;
      endTurn: number;
    }
  | {
      type: "group";
      entries: CompressedTimelineEntry[];
      action: string;
      label: string;
      startTurn: number;
      endTurn: number;
    };

export function compressTimeline(log: CompressedTimelineEntry[]): TimelineItem[] {
  if (!log || log.length === 0) return [];

  const items: TimelineItem[] = [];
  let i = 0;

  while (i < log.length) {
    const entry = log[i];
    const story = getTurnStory(entry);
    const group = [entry];

    let j = i + 1;

    while (j < log.length) {
      const next = log[j];
      const nextStory = getTurnStory(next);
      const risk = getTurnRisk(next);

      const sameAction = next.action === entry.action;
      const sameStory = nextStory.label === story.label;
      const notCritical =
        risk === "CONTROLLED" &&
        (next.after.load ?? 0) < 95 &&
        (next.after.drift ?? 0) < 55 &&
        (next.after.integrity ?? 100) > 50;

      if (sameAction && sameStory && notCritical) {
        group.push(next);
        j += 1;
      } else {
        break;
      }
    }

    if (group.length >= 2) {
      items.push({
        type: "group",
        entries: group,
        action: entry.action ?? "UNKNOWN",
        label: story.label,
        startTurn: group[0].turn ?? 0,
        endTurn: group[group.length - 1].turn ?? 0,
      });
    } else {
      items.push({
        type: "single",
        entry,
        startTurn: entry.turn ?? 0,
        endTurn: entry.turn ?? 0,
      });
    }

    i += group.length;
  }

  return items;
}
