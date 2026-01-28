import { Schema } from "effect"

export const UserId = Schema.Number.pipe(Schema.brand("app/User/Id"))
export type UserId = typeof UserId.Type

export const TodoId = Schema.Number.pipe(Schema.brand("app/Todo/Id"))
export type TodoId = typeof TodoId.Type

export class Todo extends Schema.Class<Todo>("app/Todo")({
	id: TodoId,
	userId: UserId,
	title: Schema.String,
	completed: Schema.Boolean,
}) {}
