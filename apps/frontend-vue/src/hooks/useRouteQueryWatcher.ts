import { watch } from 'vue'
import { useRoute } from 'vue-router'

export function useRouteQueryWatcher(checker: (path: string) => boolean, callback: (query: Record<string, unknown>) => void) {
  const route = useRoute()

  watch(
    () => route.query,
    (query) => {
      if (checker(route.path)) {
        callback(query)
      }
    },
    { immediate: true },
  )
}
