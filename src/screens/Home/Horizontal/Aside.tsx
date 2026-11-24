import { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
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

const NAV_WIDTH = 64

const styles = createStyle({
  container: {
    flexGrow: 0,
    flexShrink: 0,
    borderRightWidth: BorderWidths.normal,
    paddingBottom: 8,
    width: NAV_WIDTH,
  },
  header: {
    paddingTop: 18,
    paddingBottom: 18,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginTop: 3,
    fontWeight: '600',
  },
  menus: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
  },
  list: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingTop: 4,
    paddingBottom: 4,
  },
  menuItem: {
    minHeight: 48,
    flexShrink: 0,
    flexDirection: 'row',
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeMenuItem: {
    marginHorizontal: 5,
    paddingHorizontal: 0,
    borderRadius: 10,
  },
  iconContent: {
    width: 40,
    alignItems: 'center',
  },
})

const Header = () => {
  const theme = useTheme()
  const statusBarHeight = useStatusbarHeight()
  return (
    <View style={{ paddingTop: statusBarHeight }}>
      <View style={styles.header}>
        <Icon name="logo" color={theme['c-primary-dark-100-alpha-300']} size={32} />
        <Text style={styles.headerText} size={12} color={theme['c-font']}>Music</Text>
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
  const active = activeId == id

  return active
    ? <View style={{ ...styles.menuItem, ...styles.activeMenuItem, backgroundColor: theme['c-primary'] }}>
        <View style={styles.iconContent}>
          <Icon name={icon} size={22} color={theme['c-primary-font-active']} />
        </View>
      </View>
    : <TouchableOpacity style={styles.menuItem} onPress={() => { onPress(id) }}>
        <View style={styles.iconContent}>
          <Icon name={icon} size={22} color={theme['c-font-label']} />
        </View>
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
      <View style={styles.menus}>
        <View style={styles.list}>
          {NAV_MENUS.map(menu => <MenuItem key={menu.id} id={menu.id} icon={menu.icon} onPress={handlePress} />)}
        </View>
      </View>
      {
        showBackBtn ? <MenuItem id="back_home" icon="home" onPress={handlePress} /> : null
      }
    </View>
  )
})
