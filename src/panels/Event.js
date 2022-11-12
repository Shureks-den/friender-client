import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, PanelHeaderBack, Input, FormItem, Button, Card, Group, Text, Header, Cell, Avatar, HorizontalScroll, HorizontalCell, ButtonGroup, IconButton, Link, InfoRow, Spacing, Separator, CardScroll, Div } from '@vkontakte/vkui';
import { Icon24Share, Icon24Camera, Icon24Message, Icon24CalendarOutline } from '@vkontakte/icons';

import { monthNames } from '../variables/constants';

import '../assets/styles/Event.scss';

import ApiSevice from '../modules/ApiSevice';

import { setActiveEvents } from '../store/user/userSlice';

import Map from '../components/Map/Map.js';

import ics from '../modules/ics.js';

import { ShareModal } from '../components/ShareModal/ShareModal';

const Event = props => {
  const dispatch = useDispatch();
  const startPage = useRef(null);

  const [sliderData, setSliderData] = useState([]);
  const [eventData, setEventData] = useState({});
  const [members, setMembers] = useState([]);
  const [eventAuthor, setEventAuthor] = useState(null);
  const [eventGroup, setEventGroup] = useState(null);

  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  const [eventId, setEventId] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [address, setAddress] = useState('');

  const user = useSelector(state => state.user.value);
  const userToken = useSelector(state => state.user.token);
  const adminedGroups = useSelector(state => state.groupInfo.adminedGroups);

  const [activeModal, setActiveModal] = useState(null);
  const [share, setShare] = useState(null);
  const [isNeedApprove, setIsNeedApprove] = useState(false);

  const openShareModal = (eventId, title, eventImageId, avatarUrl) => {
    const repost = () => props.makeRepost(eventId, title, eventImageId);
    const share = () => props.makeShare(eventId);
    const story = () => props.makeStory(eventId, title, avatarUrl);
    setShare({ repost: repost, share: share, story: story });
    setActiveModal('SHARE-MODAL');
  }

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
    setActiveModal('JOIN-MODAL');
  }

  const unsubscribe = async (id) => {
    const response = await ApiSevice.put('event', id, 'unsubscribe');
    setIsMember(false);
    if (!eventData.is_active) {
      props.go();
    }
  }

  const approve = async (id, value) => {
    const response = await ApiSevice.post('group/event/approve', {
      group_id: eventGroup.id,
      event_uid: id,
      approve: value
    });
    console.log(response);
    props.goToGroup(eventGroup.id)
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
    if (!user.id) return;
    try {
      const eId = props.eventId.length !== 0 ? props.eventId : window.location.hash?.slice(1).split('=').slice(1, 2).join('');
      setEventId(eId);
      const res = await ApiSevice.get('event/get', eId);
      if (!res) return;
      setEventData(res);
      const imageSrc = res.avatar.avatar_url;
      setSliderData([imageSrc, ...res.images].map(i =>
        <Card key={i}>
          <img style={{ maxHeight: user.platform === 'web' ? '300px' : '500px' }} src={i} className='event__avatar' />
        </Card>
      ));

      const rawDate = new Date(res.time_start * 1000);
      const date = `${rawDate.getDate()} ${monthNames[rawDate.getMonth()]} ${rawDate.getFullYear()}`;
      const time = `${rawDate.getHours()}:${rawDate.getMinutes() < 10 ? '0' : ''}${rawDate.getMinutes()}`;
      setEventDate(date);
      setEventTime(time);

      if (res.author) {
        const author = await props.getUserInfo(res.author);
        setEventAuthor(author);
      }

      if (res.group_info.group_id) {
        const [group] = await props.getGroupInfo(res.group_info.group_id, userToken);
        setEventGroup(group);
      }

      if (res.group_info?.is_need_approve) {
        setIsNeedApprove(true);
      }

      setIsMember(Boolean(res.members?.find(m => m === user?.id)));
      const transformedMembers = await props.getUsersInfo(res.members.join(','), userToken);
      setMembers(transformedMembers.filter(m => m.id !== res.author).map(m =>
        <HorizontalCell size="s" header={m.first_name} onClick={() => props.goToProfile(m.id)} key={m.id}>
          <Avatar size={64} src={m.photo_100} />
        </HorizontalCell>
      ));
    } catch (err) {
      console.log(err);
    }
  }, [user]);

  return (
    <Panel id={props.id}>
      <div ref={startPage} />
      <PanelHeader
        left={<PanelHeaderBack onClick={props.go} data-to='home' />}
      >
        Событие
      </PanelHeader>
      <ShareModal
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        share={share}
        goToChat={() => props.goToChat(eventData.id)}
      />

      <Group>
        {
          sliderData.length > 1 ?
            <CardScroll
              size={user.platform === 'web' ? 'm' : 'l'}
            >
              {sliderData}
            </CardScroll> :
            <Div>{sliderData}</Div>

        }
      </Group>

      <Group header={<Header mode="secondary">{eventData.title}</Header>}>
        <Div>
          <Text className='event__description'>{
            eventData.description}
          </Text>
        </Div>
      </Group>

      <Group header={<Header mode="secondary">Информация</Header>}>
        <Div style={{ paddingTop: '0px', paddingBottom: '0px' }}>
          <Text weight='1' className='event__info-title'>Дата:</Text>
          <Text weight='3' className='event__info-data'>{eventDate}</Text>
          <Spacing size={2} />
          <Text weight='1' className='event__info-title'>Время:</Text>
          <Text weight='3' className='event__info-data'>{eventTime}</Text>
          <Spacing size={2} />
          <Text weight='1' className='event__info-title'>Место:</Text>
          <Text weight='3' className='event__info-data'>{address}</Text>
          <Spacing size={2} />
          <Text weight='1' className='event__info-title'>Цена:</Text>
          {
            eventData.ticket && (
              (Number(eventData?.ticket.cost) !== 0 && eventData?.ticket.link) ?
                <Link href={eventData.ticket.link} target='_blank' className='event__info-data'>{eventData.ticket.cost} ₽</Link> :
                eventData?.ticket.cost && Number(eventData?.ticket.cost) !== 0 ?
                  <Text weight='3' className='event__info-data'>{eventData.ticket.cost} ₽</Text> :
                  Number(eventData?.ticket.cost) === 0 ?
                    <Text weight='3' className='event__info-data'>Бесплатно</Text> :
                    <Text weight='3' className='event__info-data'>Не указана</Text>
            )

          }
          <Spacing size={2} />
          <Text weight='1' className='event__info-title'>Категория:</Text>
          <Text weight='3' className='event__info-data'>{eventData.category}</Text>
        </Div>
      </Group>

      <Map isClickable={false} latitude={eventData.geo?.latitude} longitude={eventData.geo?.longitude} address={address} setAddress={setAddress} showAddress={false} />

      {
        isNeedApprove ?
          <ButtonGroup mode="vertical" align='center' style={{ display: 'unset', textAlign: 'center', alignItems: 'unset' }}>
            <ButtonGroup
              mode="horizontal"
              style={{ alignItems: 'center' }}
            >
              {
                (adminedGroups.find(g => g.id === eventData?.group_info?.group_id)) &&
                eventData.is_active &&
                <Button size="m" onClick={() => approve(eventId, true)}> Одобрить событие </Button>
              }
              {
                (adminedGroups.find(g => g.id === eventData?.group_info?.group_id)) &&
                eventData.is_active &&
                <Button size="m" onClick={() => approve(eventId, false)}> Отклонить событие </Button>
              }

            </ButtonGroup>
          </ButtonGroup> :
          // не требует аппрува - стандартная логика
          <ButtonGroup mode="vertical" align='center' style={{ display: 'unset', textAlign: 'center', alignItems: 'unset' }}>
            <ButtonGroup
              mode="horizontal"
              style={{ alignItems: 'center' }}
            >
              {
                (user?.id === eventData.author) &&
                eventData.is_active && user?.id === eventData.author &&
                <Button size="m" onClick={() => props.goToEditing(eventId)}> Редактировать </Button>
              }

              {
                (user?.id === eventData.author) &&
                eventData.is_active &&
                <Button size="m" onClick={() => deleteEvent(eventId)}> Удалить событие </Button>
              }

              {
                (!isMember && user?.id !== eventData.author && eventData.is_active) &&
                <Button size="m" onClick={() => subscribe(eventId)}> Я пойду </Button>
              }

              {
                (isMember && user?.id !== eventData.author && eventData.is_active) &&
                <Button size="m" onClick={() => unsubscribe(eventId)}> Отказаться от участия </Button>
              }

              {
                eventData.is_active &&
                <IconButton onClick={() => openShareModal(eventData.id, eventData?.title, eventData?.avatar.avatar_vk_id, eventData?.avatar.avatar_url)}>
                  <Icon24Share />
                </IconButton>
              }

              {
                user.platform === 'web' &&
                <IconButton onClick={downloadCalendar}> <Icon24CalendarOutline /> </IconButton>
              }
            </ButtonGroup>
          </ButtonGroup>
      }



      <Spacing />
      <Separator />

      {
        eventGroup &&
        <Group header={<Header mode="secondary">Группа</Header>} onClick={() => props.goToGroup(eventGroup.id)}>
          <Cell
            before={eventGroup.photo_200 ? <Avatar src={eventGroup.photo_200} /> : null}
          >
            {eventGroup.name}
          </Cell>
        </Group>
      }

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

      {
        !isNeedApprove &&
        <Group header={<Header>Участники {members.length}</Header>} style={{ minHeight: '60px' }}>
          {members.length ?
            <HorizontalScroll showArrows
              getScrollToLeft={(i) => i - 120}
              getScrollToRight={(i) => i + 120}>
              <div style={{ display: "flex" }}>{members}</div>
            </HorizontalScroll> :
            <Spacing size={60} />
          }
        </Group>
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
