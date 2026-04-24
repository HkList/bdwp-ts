const SHARE_PATH_RE = /s\/([\w-]+)/
const SHARE_QUERY_RE = /surl=([\w-]+)/
const PWD_QUERY_START_RE = /\?pwd=([\w-]+)/
const PWD_QUERY_CONTINUE_RE = /&pwd=([\w-]+)/
const PWD_TEXT_RE = /提取码[:：]\s?([\w-]+)/

export function parseBaiduShareLink(url: string) {
  const urlMatch = url.match(SHARE_PATH_RE)
  const urlMatch2 = url.match(SHARE_QUERY_RE)

  const pwdMatch = url.match(PWD_QUERY_START_RE)
  const pwdMatch2 = url.match(PWD_QUERY_CONTINUE_RE)
  const pwdMatch3 = url.match(PWD_TEXT_RE)

  const surl = urlMatch
    ? urlMatch[1]
    : urlMatch2
      ? `1${urlMatch2[1]}`
      : ''
  const pwd = pwdMatch
    ? pwdMatch[1]
    : pwdMatch2
      ? pwdMatch2[1]
      : pwdMatch3
        ? pwdMatch3[1]
        : ''

  return {
    surl: surl ?? '',
    pwd: pwd ?? '',
    url: surl === '' ? '' : `https://pan.baidu.com/s/${surl}`,
  }
}
