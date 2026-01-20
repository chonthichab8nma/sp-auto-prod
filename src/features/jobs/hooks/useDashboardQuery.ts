// import { useEffect, useState } from "react";
// // import type { Job } from "../../../Type";
// import type { JobsQuery, JobsResponse } from "../api/job.api";
// // import { getJobsDashboardMock } from "../api/job.api";
// import { getJobsApi } from "../api/job.api";

// export function useDashboardQuery(query: JobsQuery) {
//   const [data, setData] = useState<JobsResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string>("");

//   useEffect(() => {
//     let alive = true;
//     // const reqId = ++reqIdRef.current;

//     (async () => {
//       setLoading(true);
//       setError("");

//       try {
//         const res = await getJobsApi(query);
//         if (!alive) return;
//         setData(res);
//       } catch (e: unknown) {
//         if (!alive) return;
//         setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
//       } finally {
//         if (!alive) setLoading(false);
//       }
//     })();

//     return () => {
//       alive = false;
//     };
//   }, [query]);

//   return { data, loading, error };
// }

// src/features/jobs/hooks/useDashboardQuery.ts
import { useEffect, useState } from "react";
import type { JobsQuery, JobsResponse } from "../api/job.api";
import { getJobsApi } from "../api/job.api";

export function useDashboardQuery(query: JobsQuery) {
  const [data, setData] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getJobsApi(query);
        if (!alive) return;
        setData(res);
      } catch (e: unknown) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [query]);

  return { data, loading, error };
}
