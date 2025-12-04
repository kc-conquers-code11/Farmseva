// types/supabase.d.ts
export {};

declare module '@supabase/auth-helpers-nextjs' {
  interface User {
    user_metadata: {
      full_name?: string;
      [key: string]: any;
    };
  }
}
