export async function wakeUp(link: string) {
  try {
    await fetch(link)
  }
  catch {
    try {
      location.href = link
    }
    catch {
      window.open(link, '_blank')
    }
  }
}

export async function wakeUpMobileApp(link: string) {
  const url = `bdnetdisk://n/action.EXTERNAL_ACTIVITY?m_n_v=10.0.20&type=invitation&logargs={"launch_ch":"025538x","down_ch":"1025538y"}&url=${encodeURIComponent(link)}`
  return await wakeUp(url)
}

export async function wakeUpMobileAppShareLink(surl: string, pwd: string) {
  const url = `bdnetdisk://n/action.SHARE_LINK?m_n_v=8.3.0&origin=2&behavior=app_open&isSaved=no&hasPanCode=yes&surl=${surl.slice(1)}&pwd=${pwd}&userType=bd&channelType=wap&fromSource=copyPancode&source=1025211t_1025211u&logargs={"launch_ch":"1025262n","down_ch":"1025262o"}&from=share`
  return await wakeUp(url)
}
