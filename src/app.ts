import '@/utils/errorHandle'
import { init as initLog } from '@/utils/log'
import { bootLog, getBootLog } from '@/utils/bootLog'
import '@/config/globalData'
import { getFontSize } from '@/utils/data'
import { Dimensions, StatusBar } from 'react-native'
import { exitApp } from './utils/nativeModules/utils'
import { windowSizeTools } from './utils/windowSizeTools'
import { listenLaunchEvent } from './navigation/regLaunchedEvent'
import { tipDialog } from './utils/tools'

console.log('starting app...')
bootLog('App entry loaded.')
listenLaunchEvent()

const runStartupStep = async<T>(name: string, task: () => Promise<T>): Promise<T> => {
  bootLog(`START: ${name}`)
  try {
    const result = await task()
    bootLog(`DONE: ${name}`)
    return result
  } catch (err: any) {
    bootLog(`FAILED: ${name}: ${err?.stack ?? err?.message ?? String(err)}`)
    throw err
  }
}

void Promise.all([
  runStartupStep('Load font size setting', getFontSize),
  runStartupStep('Initialize window dimensions', async() => {
    // Avoid the optional native UtilsModule window-size API during startup.
    // React Native Dimensions is available on Android TV and is sufficient here.
    const window = Dimensions.get('window')
    const size = {
      width: Math.round(window.width),
      height: Math.round(window.height) + (StatusBar.currentHeight ?? 0),
    }
    // Assign the size directly; avoid invoking optional methods during bootstrap.
    windowSizeTools.size = size
    return size
  }),
]).then(async([fontSize]) => {
  global.lx.fontSize = fontSize
  bootLog('Font size setting loaded.')

  let isInited = false
  let handlePushedHomeScreen: () => void | Promise<void>

  const tryGetBootLog = () => {
    try {
      return getBootLog()
    } catch (err) {
      return 'Get boot log failed.'
    }
  }

  const handleInit = async() => {
    if (isInited) return
    void initLog()
    let initStage = 'Loading core initializer'
    try {
      bootLog(initStage)
      const { default: init } = await import('@/core/init')
      initStage = 'Running core initializer'
      bootLog('Core initializer module loaded.')
      handlePushedHomeScreen = await init()
      bootLog('Core initializer completed.')
    } catch (err: any) {
      void tipDialog({
        title: '初始化失敗 (Init Failed)',
        message: `Stage: ${initStage}\n\nBoot Log:\n${tryGetBootLog()}\n\n${(err?.stack ?? err?.message ?? String(err)) as string}`,
        btnText: 'Exit',
        bgClose: false,
      }).then(() => {
        exitApp()
      })
      return
    }
    isInited ||= true
  }
  const { init: initNavigation, navigations } = await import('@/navigation')

  initNavigation(async() => {
    await handleInit()
    if (!isInited) return
    // import('@/utils/nativeModules/cryptoTest')

    await navigations.pushHomeScreen().then(() => {
      void handlePushedHomeScreen()
    }).catch((err: any) => {
      void tipDialog({
        title: 'Error',
        message: err.message,
        btnText: 'Exit',
        bgClose: false,
      }).then(() => {
        exitApp()
      })
    })
  })
}).catch((err) => {
  void tipDialog({
    title: '初始化失败 (Init Failed)',
    message: `Boot Log:\n\n${(err.stack ?? err.message) as string}`,
    btnText: 'Exit',
    bgClose: false,
  }).then(() => {
    exitApp()
  })
})
