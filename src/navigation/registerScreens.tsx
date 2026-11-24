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
 * Keeping screen imports out of this registration module prevents the app
 * bootstrap from eagerly evaluating the complete screen/component graph.
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
  Navigation.registerComponent(HOME_SCREEN, () => WrappedComponent(() => require('@/screens/Home').default))
  Navigation.registerComponent(PLAY_DETAIL_SCREEN, () => WrappedComponent(() => require('@/screens/PlayDetail').default))
  Navigation.registerComponent(SONGLIST_DETAIL_SCREEN, () => WrappedComponent(() => require('@/screens/SonglistDetail').default))
  Navigation.registerComponent(COMMENT_SCREEN, () => WrappedComponent(() => require('@/screens/Comment').default))
  Navigation.registerComponent(SYNC_MODE_MODAL, () => WrappedComponent(() => require('./components/SyncModeModal').default))

  console.info('All screens have been registered...')
}
