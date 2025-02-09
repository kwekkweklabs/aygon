import { useQuery } from "@tanstack/react-query";
import { useAygonSDK } from "./context";

/**
 * @typedef {Object} QueryFnParams
 * @property {import(".").AygonSDK} sdk
 * @property {import("@tanstack/react-query").QueryFunctionContext} context
 *
 * @param {Object} params
 * @param {import("@tanstack/react-query").QueryKey} params.queryKey
 * @param {(params: QueryFnParams) => Promise<any>} params.queryFn
 * @param {import("@tanstack/react-query").QueryOptions} [params.options]
 * @returns {import("@tanstack/react-query").UseQueryResult}
 */
export function useAygonQuery({ queryKey, queryFn, options = {} }) {
  const { sdk } = useAygonSDK();

  return useQuery({
    queryKey,
    queryFn: (context) => queryFn({ sdk, context }),
    ...options,
  });
}
