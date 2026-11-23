import { memo, useState } from 'react'
import { View, Platform, TouchableOpacity } from 'react-native'
import { createStyle } from '@/utils/tools'
import { type ListInfoItem } from '@/store/songlist/state'
import Text from '@/components/common/Text'
import { scaleSizeW } from '@/utils/pixelRatio'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import { useTheme } from '@/store/theme/hook'
import Image from '@/components/common/Image'
import { useHorizontalMode } from '@/utils/hooks'

const gap = scaleSizeW(15)
export default memo(({ item, index, width, showSource, onPress }: {
  item: ListInfoItem
  index: number
  showSource: boolean
  width: number
  onPress: (item: ListInfoItem, index: number) => void
}) => {
  const theme = useTheme()
  const isTV = useHorizontalMode()
  const [focused, setFocused] = useState(false)
  const itemWidth = width - gap
  const handlePress = () => {
    onPress(item, index)
  }
  return (
    item.source
      ? (
          <View style={{ ...styles.listItem, width: itemWidth }}>
            <View style={{ ...styles.listItemImg, backgroundColor: theme['c-content-background'] }}>
              <TouchableOpacity
                focusable
                activeOpacity={0.5}
                onFocus={() => { setFocused(true) }}
                onBlur={() => { setFocused(false) }}
                onPress={handlePress}
                style={isTV && focused ? styles.tvFocused : undefined}
              >
                <Image url={item.img} nativeID={`${NAV_SHEAR_NATIVE_IDS.songlistDetail_pic}_from_${item.id}`} style={{ width: itemWidth, height: itemWidth, borderRadius: 4 }} />
                { showSource ? <Text style={styles.sourceLabel} size={9} color="#fff" >{item.source}</Text> : null }
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              focusable
              activeOpacity={0.5}
              onFocus={() => { setFocused(true) }}
              onBlur={() => { setFocused(false) }}
              onPress={handlePress}
              style={isTV && focused ? styles.tvTitleFocused : undefined}
            >
              <Text style={[styles.listItemTitle, isTV && styles.tvListItemTitle]} numberOfLines={ 2 }>{item.name}</Text>
            </TouchableOpacity>
            {/* <Text>{JSON.stringify(item)}</Text> */}
          </View>
        )
      : <View style={{ ...styles.listItem, width: itemWidth }} />
  )
})

const styles = createStyle({
  listItem: {
    // width: 90,
    margin: 10,
  },
  listItemImg: {
    // backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 5,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sourceLabel: {
    paddingLeft: 4,
    paddingBottom: 2,
    paddingRight: 4,
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  tvFocused: {
    borderWidth: 3,
    borderColor: '#42CFF8',
    borderRadius: 8,
    padding: 3,
    backgroundColor: '#102330',
  },
  tvTitleFocused: {
    borderRadius: 6,
    backgroundColor: 'rgba(66, 207, 248, 0.12)',
  },
  tvListItemTitle: {
    fontSize: 17,
    lineHeight: 24,
    marginTop: 5,
  },
  listItemTitle: {
    fontSize: 12,
    // overflow: 'hidden',
    marginBottom: 5,
  },
})
