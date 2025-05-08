import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get the token from the session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if the user is authenticated for protected routes
  const isAuthenticated = !!token;
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/features",
    "/how-it-works",
    "/pricing",
    "/auth/signin",
    "/auth/signup",
    "/api/auth/signin",
    "/api/auth/signup",
    "/api/auth/callback",
  ];
  
  // Check if the route is a public asset (images, css, js, etc.)
  const isPublicAsset = pathname.startsWith("/_next") || 
                        pathname.includes(".");
  
  // Check if the route is an API that doesn't need authorization
  const isPublicApi = pathname.startsWith("/api/auth");
  
  // Is this route a public one, an asset, or a special public API?
  const isPublic = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  ) || isPublicAsset || isPublicApi;
  
  // If the route requires authentication and the user is not authenticated,
  // redirect them to the sign-in page
  if (!isPublic && !isAuthenticated) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // Allow access to the route
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except static files and API routes that handle their own auth
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}; 