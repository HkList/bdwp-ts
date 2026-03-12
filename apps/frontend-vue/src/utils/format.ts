import dayjs from 'dayjs'

export const GB = 1073741824

export function formatBytes(bytes: number | string, decimals = 2) {
  if (typeof bytes === 'string')
    bytes = Number.parseFloat(bytes)
  if (bytes === 0)
    return '0 Bytes'
  const negative = bytes < 0
  bytes = Math.abs(bytes)
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (
    `${(negative ? '-' : '') + Number.parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`
  )
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatDateToString(timeString: dayjs.ConfigType, format = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(timeString).format(format)
}

export function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp * 1000)
  return formatDateToString(date)
}
