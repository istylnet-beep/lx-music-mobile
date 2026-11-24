import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { useTheme } from '@/store/theme/hook'
import { playNext, playPrev, togglePlay } from '@/core/player/player'
import { useIsPlay } from '@/store/player/hook'
import { useLayout } from '@/utils/hooks'
import { marginLeft } from '../constant'
import { BTN_WIDTH } from '../MoreBtn/Btn'
import PlayModeBtn from '../MoreBtn/PlayModeBtn'

const PrevBtn = ({ size }: { size: number }) => {
  const theme = useTheme()
  const [focused, setFocused] = useState(false)
  const handlePlayPrev = () => {
    void playPrev()
  }
  return (
    <TouchableOpacity
      focusable
      style={[styles.cotrolBtn, { width: size, height: size }, focused && styles.focusedBtn]}
      activeOpacity={0.8}
      onFocus={() => { setFocused(true) }}
      onBlur={() => { setFocused(false) }}
      onPress={handlePlayPrev}
    >
      <Icon name='prevMusic' color={focused ? theme['c-primary-font-active'] : theme['c-button-font']} rawSize={size * 0.7} />
    </TouchableOpacity>
  )
}
const NextBtn = ({ size }: { size: number }) => {
  const theme = useTheme()
  const [focused, setFocused] = useState(false)
  const handlePlayNext = () => {
    void playNext()
  }
  return (
    <TouchableOpacity
      focusable
      style={[styles.cotrolBtn, { width: size, height: size }, focused && styles.focusedBtn]}
      activeOpacity={0.8}
      onFocus={() => { setFocused(true) }}
      onBlur={() => { setFocused(false) }}
      onPress={handlePlayNext}
    >
      <Icon name='nextMusic' color={focused ? theme['c-primary-font-active'] : theme['c-button-font']} rawSize={size * 0.7} />
    </TouchableOpacity>
  )
}

const TogglePlayBtn = ({ size }: { size: number }) => {
  const theme = useTheme()
  const isPlay = useIsPlay()
  const [focused, setFocused] = useState(false)
  return (
    <TouchableOpacity
      focusable
      style={[styles.cotrolBtn, { width: size, height: size }, focused && styles.focusedBtn]}
      activeOpacity={0.8}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={togglePlay}
    >
      <Icon name={isPlay ? 'pause' : 'play'} color={focused ? theme['c-primary-font-active'] : theme['c-button-font']} rawSize={size * 0.7} />
    </TouchableOpacity>
  )
}

const MIN_SIZE = BTN_WIDTH * 1.1
export default () => {
  const { onLayout, height, width } = useLayout()
  const size = Math.max(Math.min(height * 0.65, (width - marginLeft) * 0.52 * 0.3) * global.lx.fontSize, MIN_SIZE)
  return (
    <View style={{ ...styles.content, gap: size * 0.5 }} onLayout={onLayout}>
      <PrevBtn size={size} />
      <TogglePlayBtn size={size}/>
      <NextBtn size={size} />
      <PlayModeBtn />
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    gap: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cotrolBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focusedBtn: {
    borderColor: '#36C8E8',
    backgroundColor: 'rgba(54, 200, 232, 0.16)',
  },
})
