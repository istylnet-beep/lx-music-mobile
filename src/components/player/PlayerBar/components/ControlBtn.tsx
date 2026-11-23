import { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { useIsPlay } from '@/store/player/hook'
import { useTheme } from '@/store/theme/hook'
import { playNext, playPrev, togglePlay } from '@/core/player/player'
import { createStyle } from '@/utils/tools'
import { useHorizontalMode } from '@/utils/hooks'

const handlePlayPrev = () => {
  void playPrev()
}
const handlePlayNext = () => {
  void playNext()
}

const ControlButton = ({ icon, onPress, isPlayButton = false }: {
  icon: string
  onPress: () => void
  isPlayButton?: boolean
}) => {
  const theme = useTheme()
  const isHorizontalMode = useHorizontalMode()
  const [focused, setFocused] = useState(false)
  const size = isHorizontalMode ? (isPlayButton ? 32 : 27) : 24

  return (
    <TouchableOpacity
      focusable
      style={[
        styles.cotrolBtn,
        isHorizontalMode && styles.tvControlBtn,
        isPlayButton && isHorizontalMode && styles.tvPlayBtn,
        focused && styles.focusedBtn,
      ]}
      activeOpacity={0.75}
      onFocus={() => { setFocused(true) }}
      onBlur={() => { setFocused(false) }}
      onPress={onPress}
    >
      <Icon name={icon} color={focused ? '#EAFBFF' : theme['c-button-font']} size={size} />
    </TouchableOpacity>
  )
}

const PlayPrevBtn = () => <ControlButton icon="prevMusic" onPress={handlePlayPrev} />
const PlayNextBtn = () => <ControlButton icon="nextMusic" onPress={handlePlayNext} />
const TogglePlayBtn = () => {
  const isPlay = useIsPlay()
  return <ControlButton icon={isPlay ? 'pause' : 'play'} onPress={() => { togglePlay() }} isPlayButton />
}

export default () => {
  const isHorizontalMode = useHorizontalMode()
  return (
    <>
      { isHorizontalMode ? <PlayPrevBtn /> : null }
      <TogglePlayBtn />
      <PlayNextBtn />
    </>
  )
}

const styles = createStyle({
  cotrolBtn: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 1,
    textShadowRadius: 1,
  },
  tvControlBtn: {
    width: 58,
    height: 58,
    marginHorizontal: 5,
    borderRadius: 16,
    backgroundColor: '#101923',
    borderWidth: 1,
    borderColor: '#263847',
  },
  tvPlayBtn: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#123344',
  },
  focusedBtn: {
    borderWidth: 3,
    borderColor: '#42CFF8',
    backgroundColor: '#16465B',
  },
})
