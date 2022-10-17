import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, PanelHeaderBack, Input, FormItem, Button, Card, Group, Text, Header, Cell, Avatar, HorizontalScroll, HorizontalCell, ButtonGroup } from '@vkontakte/vkui';
import '../assets/styles/Event.scss';

import ApiSevice from '../modules/ApiSevice';

import Map from '../components/Map.js';

const Event = props => {
  const [eventData, setEventData] = useState({});
  const [members, setMembers] = useState([]);
  const [eventAuthor, setEventAuthor] = useState(null);
  const [eventImage, setEventImage] = useState(undefined);
  const [eventDate, setEventDate] = useState(new Date().toLocaleString());
  const [eventId, setEventId] = useState('');
  const user = useSelector(state => state.user.value);

  useEffect(async () => {
    try {
      const eId = props.eventId.length !== 0 ? props.eventId : window.location.hash?.slice(1).split('=').slice(1, 2).join('');
      setEventId(eId);
      const res = await ApiSevice.get('event/get', eId);
      if (!res) return;
      setEventData(res);
      const imageSrc = res.is_public ? res.images[0] : `https://vkevents.tk/static/${res.images[1]}`;
      setEventImage(imageSrc);

      const date = new Date(res.time_start).toLocaleString();
      setEventDate(date);

      if (res.author) {
        const author = await props.getUserInfo(res.author);
        setEventAuthor(author);
      }

      const transformedMembers = [];
      const memb = res.members;
      for (let i = 0; i < memb.length; i++) {
        if (memb[i] === res.author) continue;
        const member = await props.getUserInfo(memb[i]);

        transformedMembers.push(
          <HorizontalCell size="s" header={member.first_name} onClick={() => props.goToProfile(member.id)}>
            <Avatar size={64} src={member.photo_100} />
          </HorizontalCell>
        );
      }
      setMembers(transformedMembers);
    } catch (err) {
      console.log(err);
    }
  }, [user]);

  return (
    <Panel id={props.id}>
      <PanelHeader
        left={<PanelHeaderBack onClick={props.go} data-to='home' />}
      >
        {eventData.title}
      </PanelHeader>


      <Card mode="outline" style={{ width: '50%', margin: '20px auto' }}>
        <div style={{ height: 250 }} >
          <img className='event__avatar' src={eventImage} />
        </div>
      </Card>

      <FormItem top='Описание события'>
        <Text weight="semibold" style={{ outline: 'ridge', borderRadius: '8px', padding: '15px 10px' }}>{eventData.description}</Text>
      </FormItem>

      {
        eventAuthor
          ? <Group header={<Header mode="secondary">Автор</Header>} onClick={() => props.goToProfile(eventAuthor.id)}>
            <Cell
              before={eventAuthor.photo_200 ? <Avatar src={eventAuthor.photo_200} /> : null}
            >
              {`${eventAuthor.first_name} ${eventAuthor.last_name}`}
            </Cell>
          </Group>
          : <Text> Публичное событие </Text>
      }

      <Group header={<Header>Участники</Header>}>
        <HorizontalScroll showArrows
          getScrollToLeft={(i) => i - 120}
          getScrollToRight={(i) => i + 120}>
          <div style={{ display: "flex" }}>{members}</div>
        </HorizontalScroll>
      </Group>

      <FormItem top='Время события'>
        <Text weight="bold" style={{ padding: '15px 10px' }}>{eventDate}</Text>
      </FormItem>

      <Map isClickable={false} latitude={eventData.geo?.latitude} longitude={eventData.geo?.longitude} />


      <ButtonGroup
        mode="horizontal"
        stretched
        style={{ justifyContent: 'center', marginBottom: '30px' }}
      >
        <Button sizeY='regular' onClick={() => props.makeRepost(eventId, eventData?.title, eventImage)}> Поделиться </Button>
        <Button sizeY='regular' onClick={() => props.makeShare(eventId)}> Пригласить друзей </Button>
      </ButtonGroup>

      {user?.id === eventData.author ?

        <ButtonGroup
          mode="vertical"
          stretched
          style={{ justifyContent: 'center', marginBottom: '30px', alignItems: 'center' }}
        >
          <Button sizeY='regular' onClick={() => props.makeShare(eventId)}> Редактировать </Button>
          <Button sizeY='regular' onClick={() => props.makeShare(eventId)}> Удалить событие </Button>
        </ButtonGroup>

        : Boolean(eventData.members?.find(m => m === user?.id))

          ? <Button sizeY='regular' onClick={() => props.makeShare(eventId)}> Отписаться </Button>
          : <Button sizeY='regular' onClick={() => props.makeShare(eventId)}> Подписаться на событие </Button>
      }
    </Panel>
  );
};

Event.propTypes = {
  id: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
  go: PropTypes.func.isRequired,
  userId: PropTypes.number
};

export default Event;
