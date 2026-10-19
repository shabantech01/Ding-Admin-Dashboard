import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithReauth } from "../auth/baseQueryWithReauth"

export const deliveryFeesApi = createApi({
  reducerPath: "deliveryFeesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["DeliveryFee"],
  endpoints: (builder) => ({
    getDeliveryFee: builder.query({
      query: () => "/delivery-fee",
      providesTags: ["DeliveryFee"],
    }),
    updateDeliveryFee: builder.mutation({
      query: (payload) => ({
        url: "/delivery-fee",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["DeliveryFee"],
    }),
  }),
})

export const {
  useGetDeliveryFeeQuery,
  useUpdateDeliveryFeeMutation,
} = deliveryFeesApi
