import { View } from 'react-native'
import Aside from './Aside'
import PlayerBar from '@/components/player/PlayerBar'
import StatusBar from '@/components/common/StatusBar'
import Header from './Header'
import Main from './Main'
import { createStyle } from '@/utils/tools'
import { ThemeContext } from '@/store/theme/state'
import Themes from '@/theme/themes/themes'
import { buildActiveThemeColors } from '@/theme/themes/index'

// TV mode uses one fixed black/ice-blue palette regardless of the mobile theme preference.
const blackTheme = Themes.find(theme => theme.id === 'black')
if (!blackTheme) throw new Error('TV theme "black" is missing')
const TV_THEME = buildActiveThemeColors(blackTheme as LX.Theme)

const styles = createStyle({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
})

export default () => (
  <ThemeContext.Provider value={TV_THEME}>
    <>
      <StatusBar />
      <View style={styles.container}>
        <Aside />
        <PlayerBar isHome />
        <View style={styles.content}>
          <Header />
          <Main />
        </View>
      </View>
    </>
  </ThemeContext.Provider>
)
