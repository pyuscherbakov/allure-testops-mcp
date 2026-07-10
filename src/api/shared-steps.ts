import type { AllureApiClient } from "../client.js";

export function getSharedStep(client: AllureApiClient, id: number): Promise<unknown> {
  return client.get(`/api/sharedstep/${id}`);
}

export function getSharedStepSteps(client: AllureApiClient, id: number): Promise<unknown> {
  return client.get(`/api/sharedstep/${id}/step`);
}
