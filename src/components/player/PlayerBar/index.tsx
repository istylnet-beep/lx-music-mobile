import { memo, useMemo } from 'react'
import { View } from 'react-native'
import { useKeyboard } from '@/utils/hooks'

import Pic from './components/Pic'
import Title from './components/Title'
import PlayInfo from './components/PlayInfo'
import ControlBtn from './components/ControlBtn'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { useSettingValue } from '@/store/setting/hook'

export default memo(({ isHome = false }: { isHome?: boolean }) => {
  const { keyboardShown } = useKeyboard()
  const theme = useTheme()
  const autoHidePlayBar = useSettingValue('common.autoHidePlayBar')

  const playerComponent = useMemo(() => (
    <View style={{ ...styles.container, ...(isHome ? styles.homeContainer : null), backgroundColor: theme['c-content-background'] }}>
      <Pic isHome={isHome} />
      <View style={{ ...styles.center, ...(isHome ? styles.homeCenter : null) }}>
        <Title isHome={isHome} />
        <PlayInfo isHome={isHome} />
      </View>
      <View style={{ ...styles.right, ...(isHome ? styles.homeRight : null) }}>
        <ControlBtn />
      </View>
    </View>
  ), [theme, isHome])

  return autoHidePlayBar && keyboardShown ? null : playerComponent
})

const styles = createStyle({
  container: {
    width: '100%',
    paddingVertical: 5,
    paddingLeft: 5,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeContainer: {
    width: 210,
    height: '100%',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  homeCenter: {
    width: '100%',
    flex: 0,
    paddingLeft: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  homeRight: {
    width: '100%',
    padding: 0,
    marginTop: 14,
    justifyContent: 'center',
  },
  left: {
    flexGrow: 0,
    flexShrink: 0,
  },
  center: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    paddingLeft: 5,
    height: '100%',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 0,
    flexShrink: 0,
    paddingLeft: 5,
    paddingRight: 5,
  },
})
