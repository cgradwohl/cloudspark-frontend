import { createClient } from "@libsql/client";
/**
 * 
CREATE TABLE subscribers (
  created TEXT,            
  email TEXT NOT NULL UNIQUE,
  givenName TEXT NOT NULL,  
  subscriberId TEXT PRIMARY KEY,
  status TEXT NOT NULL,    
  updated TEXT
);
 */

export const turso = createClient({
  url: import.meta.env.TURSO_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
});
