import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, Header, Group, CardGrid, ContentCard, Tabs, TabsItem, HorizontalScroll, Badge, Button, ButtonGroup, Spinner, Link } from '@vkontakte/vkui';
import { Icon24NewsfeedOutline, Icon24LogoVk, Icon24Users } from '@vkontakte/icons';
import ApiSevice from '../modules/ApiSevice';

import '../assets/styles/Feed.scss';

import { monthNames } from '../variables/constants';

const Feed = ({ id, go, makeRepost, fetchedUser, onSuccess}) => {
  const [eventsData, setEventsData] = useState([]);
  const user = useSelector(state => state.user.value);

  const [selected, setSelected] = React.useState("newEvents");

  const createLink = (id, onSuccess) => {
    const link = document.createElement('a');
    link.href = `https://vk.com/event${id}`;
    link.target = '_blank';
    link.click();
  }

  const makeCopy = async (elem) => {
    const body = {
      title: elem.title,
      avatar: elem.avatar,
      description: elem.description,
      author: user.id,
      category: elem.category,
      source: 'user',
      group_info: null,
      time_start: elem.time_start,
      members_limit: Number(5),
      is_private: false,
    };
    console.log(elem)
    const { response } = await ApiSevice.post('event/create', body);
    onSuccess(response.id);
  }

  const setEvents = (res, isVk) => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();

    if (!res) return;
    console.log(res);
    const listItems = res.map((elem) => {
      const eventDate = new Date(elem.time_start * 1000);
      const time = `${eventDate.getDate()} ${monthNames[eventDate.getMonth()]}, ${eventDate.getHours()}:${eventDate.getMinutes() < 10 ? '0' : ''}${eventDate.getMinutes()}`;
      const eventStart = (day === eventDate.getDate() && month === eventDate.getMonth()) ? 'Сегодня' : '' + time;
      if (isVk) {
        return (
          <ContentCard
            key={elem.id}
            src={elem.avatar.avatar_url}
            subtitle={elem.title}
            className='vk-event'
            caption={
              <ButtonGroup mode="horizontal" gap="m">
                <Button onClick={() => createLink(elem.id)} size="s" stretched>
                  Подробнее
                </Button>
                <Button onClick={() => makeCopy(elem, onSuccess)} size="s" stretched>
                  Сделать копию
                </Button>
              </ButtonGroup>}
            text={eventStart}
          />
        )
      } else {
        return (
          <ContentCard
            key={elem.id}
            src={elem.avatar.avatar_url}
            subtitle={elem.title}
            caption={eventStart}
            onClick={() => go(elem.id)}
          />)
      }

    });
    setEventsData(listItems);
  }

  const getVkEvents = async () => {
    const res = await ApiSevice.getAll('events', {
      is_active: true,
      source: 'vk_event',
    });
    setEvents(res, true);
  }

  const getNewEvents = async () => {
    const res = await ApiSevice.getAll('events', {
      is_active: true,
      source: 'not_vk',
    });
    setEvents(res);
  }

  useEffect(async () => {
    setEventsData([]);
    if (selected === 'newEvents') {
      await getNewEvents();
    } else if (selected === 'vkEvents') {
      await getVkEvents();
    }
  }, [user, selected]);

  return (
    <Panel id={id}>
      <PanelHeader style={{ textAlign: 'center' }} separator={false}>Лента событий</PanelHeader>
      <Scrollable selected={selected} setSelected={setSelected} />
      <Group>
        <CardGrid size='l'>
          {eventsData.length ? eventsData : <Spinner size="large" style={{ margin: "20px 0" }} />}
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
