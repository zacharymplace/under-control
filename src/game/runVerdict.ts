export function buildRunVerdict({ failureDriver }: any) {
  if (!failureDriver) return null;

  return failureDriver.title;
}
