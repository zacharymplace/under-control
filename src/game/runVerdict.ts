type RunVerdictInput = {
  failureDriver?: {
    title?: string;
  } | null;
};

export function buildRunVerdict({ failureDriver }: RunVerdictInput) {
  if (!failureDriver) return null;

  return failureDriver.title;
}
