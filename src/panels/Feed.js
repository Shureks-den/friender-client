import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, Header, Group, CardGrid, ContentCard, Tabs, TabsItem, HorizontalScroll, Badge, Separator } from '@vkontakte/vkui';
import { Icon24NewsfeedOutline, Icon24LogoVk, Icon24Users } from '@vkontakte/icons';
import ApiSevice from '../modules/ApiSevice';

import { monthNames } from '../variables/constants';

const Feed = ({ id, go, makeRepost, fetchedUser }) => {
  const [eventsData, setEventsData] = useState([]);
  const user = useSelector(state => state.user.value);

  const [selected, setSelected] = React.useState("newEvents");

  const getNewEvents = async () => {
    const res = await ApiSevice.getAll('events', {
      is_active: true,
    });
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();

    if (!res) return;
    console.log(res);
    const listItems = res.map((elem) => {
      const eventDate = new Date(elem.time_start * 1000);
      const time = `${eventDate.getDate()} ${monthNames[eventDate.getMonth()]}, ${eventDate.getHours()}:${eventDate.getMinutes()<10?'0':''}${eventDate.getMinutes()}`;
      const eventStart = (day === eventDate.getDate() && month === eventDate.getMonth()) ? 'Сегодня' : '' + time;
      return (
        <ContentCard
          src={elem.avatar.avatar_url}
          subtitle={elem.title}
          caption={time}
          onClick={() => go(elem.id)} key={elem.id}
        />)
    });
    setEventsData(listItems);
  }

  useEffect(async () => {
    setEventsData([]);
    if (selected === 'newEvents') {
      await getNewEvents();
    }
  }, [user, selected]);

  return (
    <Panel id={id}>
      <PanelHeader style={{ textAlign: 'center' }} separator={false}>Лента событий</PanelHeader>
      <Scrollable selected={selected} setSelected={setSelected} />
      <Group>
        <CardGrid size='l'>
          {eventsData}
        </CardGrid>
      </Group>
    </Panel>
  );
};

const Scrollable = (props) => {
  const mode = 'default';

  return (
    <Group>
      <Tabs mode={mode}>
        <HorizontalScroll arrowsize="m">
          <TabsItem
            selected={props.selected === "newEvents"}
            onClick={() => props.setSelected("newEvents")}
            before={
              <Icon24NewsfeedOutline />
            }
          >
            Новые события
          </TabsItem>
          <TabsItem
            before={
              <Icon24LogoVk />
            }
            selected={props.selected === "vkEvents"}
            onClick={() => props.setSelected("vkEvents")}
          >
            События Вконтакте
          </TabsItem>
          <TabsItem
            before={
              <Icon24Users />
            }
            status={<Badge mode="prominent" />}
            selected={props.selected === "friendEvents"}
            onClick={() => props.setSelected("friendEvents")}
          >
            События друзей
          </TabsItem>
        </HorizontalScroll>
      </Tabs>
    </Group>
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
