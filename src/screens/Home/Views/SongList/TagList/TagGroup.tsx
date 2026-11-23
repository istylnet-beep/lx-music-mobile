import { View } from 'react-native'

import Button from '@/components/common/Button'
import { type TagInfoItem } from '@/store/songlist/state'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'
import { useHorizontalMode } from '@/utils/hooks'
import { useState } from 'react'

export interface TagGroupProps {
  name: string
  list: TagInfoItem[]
  onTagChange: (name: string, id: string) => void
  activeId: string
}

export default ({ name, list, onTagChange, activeId }: TagGroupProps) => {
  const theme = useTheme()
  const isTV = useHorizontalMode()
  const [focusedId, setFocusedId] = useState<string | null>(null)
  return (
    <View>
      {
        name
          ? <Text style={styles.tagTypeTitle} color={theme['c-font-label']}>{name}</Text>
          : null
      }
      <View style={styles.tagTypeList}>
        {list.map(item => (
          activeId == item.id
            ? (
                <View style={{ ...styles.tagButton, backgroundColor: theme['c-button-background'] }} key={item.id}>
                  <Text style={styles.tagButtonText} color={theme['c-primary-font-active']}>{item.name}</Text>
                </View>
              )
            : (
                <Button
                  style={{ ...styles.tagButton, backgroundColor: theme['c-button-background'], ...(isTV && focusedId == item.id ? styles.tvFocused : null) }}
                  key={item.id}
                  onFocus={() => { setFocusedId(item.id) }}
                  onBlur={() => { setFocusedId(null) }}
                  onPress={() => { onTagChange(item.name, item.id) }}
                >
                  <Text style={[styles.tagButtonText, isTV && styles.tvTagButtonText]} color={theme['c-font']} >{item.name}</Text>
                </Button>
              )

        ))}
      </View>
    </View>
  )
}

const styles = createStyle({
  tagTypeTitle: {
    marginTop: 15,
    marginBottom: 10,
  },
  tagTypeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    // marginRight: 10,
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 10,
  },
  tvFocused: {
    borderWidth: 2,
    borderColor: '#42CFF8',
    backgroundColor: '#102330',
  },
  tvTagButtonText: {
    fontSize: 17,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  tagButtonText: {
    fontSize: 13,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
})
