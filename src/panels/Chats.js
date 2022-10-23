import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, Header, Group, CardGrid, ContentCard, Tabs, TabsItem, HorizontalScroll, Badge, Separator } from '@vkontakte/vkui';
import { Icon24NewsfeedOutline, Icon24LogoVk, Icon24Users } from '@vkontakte/icons';
import ApiSevice from '../modules/ApiSevice';

import { monthNames } from '../variables/constants';

const Chats = ({ id, go }) => {

  const user = useSelector(state => state.user.value);

  const [selected, setSelected] = React.useState("allChats");

  const getAllChats = async () => {
    
  }

  useEffect(async () => {
    setEventsData([]);
    if (selected === 'allChats') {
      await getNewEvents();
    }
  }, [user, selected]);

  return (
    <Panel id={id}>
      <PanelHeader style={{ textAlign: 'center' }} separator={false}>Чаты</PanelHeader>
      <Group>
        <CardGrid size='l'>
          {eventsData}
        </CardGrid>
      </Group>
    </Panel>
  );
};


Feed.propTypes = {
  id: PropTypes.string.isRequired,
  go: PropTypes.func.isRequired,
  fetchedUser: PropTypes.shape({
    photo_200: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    city: PropTypes.shape({
      title: PropTypes.string
    })
  })
};

export default Feed;
