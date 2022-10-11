import React from 'react';
import ReactDOM from 'react-dom';
import bridge from '@vkontakte/vk-bridge';
import App from './App';

import { RouterProvider } from 'react-router-vkminiapps-updated';
import { structure } from './routing/structure.js';

// Init VK  Mini App
bridge.send('VKWebAppInit');

ReactDOM.render(<RouterProvider structure={structure}> <App /> </RouterProvider>, document.getElementById('root'));
if (process.env.NODE_ENV === 'development') {
  import('./eruda').then(({ default: eruda }) => {}); // runtime download
}
