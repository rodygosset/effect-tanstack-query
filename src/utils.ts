/**
 * Utility type that prettifies TypeScript types by flattening intersections.
 *
 * @example
 * ```ts
 * type A = { a: string } & { b: number }
 * type B = Prettify<A> // { a: string; b: number }
 * ```
 */
export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}
