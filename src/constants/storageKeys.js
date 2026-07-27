// Namespaced per-platform so Admin, Merchant, and App never collide in the same browser.
// Pattern: ding_{platform}_auth_{key}
//   Admin Dashboard  → ding_admin_auth_*
//   Merchant Dashboard → ding_merchant_auth_*
//   Customer App      → ding_app_auth_*

export const ADMIN_STORAGE_KEYS = {
  ACCESS_TOKEN: "ding_admin_auth_access_token",
  REFRESH_TOKEN: "ding_admin_auth_refresh_token",
  USER: "ding_admin_auth_user",
}
