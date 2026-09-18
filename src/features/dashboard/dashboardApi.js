import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../auth/baseQueryWithReauth";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (period = "LAST_MONTH") => `/admin/dashboard/stats?period=${period}`,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
