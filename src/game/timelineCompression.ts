import { getTurnRisk, getTurnStory } from "./timelineStory";

export type TimelineItem =
  | {
      type: "single";
      entry: any;
      startTurn: number;
      endTurn: number;
    }
  | {
      type: "group";
      entries: any[];
      action: string;
      label: string;
      startTurn: number;
      endTurn: number;
    };

export function compressTimeline(log: any[]): TimelineItem[] {
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
        next.after.load < 95 &&
        next.after.drift < 55 &&
        next.after.integrity > 50;

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
        action: entry.action,
        label: story.label,
        startTurn: group[0].turn,
        endTurn: group[group.length - 1].turn,
      });
    } else {
      items.push({
        type: "single",
        entry,
        startTurn: entry.turn,
        endTurn: entry.turn,
      });
    }

    i += group.length;
  }

  return items;
}
