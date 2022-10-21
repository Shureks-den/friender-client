import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, PanelHeaderBack, Input, FormItem, Button, Card, Group, Text, Header, Cell, Avatar, HorizontalScroll, HorizontalCell, ButtonGroup, IconButton } from '@vkontakte/vkui';
import { Icon24Share, Icon24Camera, Icon24Message } from '@vkontakte/icons';
import '../assets/styles/Event.scss';

import ApiSevice from '../modules/ApiSevice';

import Map from '../components/Map/Map.js';
import VkApiService from '../modules/VkApiService';

const Event = props => {
  const [eventData, setEventData] = useState({});
  const [members, setMembers] = useState([]);
  const [eventAuthor, setEventAuthor] = useState(null);
  const [eventImage, setEventImage] = useState(undefined);
  const [eventImageId, setEventImageId] = useState(null);
  const [eventDate, setEventDate] = useState(new Date().toLocaleString());
  const [eventId, setEventId] = useState('');
  const [isMember, setIsMember] = useState(false);

  const [groupInfo, setGroupInfo] = useState({});

  const user = useSelector(state => state.user.value);

  const subscribe = async (id) => {
    const response = await ApiSevice.put('event', id, 'subscribe');
    setIsMember(true);
    console.log(response);
  }

  const unsubscribe = async (id) => {
    const response = await ApiSevice.put('event', id, 'unsubscribe');
    setIsMember(false);
    console.log(response);
    if (!eventData.is_active) {
      props.go();
    }
  }

  const deleteEvent = async (id) => {
    const response = await ApiSevice.put('event', id, 'delete');
    props.go();
  }

  useEffect(async () => {
    try {
      const eId = props.eventId.length !== 0 ? props.eventId : window.location.hash?.slice(1).split('=').slice(1, 2).join('');
      setEventId(eId);
      const res = await ApiSevice.get('event/get', eId);
      if (!res) return;
      setEventData(res);
      const imageSrc = res.avatar.avatar_url;
      setEventImageId(res.avatar.avatar_vk_id);
      setEventImage(imageSrc);

      const date = new Date(res.time_start * 1000).toLocaleString();
      setEventDate(date);

      if (res.author) {
        const author = await props.getUserInfo(res.author);
        setEventAuthor(author);
      }

      const transformedMembers = [];
      setIsMember(Boolean(res.members?.find(m => m === user?.id)));
      const memb = res.members;
      for (let i = 0; i < memb.length; i++) {
        if (memb[i] === res.author) continue;
        const member = await props.getUserInfo(memb[i]);

        transformedMembers.push(
          <HorizontalCell size="s" header={member.first_name} onClick={() => props.goToProfile(member.id)} key={member.id}>
            <Avatar size={64} src={member.photo_100} />
          </HorizontalCell>
        );
      }
      setMembers(transformedMembers);
    } catch (err) {
      console.log(err);
    }
  }, [user, isMember, eventId]);

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

      {eventData?.images?.filter(i => i !== '').length > 0 &&
        <Group header={
          <Header>
            Изображения
          </Header>
        }
        >
          <HorizontalScroll
            top='Изображения'
            showArrows
            getScrollToLeft={(i) => i - 120}
            getScrollToRight={(i) => i + 120}
          >
            <div style={{ display: 'flex', userSelect: 'none' }}>
              {eventData?.images?.filter(i => i !== '').map((url, idx) =>
                <HorizontalCell size='m' key={idx}>
                  <Avatar
                    size={88}
                    mode='app'
                    src={url}
                  />
                </HorizontalCell>
              )}
            </div>
          </HorizontalScroll>
        </Group>
      }


      <FormItem top='Описание события'>
        <Text weight="semibold" style={{ outline: 'ridge', borderRadius: '8px', padding: '15px 10px' }}>{eventData.description}</Text>
      </FormItem>

      <FormItem top='Категория'>
        <Text weight="bold" >{eventData.category}</Text>
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


      {eventData.is_active &&
        <ButtonGroup
          mode="horizontal"
          stretched
          style={{ justifyContent: 'center', marginBottom: '30px' }}
        >
          <IconButton onClick={() => props.makeRepost(eventId, eventData?.title, eventImageId)}>
            <Icon24Share />
          </IconButton>
          <IconButton onClick={() => VkApiService.postStory(eventId, eventData?.title, eventData?.avatar.avatar_url)}>
            <Icon24Camera />
          </IconButton>
          <IconButton onClick={() => props.makeShare(eventId)}>
            <Icon24Message />
          </IconButton>
        </ButtonGroup>
      }


      {(user?.id === eventData.author || user?.id === groupInfo.admin) && eventData.is_active ?

        <ButtonGroup
          mode="vertical"
          stretched
          style={{ justifyContent: 'center', marginBottom: '30px', alignItems: 'center' }}
        >
          {user?.id === eventData.author && <Button sizeY='regular' onClick={() => props.goToEditing(eventId)}> Редактировать </Button>}

          <Button sizeY='regular' onClick={() => deleteEvent(eventId)}> Удалить событие </Button>
        </ButtonGroup>

        : isMember || !eventData.is_active
          ? <Button sizeY='regular' onClick={() => unsubscribe(eventId)}> Отписаться </Button>
          : <Button sizeY='regular' onClick={() => subscribe(eventId)}> Подписаться на событие </Button>
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
