import { type InitParams, onScriptAction, sendAction, type ResponseParams, type UpdateInfoParams, type RequestParams } from '@/utils/nativeModules/userApi'
import { importUserApi, log, setUserApiList, setUserApiStatus } from '@/core/userApi'
import settingState from '@/store/setting/state'
import BackgroundTimer from 'react-native-background-timer'
import { fetchData } from './request'
import { getUserApiList, getUserApiScript } from '@/utils/data'
import { getData, saveData } from '@/plugins/storage'
import { storageDataPrefix } from '@/config/constant'
import { confirmDialog, openUrl, tipDialog } from '@/utils/tools'
import getYehuaSource from '../../userApi/defaultSources/yehua'


export default async(setting: LX.AppSetting) => {
  const userApiRequestMap = new Map<string, { resolve: (value: ResponseParams['result']) => void, reject: (error: Error) => void, timeout: number }>()
  const scriptRequestMap = new Map<string, { request: Promise<any>, abort: () => void }>()

  const cancelRequest = (requestKey: string, message: string) => {
    const target = scriptRequestMap.get(requestKey)
    if (!target) return
    scriptRequestMap.delete(requestKey)
    target.abort()
  }
  const sendScriptRequest = (requestKey: string, url: string, options: RequestParams['options']) => {
    let req = fetchData(url, options)
    req.request.then(response => {
      // console.log(response)
      sendAction('response', {
        error: null,
        requestKey,
        response,
      })
    }).catch(err => {
      sendAction('response', {
        error: err.message,
        requestKey,
        response: null,
      })
    }).finally(() => {
      scriptRequestMap.delete(requestKey)
    })
    scriptRequestMap.set(requestKey, req)
  }
  const sendUserApiRequest = async(data: LX.UserApi.UserApiRequestParams) => {
    const handleApiUpdate = () => {
      const target = userApiRequestMap.get(data.requestKey)
      if (!target) return
      userApiRequestMap.delete(data.requestKey)
      BackgroundTimer.clearTimeout(target.timeout)
      target.reject(new Error('request failed'))
    }
    const requestPromise = new Promise<ResponseParams['result']>((resolve, reject) => {
      userApiRequestMap.set(data.requestKey, {
        resolve,
        reject,
        timeout: BackgroundTimer.setTimeout(() => {
          const target = userApiRequestMap.get(data.requestKey)
          if (!target) return
          userApiRequestMap.delete(data.requestKey)
          target.reject(new Error('request timeout'))
        }, 20_000),
      })
      sendAction('request', data)
    }).finally(() => {
      global.state_event.off('apiSourceUpdated', handleApiUpdate)
    })
    global.state_event.on('apiSourceUpdated', handleApiUpdate)
    return requestPromise
  }
  const handleUserApiResponse = ({ status, result, requestKey, errorMessage }: ResponseParams) => {
    const target = userApiRequestMap.get(requestKey)
    if (!target) return
    userApiRequestMap.delete(requestKey)
    BackgroundTimer.clearTimeout(target.timeout)
    if (status) target.resolve(result)
    else target.reject(new Error(errorMessage ?? 'failed'))
  }
  const handleStateChange = ({ status, errorMessage, info }: InitParams) => {
    // console.log(status, message, info)
    setUserApiStatus(status, errorMessage)
    if (!info || info.id !== settingState.setting['common.apiSource']) return
    if (status) {
      if (info.sources) {
        let apis: any = {}
        let qualitys: LX.QualityList = {}
        for (const [source, { actions, type, qualitys: sourceQualitys }] of Object.entries(info.sources)) {
          if (type != 'music') continue
          apis[source as LX.Source] = {}
          for (const action of actions) {
            switch (action) {
              case 'musicUrl':
                apis[source].getMusicUrl = (songInfo: LX.Music.MusicInfo, type: LX.Quality) => {
                  const requestKey = `request__${Math.random().toString().substring(2)}`
                  return {
                    canceleFn() {
                      // userApiRequestCancel(requestKey)
                    },
                    promise: sendUserApiRequest({
                      requestKey,
                      data: {
                        source,
                        action: 'musicUrl',
                        info: {
                          type,
                          musicInfo: songInfo,
                        },
                      },
                      // eslint-disable-next-line @typescript-eslint/promise-function-async
                    }).then(res => {
                      // console.log(res)
                      return { type, url: res.data.url }
                    }).catch(err => {
                      console.log(err.message)
                      throw err
                    }),
                  }
                }
                break
              case 'lyric':
                apis[source].getLyric = (songInfo: LX.Music.MusicInfo) => {
                  const requestKey = `request__${Math.random().toString().substring(2)}`
                  return {
                    canceleFn() {
                      // userApiRequestCancel(requestKey)
                    },
                    promise: sendUserApiRequest({
                      requestKey,
                      data: {
                        source,
                        action: 'lyric',
                        info: {
                          type,
                          musicInfo: songInfo,
                        },
                      },
                      // eslint-disable-next-line @typescript-eslint/promise-function-async
                    }).then(res => {
                      // console.log(res)
                      return res.data
                    }).catch(async err => {
                      console.log(err.message)
                      return Promise.reject(err)
                    }),
                  }
                }
                break
              case 'pic':
                apis[source].getPic = (songInfo: LX.Music.MusicInfo) => {
                  const requestKey = `request__${Math.random().toString().substring(2)}`
                  return {
                    canceleFn() {
                      // userApiRequestCancel(requestKey)
                    },
                    promise: sendUserApiRequest({
                      requestKey,
                      data: {
                        source,
                        action: 'pic',
                        info: {
                          type,
                          musicInfo: songInfo,
                        },
                      },
                      // eslint-disable-next-line @typescript-eslint/promise-function-async
                    }).then(res => {
                      // console.log(res)
                      return res.data
                    }).catch(async err => {
                      console.log(err.message)
                      return Promise.reject(err)
                    }),
                  }
                }
                break
              default:
                break
            }
          }
          qualitys[source as LX.Source] = sourceQualitys
        }
        global.lx.qualityList = qualitys
        global.lx.apis = apis
        global.state_event.apiSourceUpdated(settingState.setting['common.apiSource'])
      }
    } else {
      if (errorMessage) {
        void tipDialog({
          message: `${global.i18n.t('user_api__init_failed_alert', { name: info.name })}\n${errorMessage}`,
          // selection: true,
          btnText: global.i18n.t('ok'),
        })
      }
    }
    if (!global.lx.apiInitPromise[1]) global.lx.apiInitPromise[2](status)
  }
  const showUpdateAlert = ({ name, log, updateUrl }: UpdateInfoParams) => {
    if (updateUrl) {
      void confirmDialog({
        message: `${global.i18n.t('user_api_update_alert', { name })}\n${log}`,
        // selection: true,
        // showCancel: true,
        confirmButtonText: global.i18n.t('user_api_update_alert_open_url'),
        cancelButtonText: global.i18n.t('close'),
      }).then(confirm => {
        if (!confirm) return
        setTimeout(() => {
          void openUrl(updateUrl)
        }, 300)
      })
    } else {
      void tipDialog({
        message: `${global.i18n.t('user_api_update_alert', { name })}\n${log}`,
        // selection: true,
        btnText: global.i18n.t('ok'),
      })
    }
  }

  onScriptAction((event) => {
    // console.log('script actuon: ', event)
    switch (event.action) {
      case 'init':
        if ((event as unknown as { errorMessage?: string }).errorMessage) event.data.errorMessage = (event as unknown as { errorMessage: string }).errorMessage
        handleStateChange(event.data)
        break
      case 'response':
        handleUserApiResponse(event.data)
        break
      case 'request':
        sendScriptRequest(event.data.requestKey, event.data.url, event.data.options)
        break
      case 'cancelRequest':
        cancelRequest(event.data, 'request canceled')
        break
      case 'showUpdateAlert':
        showUpdateAlert(event.data)
        break
      case 'log':
        switch ((event as unknown as { type: keyof typeof log }).type) {
          case 'log':
          case 'info':
            log.info((event as unknown as { log: string }).log)
            break
          case 'error':
            log.error((event as unknown as { log: string }).log)
            break
          case 'warn':
            log.warn((event as unknown as { log: string }).log)
            break
          default:
            break
        }
        break
      default:
        break
    }
  })

  // 野花🌷沿用應用程式原生自訂音源匯入流程，僅加入管理清單，不自動啟用。
  // V5 使用全新標記，避免舊版 V4 已誤標完成而讓舊安裝跳過匯入。
  // 完成後若使用者自行刪除，不會在每次啟動時重新加入。
  let diagnosticList: LX.UserApi.UserApiInfo[] = []
  let diagnosticStage = 'start'
  try {
    const migrationCompleted = await getData<boolean>(storageDataPrefix.yehuaDefaultSourceMigrationV5)
    console.info('[YehuaDiagnostic] marker:', migrationCompleted === true ? 'true' : migrationCompleted === false ? 'false' : 'undefined')
    if (!migrationCompleted) {
      diagnosticStage = 'read-list'
      diagnosticList = await getUserApiList()
      console.info('[YehuaDiagnostic] initial list:', diagnosticList.length, 'containsYehua:', diagnosticList.some(api => api.name.includes('野花')))
      const existingYehuaApi = diagnosticList.find(api => api.name.includes('野花'))
      if (!existingYehuaApi) {
        diagnosticStage = 'decompress'
        const script = getYehuaSource()
        console.info('[YehuaDiagnostic] script:', 'type=' + typeof script, 'length=' + (typeof script === 'string' ? script.length : -1), 'headerValid=' + (typeof script === 'string' && script.trim().startsWith('/*')))
        if (typeof script !== 'string' || !script.trim().startsWith('/*')) {
          throw new Error('decompressed script invalid')
        }
        diagnosticStage = 'import'
        await importUserApi(script)
        console.info('[YehuaDiagnostic] importUserApi: success')
      } else {
        console.info('[YehuaDiagnostic] importUserApi: skipped-existing')
      }
      diagnosticStage = 'verify-list'
      const verifiedList = await getUserApiList()
      const verifiedYehua = verifiedList.find(api => api.name.includes('野花'))
      console.info('[YehuaDiagnostic] verified list:', verifiedList.length, 'containsYehua:', Boolean(verifiedYehua), 'idSuffix:', verifiedYehua?.id.slice(-6) ?? 'none')
      if (!verifiedYehua) throw new Error('Yehua missing after import')
      diagnosticStage = 'verify-script'
      const storedScript = await getUserApiScript(verifiedYehua.id)
      console.info('[YehuaDiagnostic] stored script:', 'length=' + storedScript.length, 'headerValid=' + storedScript.trim().startsWith('/*'))
      if (!storedScript.trim().startsWith('/*')) throw new Error('stored script missing or invalid')
      diagnosticStage = 'save-marker'
      await saveData(storageDataPrefix.yehuaDefaultSourceMigrationV5, true)
      console.info('[YehuaDiagnostic] migration complete')
    } else {
      console.info('[YehuaDiagnostic] migration skipped: marker already true')
    }
  } catch (error) {
    console.warn('[YehuaDiagnostic] failed at stage:', diagnosticStage, 'error:', error instanceof Error ? error.message : String(error))
  }

  diagnosticStage = 'publish-list'
  try {
    const finalList = await getUserApiList()
    console.info('[YehuaDiagnostic] final list:', finalList.length, 'containsYehua:', finalList.some(api => api.name.includes('野花')))
    setUserApiList(finalList)
    console.info('[YehuaDiagnostic] published list')
  } catch (error) {
    console.warn('[YehuaDiagnostic] publish-list failed:', error instanceof Error ? error.message : String(error))
    setUserApiList(diagnosticList)
  }
}
