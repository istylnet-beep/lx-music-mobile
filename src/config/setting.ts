import { storageDataPrefix, storageDataPrefixOld } from '@/config/constant'
import defaultSetting from '@/config/defaultSetting'
import { getData, removeData, saveData } from '@/plugins/storage'
import migrateSetting from './migrateSetting'
import settingState from '@/store/setting/state'
import { migrateMetaData, migrateListData } from './migrate'
import { addUserApi, getUserApiList } from '@/utils/data'
import defaultYehuaScript from '@/core/init/userApi/defaultSources/yehua'
import { exitApp, tipDialog } from '@/utils/tools'

// 业务相关工具方法


const primitiveType = ['string', 'boolean', 'number']
const checkPrimitiveType = (val: any): boolean => val === null || primitiveType.includes(typeof val)

const mergeSetting = (originSetting: LX.AppSetting, targetSetting?: Partial<LX.AppSetting> | null): {
  setting: LX.AppSetting
  updatedSettingKeys: Array<keyof LX.AppSetting>
  updatedSetting: Partial<LX.AppSetting>
} => {
  let originSettingCopy: LX.AppSetting = { ...originSetting }
  // const defaultVersion = targetSettingCopy.version
  const updatedSettingKeys: Array<keyof LX.AppSetting> = []
  const updatedSetting: Partial<LX.AppSetting> = {}

  if (targetSetting) {
    const originSettingKeys = Object.keys(originSettingCopy)
    const targetSettingKeys = Object.keys(targetSetting)

    if (originSettingKeys.length > targetSettingKeys.length) {
      for (const key of targetSettingKeys as Array<keyof LX.AppSetting>) {
        const targetValue: any = targetSetting[key]
        const isPrimitive = checkPrimitiveType(targetValue)
        // if (checkPrimitiveType(value)) {
        if (!isPrimitive || targetValue == originSettingCopy[key] || originSettingCopy[key] === undefined) continue
        updatedSettingKeys.push(key)
        updatedSetting[key] = targetValue
        // @ts-expect-error
        originSettingCopy[key] = targetValue
        // } else {
        //   if (!isPrimitive && currentValue != undefined) handleMergeSetting(value, currentValue)
        // }
      }
    } else {
      for (const key of originSettingKeys as Array<keyof LX.AppSetting>) {
        const targetValue: any = targetSetting[key]
        const isPrimitive = checkPrimitiveType(targetValue)
        // if (checkPrimitiveType(value)) {
        if (!isPrimitive || targetValue == originSettingCopy[key]) continue
        updatedSettingKeys.push(key)
        updatedSetting[key] = targetValue
        // @ts-expect-error
        originSettingCopy[key] = targetValue
        // } else {
        //   if (!isPrimitive && currentValue != undefined) handleMergeSetting(value, currentValue)
        // }
      }
    }
  }

  return {
    setting: originSettingCopy,
    updatedSettingKeys,
    updatedSetting,
  }
}
export const updateSetting = (setting?: Partial<LX.AppSetting> | null, isInit: boolean = false) => {
  let originSetting: LX.AppSetting
  if (isInit) {
    originSetting = { ...defaultSetting }
  } else originSetting = settingState.setting

  const result = mergeSetting(originSetting, setting)

  result.setting.version = defaultSetting.version

  return result
}

export const initSetting = async() => {
  let setting: Partial<LX.AppSetting> | null = await getData(storageDataPrefix.setting)
  let isFirstInstall = setting == null


  // try migrate setting before v1
  if (!setting) {
    const config = await getData<{ setting?: any }>(storageDataPrefixOld.setting)
    if (config != null) {
      isFirstInstall = false
      setting = migrateSetting(config)
      try {
        await migrateListData()
        await migrateMetaData()
      } catch (err: any) {
        void tipDialog({
          title: '数据迁移失败 (Failed to migrate data)',
          message: `请截图并在 GitHub 反馈。为了防止数据丢失，应用将停止运行。错误信息：\n${(err.stack ?? err.message) as string}`,
          btnText: 'Exit',
          bgClose: false,
        }).then(() => {
          exitApp()
        })
        throw err
      }
      await removeData(storageDataPrefixOld.setting)
    }
  }

  // 僅在全新安裝時預先匯入；既有安裝升級不會新增，刪除後也不會重複補回。
  if (isFirstInstall) {
    try {
      const userApiList = await getUserApiList()
      if (!userApiList.some(api => api.name === '野花🌷')) await addUserApi(defaultYehuaScript)
    } catch (error) {
      console.warn('Failed to preload default user API source:', error)
    }
  }

  // console.log(setting)
  const updatedSetting = updateSetting(setting, true)
  void saveData(storageDataPrefix.setting, updatedSetting.setting)

  return updatedSetting
}
