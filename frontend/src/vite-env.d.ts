/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROJECT_URL: string
  readonly SUPABASE_KEY: string
  readonly SUPABASE_URL?: string
  readonly SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
