import { handler } from "@/lib/api/server"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/$")({
	server: {
		handlers: {
			GET: handler,
			POST: handler,
			PUT: handler,
			DELETE: handler,
		},
	},
})
