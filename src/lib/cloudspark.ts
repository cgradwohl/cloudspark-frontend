export function makeCloudsparkURL(path: string) {
  return import.meta.env.NODE_ENV === "production"
    ? `https://cloudspark.dev/${path}`
    : `http://localhost:4321/${path}`;
}

export async function CloudsparkAPIClient(path: string, options: RequestInit) {
  return await fetch(makeCloudsparkURL(path), options);
}
