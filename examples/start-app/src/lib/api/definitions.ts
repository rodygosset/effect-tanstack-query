import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { Todo } from "./schemas"

const todosGroup = HttpApiGroup.make("todos")
	.add(HttpApiEndpoint.get("getAll")`/all`.addSuccess(Schema.Array(Todo)))
	.addError(HttpApiError.InternalServerError)
	.prefix("/todos")

export const api = HttpApi.make("app/api").add(todosGroup).prefix("/api")
