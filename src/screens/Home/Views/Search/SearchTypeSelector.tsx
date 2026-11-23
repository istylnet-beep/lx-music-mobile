import { useEffect, useMemo, useState } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'

import { createStyle } from '@/utils/tools'
import { type SearchType } from '@/store/search/state'
import { useI18n } from '@/lang'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'
import { getSearchSetting } from '@/utils/data'
import { BorderWidths } from '@/theme'

const SEARCH_TYPE_LIST = [
  'music',
  'songlist',
] as const

export default () => {
  const t = useI18n()
  const theme = useTheme()
  const [type, setType] = useState<SearchType>('music')
  const [focusedType, setFocusedType] = useState<SearchType | null>(null)

  useEffect(() => {
    void getSearchSetting().then(info => {
      setType(info.type)
    })
  }, [])

  const list = useMemo(() => {
    return SEARCH_TYPE_LIST.map(type => ({ label: t(`search_type_${type}`), id: type }))
  }, [t])

  const handleTypeChange = (type: SearchType) => {
    setType(type)
    global.app_event.searchTypeChanged(type)
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps={'always'} horizontal={true}>
      {
        list.map(t => (
          <TouchableOpacity
            focusable
            hasTVPreferredFocus={type == t.id}
            style={[styles.button, (focusedType == t.id || type == t.id) && styles.tvActiveButton, focusedType == t.id && styles.tvFocusedButton]}
            onFocus={() => { setFocusedType(t.id) }}
            onBlur={() => { setFocusedType(null) }}
            onPress={() => { handleTypeChange(t.id) }}
            key={t.id}
          >
            <Text style={{ ...styles.buttonText, borderBottomColor: type == t.id ? theme['c-primary-background-active'] : 'transparent' }} color={type == t.id ? theme['c-primary-font-active'] : theme['c-font']}>{t.label}</Text>
          </TouchableOpacity>
        ))
      }
    </ScrollView>
  )
}

const styles = createStyle({
  container: {
    height: '100%',
    flexGrow: 0,
    flexShrink: 1,
    // paddingLeft: 5,
    // paddingRight: 5,
    // backgroundColor: 'rgba(0,0,0,0.1)',
  },
  button: {
    minHeight: 46,
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    // height: 38,
    // lineHeight: 38,
    justifyContent: 'center',
    paddingLeft: 8,
    paddingRight: 8,
    // width: 80,
    // backgroundColor: 'rgba(0,0,0,0.1)',
  },
  tvActiveButton: {
    backgroundColor: 'rgba(40, 200, 245, 0.14)',
  },
  tvFocusedButton: {
    borderWidth: 2,
    borderColor: '#42CFF8',
  },
  buttonText: {
    // height: 38,
    // lineHeight: 38,
    textAlign: 'center',
    paddingLeft: 2,
    paddingRight: 2,
    // paddingTop: 10,
    paddingTop: 3,
    paddingBottom: 3,
    borderBottomWidth: BorderWidths.normal3,
    // width: 80,
  },
})
