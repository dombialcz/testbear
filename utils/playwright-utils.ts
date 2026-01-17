import { APIRequestContext, BrowserContext, Request } from '@playwright/test';

export const getLocalStorageItem = async (
  key: string,
  context: BrowserContext | APIRequestContext,
  throwWhenNotFound = true,
): Promise<string> => {
  const localStorage = (await context.storageState()).origins[0].localStorage;
  const localStorageKeyValue = localStorage.find(nameValuePair => nameValuePair.name === key);
  if (throwWhenNotFound && !localStorageKeyValue) {
    throw new Error(`Could not find an element in localstorage with key ${key}`);
  }
  return localStorageKeyValue?.value;
};
export const viewPort_FHD = { width: 1920, height: 1080 };
export const viewPort_FHD_vertical = { width: 1080, height: 1920 };
export const viewPort_2K_vertical = { width: 1440, height: 2560 };

export function byDataRole(name: string): string {
  return `[data-role="${name}"]`;
}

export function byMethodAndUrl(method: string, urlPart: string): (request: Request) => boolean {
  return (request: Request) => request.method() === method && request.url().includes(urlPart);
}

export async function getRequestParams(paramName: string, request: Request | Promise<Request>): Promise<string[]> {
  return new URL((await request).url()).searchParams.getAll(paramName);
}
