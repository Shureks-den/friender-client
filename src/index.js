import React from 'react';
import ReactDOM from 'react-dom';
import bridge from '@vkontakte/vk-bridge';
import App from './App';

import { RouterProvider } from 'react-router-vkminiapps-updated';
import { structure } from './routing/structure.js';

import store from './store/store.js';
import { Provider } from 'react-redux';

// Init VK  Mini App
bridge.send('VKWebAppInit');

const root = document.getElementById('root');

ReactDOM.render(
  <RouterProvider structure={structure}>
    <Provider store={store}>
      <App />
    </Provider>
  </RouterProvider>,
  root);

if (process.env.NODE_ENV === 'development') {
  import('./eruda').then(({ default: eruda }) => {}); // runtime download
}
