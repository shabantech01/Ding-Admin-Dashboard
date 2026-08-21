import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithReauth } from "../auth/baseQueryWithReauth"

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAdminOrders: builder.query({
      query: ({ status = "ALL", cursor, take = 20, search = "" }) => {
        const params = new URLSearchParams({ status, take: String(take) })
        if (cursor) params.set("cursor", cursor)
        if (search.trim()) params.set("search", search.trim())
        return `/admin/users/orders?${params}`
      },
    }),
  }),
})

export const { useLazyGetAdminOrdersQuery } = ordersApi
