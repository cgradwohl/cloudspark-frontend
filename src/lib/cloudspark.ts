export function makeCloudsparkURL(path: string) {
  return import.meta.env.NODE_ENV === "production"
    ? `https://cloudspark.dev/api/v1/${path}`
    : `http://localhost:4321/api/v1/${path}`;
}

export async function CloudsparkAPIClient(path: string, options: RequestInit) {
  return await fetch(makeCloudsparkURL(path), options);
}
