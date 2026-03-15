export function parseBaiduShareLink(url: string) {
  const urlMatch = url.match(/s\/([\w-]+)/)
  const urlMatch2 = url.match(/surl=([\w-]+)/)

  const pwdMatch = url.match(/\?pwd=([\w-]+)/)
  const pwdMatch2 = url.match(/&pwd=([\w-]+)/)
  const pwdMatch3 = url.match(/提取码[:：]\s?([\w-]+)/)

  const surl = urlMatch ? urlMatch[1] : urlMatch2 ? `1${urlMatch2[1]}` : ''
  const pwd = pwdMatch ? pwdMatch[1] : pwdMatch2 ? pwdMatch2[1] : pwdMatch3 ? pwdMatch3[1] : ''

  return {
    surl: surl ?? '',
    pwd: pwd ?? '',
    url: surl === '' ? '' : `https://pan.baidu.com/s/${surl}`,
  }
}
