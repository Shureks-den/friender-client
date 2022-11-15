import React, { useEffect, useState, useRef } from 'react';
import { Icon56ErrorOutline, Icon56UsersOutline } from '@vkontakte/icons';

import { Div, Text, } from '@vkontakte/vkui';


export const NotFoundContent = ({ image, text, iconType = 'notFound' }) => {
  return (
    <Div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {
        image ?
          <img src={image} style={{ display: 'block', height: '250px', width: '250px' }} /> :
          iconType === 'notFound' ?
            <Icon56ErrorOutline fill='#e64646' /> :
            <Icon56UsersOutline />
      }
      <Text style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>{text}</Text>
    </Div>
  )
}