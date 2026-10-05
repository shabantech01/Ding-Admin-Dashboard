import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithReauth } from "../auth/baseQueryWithReauth"

export const supportApi = createApi({
  reducerPath: "supportApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ContactMessages"],
  endpoints: (builder) => ({
    getContactsByStatus: builder.query({
      query: (status) => `/contact/status/${status}`,
      providesTags: ["ContactMessages"],
    }),

    getAllContacts: builder.query({
      query: () => "/contact",
      providesTags: ["ContactMessages"],
    }),

    updateContactStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/contact/${id}/status/${status}`,
        method: "PATCH",
      }),
      invalidatesTags: ["ContactMessages"],
    }),
  }),
})

export const {
  useGetContactsByStatusQuery,
  useGetAllContactsQuery,
  useUpdateContactStatusMutation,
} = supportApi
