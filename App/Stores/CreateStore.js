import { applyMiddleware, compose, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { persistReducer, persistStore } from 'redux-persist'
import immutableTransform from 'redux-persist-transform-immutable'
import { createNetworkMiddleware } from 'react-native-offline'
import Reactotron from '../Config/ReactotronConfig'

/**
 * This import defaults to localStorage for web and AsyncStorage for react-native.
 *
 * Keep in mind this storage *is not secure*. Do not use it to store sensitive information
 * (like API tokens, private and sensitive data, etc.).
 *
 * If you need to store sensitive information, use redux-persist-sensitive-storage.
 * @see https://github.com/CodingZeal/redux-persist-sensitive-storage
 */
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  transforms: [
    /**
     * This is necessary to support immutable reducers.
     * @see https://github.com/rt2zz/redux-persist-transform-immutable
     */
    immutableTransform(),
  ],
  key: 'root',
  storage: storage,
  /**
   * Blacklist state that we do not need/want to persist
   */
  blacklist: [
    // 'auth',
  ],
}

const sagaMonitor = Reactotron.createSagaMonitor()

export default (rootReducer, rootSaga) => {
  const middleware = []
  const enhancers = []

  // Connect the sagas to the redux store
  const sagaMiddleware = createSagaMiddleware({ sagaMonitor })
  const networkMiddleware = createNetworkMiddleware()
  middleware.push(networkMiddleware)
  middleware.push(sagaMiddleware)

  enhancers.push(applyMiddleware(...middleware))

  // Redux persist
  const persistedReducer = persistReducer(persistConfig, rootReducer)

  // const store = createStore(persistedReducer, compose(...enhancers))
  const store = Reactotron.createStore(persistedReducer, compose(...enhancers))
  const persistor = persistStore(store)

  // Kick off the root saga
  sagaMiddleware.run(rootSaga)

  return { store, persistor }
}
