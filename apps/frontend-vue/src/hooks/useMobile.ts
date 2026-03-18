import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { computed } from 'vue'

const wxReg = /MicroMessenger/i

export function useMobile() {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = computed(() => {
    return breakpoints.between('sm', 'md').value || breakpoints.smallerOrEqual('sm').value
  })
  return {
    isMobile,
    isWeChat: wxReg.test(navigator.userAgent),
  }
}
