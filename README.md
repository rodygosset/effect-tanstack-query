# effect-react-query

Type-safe integration between [Effect](https://effect.website/) and [Tanstack React Query](https://tanstack.com/query/latest).

Use Effect's `Effect<A, E, R>` values directly as query and mutation functions while leveraging React Query's caching, synchronization, and state management.

## API

```typescript
// Create hooks from an Effect Layer
const { RuntimeProvider, useQuery, useSuspenseQuery, useMutation } = make(myLayer)

// Wrap your app
<RuntimeProvider>
  <App />
</RuntimeProvider>

// Use in components
const query = useQuery({
  queryKey: ["users"],
  queryFn: effectThatReturnsUser,
})

const mutation = useMutation({
  mutationFn: (variables) => effectThatMutatesData(variables),
})
```

## Features

- **Effect-native hooks**: `useQuery`, `useSuspenseQuery`, `useMutation`
- **Full error typing**: Errors typed as `Cause.Cause<E>` for granular handling
- **Optional Schema support**: Encode/decode data with Effect Schema
- **Abort signal support**: Proper cancellation handling for queries
- **OpenTelemetry tracing**: Automatic span creation via `Effect.withSpan`
- **Runtime lifecycle**: Automatic disposal on unmount
