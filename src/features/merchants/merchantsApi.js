import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../auth/baseQueryWithReauth";

export const merchantsApi = createApi({
  reducerPath: "merchantsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Merchants"],
  endpoints: (builder) => ({
    getMerchants: builder.query({
      query: (status = "ALL") => `/admin/merchants?status=${status}`,
      providesTags: ["Merchants"],
    }),
    getMerchantById: builder.query({
      query: (id) => `/admin/merchants/${id}`,
      providesTags: (result, error, id) => [{ type: "Merchants", id }],
    }),
    approveMerchant: builder.mutation({
      query: (merchantId) => ({
        url: `/admin/merchants/${merchantId}/verify`,
        method: "POST",
      }),
      invalidatesTags: ["Merchants"],
    }),
    rejectMerchant: builder.mutation({
      query: ({ merchantId, reason }) => ({
        url: `/admin/merchants/${merchantId}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Merchants"],
    }),
    suspendMerchant: builder.mutation({
      query: ({ merchantId, reason }) => ({
        url: `/admin/merchants/${merchantId}/suspend`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Merchants"],
    }),
  }),
});

export const {
  useGetMerchantsQuery,
  useGetMerchantByIdQuery,
  useApproveMerchantMutation,
  useRejectMerchantMutation,
  useSuspendMerchantMutation,
} = merchantsApi;
