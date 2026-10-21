import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithReauth } from "../auth/baseQueryWithReauth"

export const reviewsApi = createApi({
  reducerPath: "reviewsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminReviews"],
  endpoints: (builder) => ({
    getAdminReviews: builder.query({
      query: ({ take = 10, cursor, rating, search } = {}) => {
        const params = new URLSearchParams()
        params.set("take", String(take))
        if (cursor) params.set("cursor", cursor)
        if (rating) params.set("rating", String(rating))
        if (search) params.set("search", search)
        return `/reviews/admin?${params.toString()}`
      },
      providesTags: ["AdminReviews"],
    }),
    deleteAdminReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminReviews"],
    }),
  }),
})

export const {
  useGetAdminReviewsQuery,
  useDeleteAdminReviewMutation,
} = reviewsApi
