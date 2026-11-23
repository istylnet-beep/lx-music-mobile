import { TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useHorizontalMode } from '@/utils/hooks'
import { Icon } from '@/components/common/Icon'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { scaleSizeW } from '@/utils/pixelRatio'

export const BTN_WIDTH = scaleSizeW(32)
export const BTN_ICON_SIZE = 22

export default ({ icon, color, onPress }: {
  icon: string
  color?: string
  onPress: () => void
}) => {
  const theme = useTheme()
  const isTV = useHorizontalMode()
  const [focused, setFocused] = useState(false)
  return (
    <TouchableOpacity
      focusable
      onFocus={() => { setFocused(true) }}
      onBlur={() => { setFocused(false) }}
      style={[styles.cotrolBtn, { width: BTN_WIDTH, height: BTN_WIDTH }, isTV && focused && styles.tvFocused]}
      activeOpacity={0.5}
      onPress={onPress}
    >
      <Icon name={icon} color={color ?? theme['c-font-label']} size={BTN_ICON_SIZE} />
    </TouchableOpacity>
  )
}

const styles = createStyle({
  tvFocused: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#42CFF8',
    backgroundColor: '#102B36',
  },
  cotrolBtn: {
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',

    // backgroundColor: '#ccc',
    shadowOpacity: 1,
    textShadowRadius: 1,
  },
})
