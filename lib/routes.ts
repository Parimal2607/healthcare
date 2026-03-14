export const AUTH_ROUTES = ["/login", "/register"] as const;

export const PUBLIC_ROUTES = ["/", ...AUTH_ROUTES] as const;

export const PRIVATE_ROUTE_PREFIXES = [
  "/dashboard",
  "/patients",
  "/providers",
  "/encounters",
  "/observations",
  "/claims",
  "/analytics",
  "/consent",
  "/integrations",
  "/settings",
  "/profile",
  "/team"
] as const;

export const ADMIN_ONLY_ROUTE_PREFIXES = ["/team"] as const;

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

export function isPrivateRoute(pathname: string) {
  return PRIVATE_ROUTE_PREFIXES.some((route) => pathname.startsWith(route));
}

export function isAdminOnlyRoute(pathname: string) {
  return ADMIN_ONLY_ROUTE_PREFIXES.some((route) => pathname.startsWith(route));
}

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => (route === "/" ? pathname === "/" : pathname.startsWith(route)));
}
