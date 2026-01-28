import type { QueryKey, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query"
import { mutationOptions as _mutationOptions, queryOptions as _queryOptions } from "@tanstack/react-query"
import { Cause, Effect, Exit, ManagedRuntime, Schema } from "effect"
import type { Prettify } from "./utils"

/**
 * Options for creating a query with an Effectful queryFn.
 *
 * @example
 * ```ts
 * const todosQueryOptions: QueryOptions<Todo[], never, (typeof Todo.Encoded)[], ["todos"], ApiClient> = {
 *   queryKey: ["todos"],
 *   queryFn: () => ApiClient.pipe(Effect.flatMap((client) => client.todos.getAll())),
 *   schema: Schema.Array(Todo),
 * }
 * ```
 */
export interface QueryOptions<
	TData = unknown,
	TError = never,
	TQueryFnData = TData,
	TQueryKey extends QueryKey = QueryKey,
	R = never
> extends Prettify<
		Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryFn"> & {
			queryFn: () => Effect.Effect<TData, TError, R>
			schema?: Schema.Schema<TData, TQueryFnData>
			consumeAbortSignal?: boolean
		}
	> {}

const makeQueryOptions =
	<R>() =>
	<TQueryFnData = unknown, TError = never, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
		options: QueryOptions<TQueryFnData, TError, TData, TQueryKey, R>
	) =>
		options

/**
 * Options for creating a mutation with an Effectful mutationFn.
 *
 * @example
 * ```ts
 * const createTodoMutation: MutationOptions<Todo, HttpError, { title: string }, unknown, ApiClient> = {
 *   mutationKey: ["createTodo"],
 *   mutationFn: (variables) => ApiClient.pipe(
 *     Effect.flatMap((client) => client.todos.create(variables))
 *   ),
 * }
 * ```
 */
export interface MutationOptions<
	TData = unknown,
	TError = never,
	TVariables = void,
	TOnMutateResult = unknown,
	R = never
> extends Prettify<
		Omit<UseMutationOptions<TData, Cause.Cause<TError>, TVariables, TOnMutateResult>, "mutationFn"> & {
			mutationFn: (variables: TVariables) => Effect.Effect<TData, TError, R>
		}
	> {}

const makeMutationOptions =
	<R>() =>
	<TData = unknown, TError = never, TVariables = void, TOnMutateResult = unknown>(
		options: MutationOptions<TData, TError, TVariables, TOnMutateResult, R>
	) =>
		options

/**
 * Creates typed helpers for building query and mutation options with requirements.
 *
 * @example
 * ```ts
 * const options = makeOptions<ApiClient>()
 * const todosQueryOptions = options.queryOptions({
 *   queryKey: ["todos"],
 *   queryFn: () => ApiClient.pipe(Effect.flatMap((client) => client.todos.getAll())),
 *   schema: Schema.Array(Todo),
 * })
 * ```
 */
export const makeOptions = <R>() => ({
	queryOptions: makeQueryOptions<R>(),
	mutationOptions: makeMutationOptions<R>(),
})

const runAbortablePromiseExit =
	<A, E, R, RE>(runtime: ManagedRuntime.ManagedRuntime<R, RE>, signal?: AbortSignal) =>
	(effect: Effect.Effect<A, E, R>) =>
		runtime.runPromiseExit(effect, { signal })

/**
 * Converts Effectful QueryOptions to regular QueryOptions for use with a queryClient.
 *
 * @example
 * ```ts
 * async loader({ context }) {
 *   await context.queryClient.prefetchQuery(
 *     eq.toQueryOptions(todosQueryOptions, runtime)
 *   )
 * }
 * ```
 */
export function toQueryOptions<
	TData = unknown,
	TError = never,
	TQueryFnData = TData,
	TQueryKey extends QueryKey = QueryKey,
	R = never,
	RE = never
>(
	options: QueryOptions<TData, TError, TQueryFnData, TQueryKey, R>,
	runtime: ManagedRuntime.ManagedRuntime<R, RE>,
	suspense: boolean = false
): UseQueryOptions<TQueryFnData, Cause.Cause<TError>, TData, TQueryKey> {
	return _queryOptions({
		...options,
		queryFn: (ctx) =>
			options
				.queryFn()
				.pipe(
					Effect.withSpan(suspense ? "useSuspenseQuery" : "useQuery", {
						attributes: { queryKey: options.queryKey },
					}),
					!!options.consumeAbortSignal ? runAbortablePromiseExit(runtime, ctx.signal) : runtime.runPromiseExit
				)
				.then(
					Exit.match({
						onSuccess: (data): TQueryFnData =>
							options.schema
								? Schema.encodeSync(options.schema)(data)
								: (data as unknown as TQueryFnData),
						onFailure: (cause): TQueryFnData => {
							throw cause
						},
					})
				),
		select: (data) => (options.schema ? Schema.decodeSync(options.schema)(data) : data),
	}) as UseQueryOptions<TQueryFnData, Cause.Cause<TError>, TData, TQueryKey>
}

/**
 * Converts Effectful MutationOptions to regular MutationOptions for use with regular TanStack Query APIs.
 *
 * @example
 * ```ts
 * const mutationOptions = eq.toMutationOptions(createTodoMutation, runtime)
 * ```
 */
export function toMutationOptions<
	TData = unknown,
	TError = never,
	TVariables = void,
	TOnMutateResult = unknown,
	R = never,
	RE = never
>(
	options: MutationOptions<TData, TError, TVariables, TOnMutateResult, R>,
	runtime: ManagedRuntime.ManagedRuntime<R, RE>
): UseMutationOptions<TData, Cause.Cause<TError>, TVariables, TOnMutateResult> {
	return _mutationOptions({
		...options,
		mutationFn: (vars) =>
			options
				.mutationFn(vars)
				.pipe(
					Effect.withSpan("useMutation", {
						attributes: { mutationKey: options.mutationKey },
					}),
					runtime.runPromiseExit
				)
				.then(
					(exit) =>
						Exit.match(exit, {
							onSuccess: (data) => data,
							onFailure(cause) {
								throw cause
							},
						}) as TData
				),
	}) as UseMutationOptions<TData, Cause.Cause<TError>, TVariables, TOnMutateResult>
}
