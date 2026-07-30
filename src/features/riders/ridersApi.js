import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithReauth } from "../auth/baseQueryWithReauth"

export const ridersApi = createApi({
  reducerPath: "ridersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Riders"],
  endpoints: (builder) => ({
    getRiders: builder.query({
      query: (status = "ALL") => `/admin/riders?status=${status}`,
      providesTags: ["Riders"],
    }),
    getRiderById: builder.query({
      query: (id) => `/admin/riders/${id}`,
      providesTags: (result, error, id) => [{ type: "Riders", id }],
    }),
    verifyRider: builder.mutation({
      query: (id) => ({
        url: `/admin/riders/${id}/verify`,
        method: "POST",
      }),
      invalidatesTags: ["Riders"],
    }),
    suspendRider: builder.mutation({
      query: (id) => ({
        url: `/admin/riders/${id}/suspend`,
        method: "POST",
      }),
      invalidatesTags: ["Riders"],
    }),
    getUploadUrl: builder.mutation({
      query: ({ key, contentType }) => ({
        url: "/files/upload-url",
        method: "POST",
        body: { key, contentType },
      }),
    }),
    updateRider: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/riders/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Riders", id }, "Riders"],
    }),
    createRider: builder.mutation({
      query: (payload) => ({
        url: "/admin/riders",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Riders"],
    }),
  }),
})

export const {
  useGetRidersQuery,
  useGetRiderByIdQuery,
  useVerifyRiderMutation,
  useSuspendRiderMutation,
  useUpdateRiderMutation,
  useGetUploadUrlMutation,
  useCreateRiderMutation,
} = ridersApi
