import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { computed } from 'vue'

export const useMobile = () => {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = computed(() => {
    return breakpoints.between('sm', 'md').value || breakpoints.smallerOrEqual('sm').value
  })
  return { isMobile }
}
