import { FetchHttpClient, HttpApiClient } from "@effect/platform"
import { Effect } from "effect"
import { api } from "./definitions"

export class ApiClient extends Effect.Service<ApiClient>()("app/Api/Client", {
	effect: HttpApiClient.make(api, {
		baseUrl: "http://localhost:4000",
	}),
	dependencies: [FetchHttpClient.layer],
}) {}
