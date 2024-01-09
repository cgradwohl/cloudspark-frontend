/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly COURIER_AUTH_TOKEN: string
  readonly TURSO_URL: string
  readonly TURSO_AUTH_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
