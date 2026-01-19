const STORAGE_KEY = "mock_jobs_v1";

export function loadJobs<T>(): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn("[jobsStorage] loadJobs failed:", err);
    return null;
  }
}

export function saveJobs(data: unknown): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("[jobsStorage] saveJobs failed:", err);
  }
}

export function clearJobs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("[jobsStorage] clearJobs failed:", err);
  }
}
