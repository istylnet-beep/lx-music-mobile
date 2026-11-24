// @flow

import { Navigation } from 'react-native-navigation'
import { Provider } from '@/store/Provider'

import {
  HOME_SCREEN,
  PLAY_DETAIL_SCREEN,
  SONGLIST_DETAIL_SCREEN,
  COMMENT_SCREEN,
  SYNC_MODE_MODAL,
} from './screenNames'

/**
 * Resolve screen modules only when React Native Navigation renders a screen.
 * Use relative module IDs here: Metro does not consistently apply the
 * Babel path aliases to runtime require() calls.
 */
function WrappedComponent(loadComponent: () => any) {
  return function inject(props: Record<string, any>) {
    const EnhancedComponent = () => {
      const Component = loadComponent()
      return (
        <Provider>
          <Component {...props} />
        </Provider>
      )
    }

    return <EnhancedComponent />
  }
}

export default () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Navigation.registerComponent(HOME_SCREEN, () => WrappedComponent(() => require('../screens/Home').default))
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Navigation.registerComponent(PLAY_DETAIL_SCREEN, () => WrappedComponent(() => require('../screens/PlayDetail').default))
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Navigation.registerComponent(SONGLIST_DETAIL_SCREEN, () => WrappedComponent(() => require('../screens/SonglistDetail').default))
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Navigation.registerComponent(COMMENT_SCREEN, () => WrappedComponent(() => require('../screens/Comment').default))
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Navigation.registerComponent(SYNC_MODE_MODAL, () => WrappedComponent(() => require('./components/SyncModeModal').default))

  console.info('All screens have been registered...')
}
