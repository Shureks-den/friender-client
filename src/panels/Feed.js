import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, Header, Group, CardGrid, ContentCard, Tabs, TabsItem, HorizontalScroll, Badge, Button, ButtonGroup, Spinner, IconButton } from '@vkontakte/vkui';
import { Icon24NewsfeedOutline, Icon24LogoVk, Icon24Users, Icon24ShareOutline, Icon24LikeOutline, Icon24Like } from '@vkontakte/icons';
import ApiSevice from '../modules/ApiSevice';

import '../assets/styles/Feed.scss';

import { setActiveEvents } from '../store/user/userSlice';

import { monthNames } from '../variables/constants';

const Feed = ({ id, go, makeRepost, fetchedUser, onSuccess }) => {
  const dispatch = useDispatch();
  const [eventsData, setEventsData] = useState([]);
  const [activeEventsIds, setActiveEventsIds] = useState([]);

  const user = useSelector(state => state.user.value);
  const activeEvents = useSelector(state => state.user.activeEvents);

  const [selected, setSelected] = React.useState('newEvents');

  const subscribe = async (elem) => {
    if (!activeEventsIds.find(i => i === elem.id)) {
      const response = await ApiSevice.put('event', elem.id, 'subscribe');
      if (response) {
        const activeEvents = await ApiSevice.getAll('events', {
          id: user.id,
          is_active: true,
        });
        dispatch(setActiveEvents(activeEvents));
      }
    }
  }

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
      time_start: elem.time_start / 1000, // тут милисекунды
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
              <div>
                <div style={{ paddingBottom: '12px' }}>{eventStart}</div>
                <ButtonGroup mode="horizontal" gap="m">
                  <Button onClick={() => createLink(elem.id)} size="s" stretched>
                    Подробнее
                  </Button>
                  <Button onClick={() => makeCopy(elem, onSuccess)} size="s" stretched>
                    Найти компанию
                  </Button>
                </ButtonGroup>
              </div>
            }
          />
        )
      } else {
        const city = elem.geo.address ? elem.geo.address.split(',')[0] : '';
        return (
          <ContentCard
            key={elem.id}
            src={elem.avatar.avatar_url}
            subtitle={elem.title}
            caption={<div className="event-caption">
              <div className='event-caption__info-wrapper'>
                <div className='event-caption__info-date'>
                  {eventStart}
                </div>
                <div className='event-caption__info-address'>
                  {city}
                </div>
              </div>
              <ButtonGroup mode="horizontal" gap="m" style={{ alignItems: 'center' }}>
                <IconButton onClick={() => subscribe(elem)}>
                  {activeEventsIds.find(i => i === elem.id) ? <Icon24Like /> : <Icon24LikeOutline />}
                </IconButton>
                <IconButton onClick={() => makeRepost(elem.id, elem.title, elem.avatar_url)}>
                  <Icon24ShareOutline />
                </IconButton>
                <Button onClick={() => go(elem.id)} style={{ position: 'absolute', right: '16px' }} >Подробнее</Button>
              </ButtonGroup>
            </div>}
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
  }, [user, selected, activeEventsIds]);

  useEffect(() => {
    setActiveEventsIds(activeEvents.map(a => a.id));
  }, [activeEvents]);

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
          >
            Новые события
          </TabsItem>
          <TabsItem
            selected={props.selected === "vkEvents"}
            onClick={() => props.setSelected("vkEvents")}
          >
            События Вконтакте
          </TabsItem>
          <TabsItem
            status={<Badge mode="prominent" />}
            selected={props.selected === "friendEvents"}
            onClick={() => props.setSelected("friendEvents")}
          >
            Подписки
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
