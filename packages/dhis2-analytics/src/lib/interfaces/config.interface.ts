export interface FnConfig {
  /**
   * Base URL for an instance
   */
  baseUrl: string;

  /**
   * Username
   */
  username?: string;

  /**
   * Password
   */
  password?: string;
}

export type FetchMethod = "GET" | "POST";
