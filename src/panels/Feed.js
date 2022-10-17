import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, Header, Button, Group, Cell, Div, CardGrid, ContentCard } from '@vkontakte/vkui';
import ApiSevice from '../modules/ApiSevice';

const Feed = ({ id, go, makeRepost, fetchedUser }) => {
  const [eventsData, setEventsData] = useState([]);
  const user = useSelector(state => state.user.value);

  useEffect(async () => {
    try {
      const res = await ApiSevice.getAll('events');
      if (!res) return;
      console.log(res);
      const listItems = res.map((elem) =>
        <ContentCard src={elem.is_public ? elem.images[0] : `https://vkevents.tk/static/${elem.images[1]}`} subtitle={elem.title} caption={Date(elem.data)} onClick={() => go(elem.id)} key={elem.id} />
      );
      setEventsData(listItems);
    } catch (err) {
      console.log(err);
    }
  }, [user]);

  return (
    <Panel id={id}>
      <PanelHeader>Лента событий</PanelHeader>
      <Group header={<Header mode='secondary'>Новые события</Header>}>
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
