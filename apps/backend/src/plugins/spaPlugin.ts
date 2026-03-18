import { join } from 'node:path/posix'
import { Glob } from 'bun'
import { Elysia } from 'elysia'

export interface SpaOptions {
  dir: string
  baseUrl?: string
  index?: string
}

function parseAcceptedEncodings(acceptEncoding: string) {
  return acceptEncoding
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [name, ...params] = item.split(';').map(part => part.trim())
      const quality = params.find(param => param.startsWith('q='))
      const value = quality ? Number(quality.slice(2)) : 1

      return {
        name: (name ?? '').toLowerCase(),
        quality: Number.isNaN(value) ? 0 : value,
      }
    })
}

function acceptsEncoding(acceptEncoding: string, encoding: string) {
  const acceptedEncodings = parseAcceptedEncodings(acceptEncoding)
  const matchedEncoding = acceptedEncodings.find(item => item.name === encoding)

  if (matchedEncoding) {
    return matchedEncoding.quality > 0
  }

  return acceptedEncodings.some(item => item.name === '*' && item.quality > 0)
}

export function SpaPlugin(options: SpaOptions) {
  const { dir, baseUrl = '/', index = 'index.html' } = options
  const plugin = new Elysia({ name: 'spa', seed: options })

  const glob = new Glob('**')
  const filePaths = [...glob.scanSync(dir)]
  const fileSet = new Set(filePaths)

  const normalizeUrlPath = (...parts: string[]) =>
    join('/', ...parts.map(p => p.replaceAll('\\', '/')))

  const resolveCompressedVariant = (filePath: string, acceptEncoding: string) => {
    if (acceptsEncoding(acceptEncoding, 'br') && fileSet.has(`${filePath}.br`)) {
      return {
        filePath: `${filePath}.br`,
        encoding: 'br',
      }
    }

    if (acceptsEncoding(acceptEncoding, 'gzip') && fileSet.has(`${filePath}.gz`)) {
      return {
        filePath: `${filePath}.gz`,
        encoding: 'gzip',
      }
    }

    return {
      filePath,
      encoding: null,
    }
  }

  const createStaticResponse = (filePath: string, acceptEncoding: string, headers: Record<string, string | number>) => {
    const { filePath: resolvedFilePath, encoding } = resolveCompressedVariant(filePath, acceptEncoding)
    const originalFile = Bun.file(join(dir, filePath))

    headers.vary = 'Accept-Encoding'
    headers['content-type'] = originalFile.type

    if (encoding) {
      headers['content-encoding'] = encoding
    }
    else {
      delete headers['content-encoding']
    }

    return Bun.file(join(dir, resolvedFilePath))
  }

  for (const filePath of filePaths) {
    if (filePath === index || filePath.endsWith('.br') || filePath.endsWith('.gz')) {
      continue
    }

    plugin.get(
      normalizeUrlPath(baseUrl, filePath),
      ({ request, set }) => {
        return createStaticResponse(filePath, request.headers.get('accept-encoding') ?? '', set.headers)
      },
    )
  }

  plugin.get(normalizeUrlPath(baseUrl, '*'), ({ request, set }) => {
    return createStaticResponse(index, request.headers.get('accept-encoding') ?? '', set.headers)
  })

  return plugin
}
