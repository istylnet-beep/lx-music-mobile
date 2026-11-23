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
    <View style={isHome ? { ...styles.tvContainer, backgroundColor: theme['c-content-background'], borderRightColor: theme['c-border-background'] } : { ...styles.container, backgroundColor: theme['c-content-background'] }}>
      <Pic isHome={isHome} />
      <View style={isHome ? styles.tvCenter : styles.center}>
        <Title isHome={isHome} />
        <PlayInfo isHome={isHome} />
      </View>
      <View style={isHome ? styles.tvRight : styles.right}>
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
    elevation: 10,
  },
  tvContainer: {
    width: 224,
    flexGrow: 0,
    flexShrink: 0,
    height: '100%',
    paddingHorizontal: 14,
    paddingVertical: 24,
    borderRightWidth: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    elevation: 10,
  },
  center: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    paddingLeft: 5,
    height: '100%',
  },
  tvCenter: {
    width: '100%',
    flexGrow: 0,
    flexShrink: 1,
    paddingLeft: 0,
    paddingTop: 14,
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 0,
    flexShrink: 0,
    paddingLeft: 5,
    paddingRight: 5,
  },
  tvRight: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 0,
    flexShrink: 0,
    paddingTop: 20,
  },
})
