import { View } from 'react-native'
import Aside from './Aside'
import PlayerBar from '@/components/player/PlayerBar'
import StatusBar from '@/components/common/StatusBar'
import Header from './Header'
import Main from './Main'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'

const styles = createStyle({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
})

export default () => {
  const theme = useTheme()
  return (
    <>
      <StatusBar />
      <View style={styles.container}>
        <Aside />
        <PlayerBar isHome />
        <View style={{ ...styles.content, backgroundColor: theme['c-content-background'] }}>
          <Header />
          <Main />
        </View>
      </View>
    </>
  )
}
