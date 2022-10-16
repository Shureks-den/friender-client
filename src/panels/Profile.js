import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, PanelHeaderBack, Input, FormItem, Textarea, Button, File, HorizontalCell, HorizontalScroll, Avatar, Calendar, Group, Header, Checkbox, FormLayoutGroup, Select } from '@vkontakte/vkui';

const Profile = props => {
  return (
    <Panel id={props.id}>
      <PanelHeader
        left={<PanelHeaderBack onClick={props.go} data-to='home' />}
      >
        Пользователь
      </PanelHeader>
    </Panel>
  )
}

export default Profile;