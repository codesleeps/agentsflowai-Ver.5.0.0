import axios, { AxiosHeaders } from "axios";

const vybeDomain = process.env.NEXT_PUBLIC_VYBE_INTEGRATIONS_DOMAIN ?? "https://vybe.build";

export const internalDbClient = axios.create({
  baseURL: vybeDomain + "/api/database",
  withCredentials: true,
});

internalDbClient.interceptors.request.use((config) => {
  const serverSecret = process.env.VYBE_SERVER_SECRET;
  if (serverSecret) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("VYBE_SERVER_SECRET", serverSecret);
    config.headers = headers;
  }
  return config;
});
