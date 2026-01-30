/**
 * 将数组分片成指定大小的多个子数组
 * @param array 要分片的数组
 * @param size 每片的数量
 * @returns 分片后的二维数组
 */
export function toChunks<T>(array: T[], size: number): T[][] {
  if (size <= 0) {
    size = 1
  }

  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }

  return result
}
