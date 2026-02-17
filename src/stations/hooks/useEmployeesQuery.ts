import { useEffect, useState } from "react";
import { getEmployeesApi, type EmployeeApi } from "../api/employees.api";

export function useEmployeesQuery(search: string) {
  const [employees, setEmployees] = useState<EmployeeApi[]>([]);
  const [loading, setLoading] = useState(false);
  const normalizedSearch = search.trim();

  useEffect(() => {
    if (!normalizedSearch) {
      setEmployees([]);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await getEmployeesApi({
          page: 1,
          limit: 10,
          q: normalizedSearch,
        });
        setEmployees(res.data.filter((e) => e.isActive));
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [normalizedSearch]);

  return { employees, loading };
}
