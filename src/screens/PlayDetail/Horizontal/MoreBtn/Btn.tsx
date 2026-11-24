import { TouchableOpacity } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { scaleSizeW } from '@/utils/pixelRatio'

export const BTN_WIDTH = scaleSizeW(32)
export const BTN_ICON_SIZE = 22

export default ({ icon, color, onPress, buttonSize = BTN_WIDTH, iconSize = BTN_ICON_SIZE }: {
  icon: string
  color?: string
  onPress: () => void
  buttonSize?: number
  iconSize?: number
}) => {
  const theme = useTheme()
  return (
    <TouchableOpacity style={{ ...styles.cotrolBtn, width: buttonSize, height: buttonSize }} activeOpacity={0.5} onPress={onPress}>
      <Icon name={icon} color={color ?? theme['c-font-label']} size={iconSize} />
    </TouchableOpacity>
  )
}

const styles = createStyle({
  cotrolBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 1,
    textShadowRadius: 1,
  },
})
