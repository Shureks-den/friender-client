import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, PanelHeaderBack, Input, FormItem, Button, Card, Group, Text, Header, Cell, Avatar, HorizontalScroll, HorizontalCell, ButtonGroup, IconButton, Link, InfoRow, Spacing, Separator, CardScroll } from '@vkontakte/vkui';
import { Icon24Share, Icon24Camera, Icon24Message } from '@vkontakte/icons';
import ReactImagesCarousel from 'react-images-carousel';

import '../assets/styles/Event.scss';

import ApiSevice from '../modules/ApiSevice';

import { setActiveEvents } from '../store/user/userSlice';

import Map from '../components/Map/Map.js';
import VkApiService from '../modules/VkApiService';

import ics from '../modules/ics.js';

const Event = props => {
  const dispatch = useDispatch();
  const startPage = useRef(null);

  const [sliderData, setSliderData] = useState([]);
  const [eventData, setEventData] = useState({});
  const [members, setMembers] = useState([]);
  const [eventAuthor, setEventAuthor] = useState(null);
  const [eventImage, setEventImage] = useState(undefined);
  const [eventImageId, setEventImageId] = useState(null);
  const [eventDate, setEventDate] = useState(new Date().toLocaleString());
  const [eventId, setEventId] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [address, setAddress] = useState('');

  const user = useSelector(state => state.user.value);
  const adminedGroups = useSelector(state => state.groupInfo.adminedGroups);

  const downloadCalendar = () => {
    const cal = ics();
    const date = new Date(eventData.time_start * 1000);
    const finishDate = new Date(eventData.time_start * 1000 + 60 * 60 * 1000);
    console.log(date, finishDate)
    cal.addEvent(
      eventData.title,
      eventData.description,
      eventData.geo.address,
      date,
      finishDate
    );
    cal.download(eventData.title);
  }

  const subscribe = async (id) => {
    const response = await ApiSevice.put('event', id, 'subscribe');
    setIsMember(true);
    if (response) {
      const { response } = await ApiSevice.post('events', {
        id: user.id,
        is_active: {
          define: true,
          value: true,
        },
      });
      dispatch(setActiveEvents(response));
    }
  }

  const unsubscribe = async (id) => {
    const response = await ApiSevice.put('event', id, 'unsubscribe');
    setIsMember(false);
    console.log(response);
    if (!eventData.is_active) {
      props.go();
    }
    if (response) {
      const { response } = await ApiSevice.post('events', {
        id: user.id,
        is_active: {
          define: true,
          value: true,
        },
      });
      dispatch(setActiveEvents(response));
    }
  }

  const deleteEvent = async (id) => {
    const response = await ApiSevice.put('event', id, 'delete', {
      group_id: eventData.group_info.group_id,
      is_admin: Boolean(adminedGroups.find(g => g.group_id === eventData?.group_info?.group_id))
    });
    if (response) {
      const { response } = await ApiSevice.post('events', {
        id: user.id,
        is_active: {
          define: true,
          value: true,
        },
      });
      dispatch(setActiveEvents(response));
    }
    props.go();
  }

  useEffect(() => {
    startPage.current?.scrollIntoView();
  }, []);

  useEffect(async () => {
    if (!user) return;
    try {
      const eId = props.eventId.length !== 0 ? props.eventId : window.location.hash?.slice(1).split('=').slice(1, 2).join('');
      setEventId(eId);
      const res = await ApiSevice.get('event/get', eId);
      if (!res) return;
      setEventData(res);
      const imageSrc = res.avatar.avatar_url;
      setEventImageId(res.avatar.avatar_vk_id);
      setEventImage(imageSrc);
      setSliderData([imageSrc, ...res.images].map(i =>
        <Card key={i}>
          <img style={{ maxHeight: user.platform === 'web' ? '300px' : '500px' }} src={i} className='event__avatar' />
        </Card>
      ));

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
      <div ref={startPage} />
      <PanelHeader
        left={<PanelHeaderBack onClick={props.go} data-to='home' />}
      >
        {eventData.title}
      </PanelHeader>

      <Group>
        <CardScroll size={user.platform === 'web' ? 'm' : 'l'}
        >
          {sliderData}
        </CardScroll>
      </Group>

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
        <InfoRow weight="bold" style={{ padding: '10px 0px' }}>{eventDate}</InfoRow>
      </FormItem>

      {
        (eventData?.ticket?.cost || eventData?.ticket?.link) &&
        <FormItem top='Информация о билетах'>
          {
            eventData.ticket.cost
            &&
            <InfoRow weight="bold" style={{ padding: '10px 0px' }}>Цена: {eventData.ticket.cost} ₽</InfoRow>
          }
          {
            eventData.ticket.link
            &&
            <Link href={eventData.ticket.link} target='_blank'>Ссылка для покупки билета</Link>
          }
        </FormItem>
      }


      <Map isClickable={false} latitude={eventData.geo?.latitude} longitude={eventData.geo?.longitude} address={address} setAddress={setAddress} />


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


      {
        user.platform === 'web' &&
        <Button sizeY='regular' onClick={downloadCalendar}> Добавить в календарь </Button>
      }
      <Separator />
      <Spacing />


      {(user?.id === eventData.author || adminedGroups.find(g => g.group_id === eventData?.group_info?.group_id)) && eventData.is_active ?

        <ButtonGroup
          mode="vertical"
          stretched
          style={{ justifyContent: 'center', marginBottom: '30px', alignItems: 'center' }}
        >
          {user?.id === eventData.author && <Button sizeY='regular' onClick={() => props.goToEditing(eventId)}> Редактировать </Button>}

          <Button sizeY='regular' onClick={() => deleteEvent(eventId)}> Удалить событие </Button>
        </ButtonGroup>

        : (isMember || !eventData.is_active)
        && <Button sizeY='regular' onClick={() => unsubscribe(eventId)}> Отписаться </Button>
      }

      {(!isMember && user?.id !== eventData.author && eventData.is_active) && <Button sizeY='regular' onClick={() => subscribe(eventId)}> Подписаться на событие </Button>}
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
