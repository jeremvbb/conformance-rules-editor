import fetch, { RequestInfo } from "node-fetch";
import { Context, HttpRequest } from "@azure/functions";

export default async (
  context: Context,
  req: HttpRequest,
  requestInfo: RequestInfo,
  token?: String
) => {
  const url = `https://${requestInfo}`;
  const init = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token && {
        Authorization: "Bearer " + token,
      }),
    },
    body: JSON.stringify(req.body),
  };

  const res = await fetch(url, init);

  if (res.status === 200) {
    try {
      context.res = {
        status: res.status,
        body: await res.json(),
      };
    } catch (jsonParseException) {
      context.res = {
        status: 500,
        body: `Core Engine returned invalid JSON: ${res.body}`,
      };
    }
  } else {
    context.res = {
      status: res.status,
      body: res.statusText,
    };
  }
};