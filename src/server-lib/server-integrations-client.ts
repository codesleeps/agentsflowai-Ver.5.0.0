import axios, { AxiosHeaders } from "axios";

interface RunActionParams<InputType> {
  actionId: string;
  accountId: string;
  input?: InputType;
}
interface RunActionResponse<ResponseType> {
  exports?: unknown;
  os?: unknown;
  ret?: ResponseType;
  stashId?: unknown | undefined;
}

const vybeDomain = process.env.NEXT_PUBLIC_VYBE_INTEGRATIONS_DOMAIN ?? "https://vybe.build";

export const serverIntegrationClient = axios.create({
  baseURL: vybeDomain + "/api/pipedream",
});

serverIntegrationClient.interceptors.request.use((config) => {
  const serverSecret = process.env.VYBE_SERVER_SECRET;
  if (serverSecret) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("VYBE_SERVER_SECRET", serverSecret);
    config.headers = headers;
  }
  return config;
});

/**
 * Run an action on an integration.
 * This function can only be used server side and should NEVER be used client side.
 * @param actionParams.actionId - The id of the action to run - the name of the tool that you have tested, if you don't know the action id check which tools are available to you first and test the tool before using this function.
 * @param actionParams.accountId - The id of the account to run the action on.
 * @param actionParams.input - optional, depending on the tested tool input schema / configured props - The input to pass to the action.
 * @returns The response from the action
 */
export async function runIntegrationActionFromServer<InputType, ResponseType>(
  actionParams: RunActionParams<InputType>,
): Promise<RunActionResponse<ResponseType>> {
  const { accountId, ...rest } = actionParams;
  const response = await serverIntegrationClient.post<RunActionResponse<ResponseType>>(
    `/accounts/${accountId}/run-action`,
    rest,
  );
  return response.data;
}
