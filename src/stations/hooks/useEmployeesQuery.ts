// src/stations/hooks/useEmployeesQuery.ts
import { useEffect, useState } from "react";
import { getEmployeesApi, type EmployeeApi } from "../api/employees.api";

export function useEmployeesQuery(search: string) {
  const [employees, setEmployees] = useState<EmployeeApi[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search?.trim()) {
      setEmployees([]);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await getEmployeesApi({
          page: 1,
          limit: 10,
          q: search,
        });
        setEmployees(res.data.filter((e) => e.isActive));
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => clearTimeout(t);
  }, [search]);
console.log(employees)
  return { employees, loading };
}
