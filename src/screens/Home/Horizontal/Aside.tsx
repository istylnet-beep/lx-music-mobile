import { memo } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { useNavActiveId, useStatusbarHeight } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
import { createStyle, exitApp as backHome } from '@/utils/tools'
import { NAV_MENUS } from '@/config/constant'
import type { InitState } from '@/store/common/state'
import { setNavActiveId } from '@/core/common'
import { BorderWidths } from '@/theme'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'

const NAV_WIDTH = 190

const styles = createStyle({
  container: {
    flexGrow: 0,
    borderRightWidth: BorderWidths.normal,
    paddingBottom: 10,
    width: NAV_WIDTH,
  },
  header: {
    paddingTop: 18,
    paddingBottom: 22,
    paddingLeft: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 10,
    fontWeight: '600',
  },
  menus: {
    flex: 1,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 15,
  },
  menuItem: {
    minHeight: 54,
    flexDirection: 'row',
    paddingHorizontal: 18,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  activeMenuItem: {
    marginHorizontal: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  iconContent: {
    width: 30,
    alignItems: 'center',
  },
  text: {
    paddingLeft: 12,
    flexShrink: 1,
  },
})

const Header = () => {
  const theme = useTheme()
  const statusBarHeight = useStatusbarHeight()
  return (
    <View style={{ paddingTop: statusBarHeight }}>
      <View style={styles.header}>
        <Icon name="logo" color={theme['c-primary-dark-100-alpha-300']} size={28} />
        <Text style={styles.headerText} size={18} color={theme['c-font']}>LX Music TV</Text>
      </View>
    </View>
  )
}

type IdType = InitState['navActiveId'] | 'back_home'

const MenuItem = ({ id, icon, onPress }: {
  id: IdType
  icon: string
  onPress: (id: IdType) => void
}) => {
  const activeId = useNavActiveId()
  const theme = useTheme()
  const t = useI18n()
  const active = activeId == id

  return active
    ? <View style={{ ...styles.menuItem, ...styles.activeMenuItem, backgroundColor: theme['c-primary'] }}>
        <View style={styles.iconContent}>
          <Icon name={icon} size={22} color={theme['c-primary-font-active']} />
        </View>
        <Text style={styles.text} size={16} color={theme['c-primary-font-active']} weight="600">{id === 'back_home' ? t('back_home') : t(id)}</Text>
      </View>
    : <TouchableOpacity style={styles.menuItem} onPress={() => { onPress(id) }}>
        <View style={styles.iconContent}>
          <Icon name={icon} size={22} color={theme['c-font-label']} />
        </View>
        <Text style={styles.text} size={16} color={theme['c-font']}>{id === 'back_home' ? t('back_home') : t(id)}</Text>
      </TouchableOpacity>
}

export default memo(() => {
  const theme = useTheme()
  const showBackBtn = useSettingValue('common.showBackBtn')

  const handlePress = (id: IdType) => {
    switch (id) {
      case 'back_home':
        backHome()
        return
    }

    global.app_event.changeMenuVisible(false)
    setNavActiveId(id)
  }

  return (
    <View style={{ ...styles.container, borderRightColor: theme['c-border-background'] }}>
      <Header />
      <ScrollView style={styles.menus}>
        <View style={styles.list}>
          {NAV_MENUS.map(menu => <MenuItem key={menu.id} id={menu.id} icon={menu.icon} onPress={handlePress} />)}
        </View>
      </ScrollView>
      {
        showBackBtn ? <MenuItem id="back_home" icon="home" onPress={handlePress} /> : null
      }
    </View>
  )
})
