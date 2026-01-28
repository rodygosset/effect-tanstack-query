import { Effect, Layer, ManagedRuntime } from "effect"
import { ApiClient } from "../api/client"

const memoMap = Effect.runSync(Layer.makeMemoMap)

export const runtime = ManagedRuntime.make(ApiClient.Default, memoMap)
