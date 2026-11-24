import { useCallback, useRef, useState } from 'react'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'
import Button, { type BtnType } from '@/components/common/Button'
import { createStyle } from '@/utils/tools'
import { type BoardItem } from '@/store/leaderboard/state'
import { Icon } from '@/components/common/Icon'

export interface ListItemProps {
  item: BoardItem
  index: number
  longPressIndex: number
  activeId: string
  onShowMenu: (id: string, name: string, index: number, position: { x: number, y: number, w: number, h: number }) => void
  onBoundChange: (item: BoardItem) => void
}

export default ({ item, activeId, index, longPressIndex, onBoundChange, onShowMenu }: ListItemProps) => {
  const theme = useTheme()
  const buttonRef = useRef<BtnType>(null)
  const [focused, setFocused] = useState(false)

  const setPosition = useCallback(() => {
    if (buttonRef.current?.measure) {
      buttonRef.current.measure((fx, fy, width, height, px, py) => {
        onShowMenu(item.id, item.name, index, { x: Math.ceil(px), y: Math.ceil(py), w: Math.ceil(width), h: Math.ceil(height) })
      })
    }
  }, [index, item, onShowMenu])

  const active = activeId == item.id
  const highlighted = active || focused || index == longPressIndex

  return (
    <Button
      ref={buttonRef}
      focusable
      style={{
        ...styles.button,
        backgroundColor: active
          ? theme['c-primary-alpha-200']
          : focused || index == longPressIndex ? theme['c-primary-alpha-100'] : 'transparent',
        borderWidth: 0,
      }}
      key={item.id}
      onFocus={() => { setFocused(true) }}
      onBlur={() => { setFocused(false) }}
      onLongPress={setPosition}
      onPress={() => { onBoundChange(item) }}
    >
      {
        active
          ? <Icon style={styles.listActiveIcon} name="chevron-right" size={12} color={theme['c-primary']} />
          : null
      }
      <Text style={styles.listName} size={14} textBreakStrategy="simple" color={highlighted ? theme['c-primary'] : theme['c-font-label']} numberOfLines={1}>{item.name}</Text>
    </Button>
  )
}

const styles = createStyle({
  button: {
    paddingLeft: 5,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
  },
  listActiveIcon: {
    marginLeft: 3,
    textAlign: 'center',
  },
  listName: {
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 6,
  },
})
