import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithReauth } from "./baseQueryWithReauth"

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    refresh: builder.mutation({
      query: (refreshToken) => ({
        url: "/auth/refresh",
        method: "POST",
        body: { refreshToken },
      }),
    }),
    sendResetOtp: builder.mutation({
      query: (email) => ({
        url: "/auth/reset-password/send-otp",
        method: "POST",
        body: { email },
      }),
    }),
    verifyResetOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: "/auth/reset-password/verify-otp",
        method: "POST",
        body: { email, otp },
      }),
    }),
    confirmPasswordReset: builder.mutation({
      query: ({ resetToken, newPassword }) => ({
        url: "/auth/reset-password/confirm",
        method: "POST",
        body: { resetToken, newPassword },
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRefreshMutation,
  useSendResetOtpMutation,
  useVerifyResetOtpMutation,
  useConfirmPasswordResetMutation,
} = authApi
