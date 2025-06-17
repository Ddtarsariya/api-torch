import type { Collection, ApiRequest } from "../types";

export const getAllRequests = (
  items: (Collection | ApiRequest)[],
): ApiRequest[] => {
  const requests: ApiRequest[] = [];

  items.forEach((item) => {
    if ("method" in item) {
      requests.push(item as ApiRequest);
    } else {
      requests.push(...getAllRequests((item as Collection).items));
    }
  });

  return requests;
};
