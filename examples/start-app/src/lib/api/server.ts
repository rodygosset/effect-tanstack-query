import { FetchHttpClient, HttpApiBuilder, HttpClient, HttpServer } from "@effect/platform"
import { InternalServerError } from "@effect/platform/HttpApiError"
import { Effect, Layer, Schema } from "effect"
import { api } from "./definitions"
import { Todo } from "./schemas"

class TodoRepository extends Effect.Service<TodoRepository>()("app/Todo/Repository", {
	effect: Effect.gen(function* () {
		const client = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk)

		const getAll = Effect.gen(function* () {
			const response = yield* client.get("https://jsonplaceholder.typicode.com/todos")

			const body = yield* response.json

			const todos = yield* Schema.decodeUnknown(Schema.Array(Todo))(body)

			return todos.slice(0, 10)
		})

		return { getAll }
	}),
	accessors: true,
	dependencies: [FetchHttpClient.layer],
}) {}

const todosGroupLive = HttpApiBuilder.group(api, "todos", (handlers) =>
	Effect.gen(function* () {
		const todoRepository = yield* TodoRepository

		return handlers.handle("getAll", () =>
			todoRepository.getAll.pipe(
				Effect.tapError((e) => Effect.logError("Error getting todos", e)),
				Effect.mapError(() => new InternalServerError())
			)
		)
	})
)

const apiLive = HttpApiBuilder.api(api).pipe(Layer.provide(todosGroupLive), Layer.provide(TodoRepository.Default))

const webHandler = HttpApiBuilder.toWebHandler(Layer.mergeAll(apiLive, HttpServer.layerContext))

export async function handler(props: { request: Request }) {
	const response = await webHandler.handler(props.request)

	await webHandler.dispose()

	return response
}
