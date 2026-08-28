import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithReauth } from "../auth/baseQueryWithReauth"

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ role = "ALL", status = "ALL", search = "", cursor, take = 20 } = {}) => {
        const params = new URLSearchParams({ role, status, take })
        if (search) params.set("search", search)
        if (cursor) params.set("cursor", cursor)
        return `/admin/users?${params}`
      },
      providesTags: ["Users"],
    }),
    toggleUserStatus: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
})

export const { useGetUsersQuery, useToggleUserStatusMutation } = usersApi
