import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, PanelHeaderBack, Button, Card, Group, Text, Header, Cell, Avatar, HorizontalScroll, HorizontalCell, ButtonGroup, IconButton, Link, File, Spacing, Separator, CardScroll, Div, platform } from '@vkontakte/vkui';
import { Icon24ShareOutline, Icon24CalendarOutline, Icon24ReportOutline } from '@vkontakte/icons';

import { monthNames } from '../variables/constants';

import '../assets/styles/Event.scss';

import ApiSevice from '../modules/ApiSevice';

import { set, setActiveEvents, setToken } from '../store/user/userSlice';

import Map from '../components/Map/Map.js';

import ics from '../modules/ics.js';

import { Modal } from '../components/Modal/Modal';
import VkApiService from '../modules/VkApiService';
import placeholder from '../img/placeholder.webp';

const Event = props => {
  const dispatch = useDispatch();
  const startPage = useRef(null);

  const [sliderData, setSliderData] = useState([]);
  const [eventData, setEventData] = useState({});
  const [membersData, setMembersData] = useState([]);
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

  const [canSubscribe, setCanSubscribe] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  const [canReport, setCanReport] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [albumsDOM, setAlbumsDOM] = useState([]);
  const [userAlbum, setUserAlbum] = useState(null);

  useEffect(() => {
    setIsBanned(eventData?.blacklist?.find(i => i === user.id));
  }, [user, eventData])

  useEffect(() => {
    setCanSubscribe(!isMember && user?.id !== eventData.author && eventData.is_active && eventData.members.length - 1 < eventData.members_limit);
  }, [isMember, user, eventData]);

  const goToAlbum = (albumId, userId) => {
    const link = document.createElement('a');
    link.href = `https://vk.com/album${userId}_${albumId}`;
    link.target = '_blank';
    link.click();
  }

  const addAlbum = (albumId) => {
    setAlbums([...albums, `${user.id}_${albumId}`]);
  }

  useEffect(async () => {
    const data = await VkApiService.getAlbums(albums, userToken);
    const dataTransformed = data.map((d, idx) => {
      const mem = [...members, eventAuthor];
      const author = mem.find(m => m.id === d.owner_id);
      if (d.owner_id === user.id) {
        setUserAlbum(d.id);
      }
      const ownerImage = author?.photo_100 ?? '';
      return (
        <HorizontalCell
          key={idx}
          size="l"
          style={{ height: '100%', width: '100%', }}
          onClick={() => goToAlbum(d.id, d.owner_id)}>
          <img
            className={'profile-finished-card__avatar'}
            src={d.sizes.at(-1).url}
          />
          {
            ownerImage && <img
              className='event-album__profile-avatar'
              src={ownerImage}
            />
          }
        </HorizontalCell>
      )
    });
    setAlbumsDOM(dataTransformed);
  }, [albums])

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
    setMembers([...members, <HorizontalCell size="s" header={user.first_name} onClick={() => props.goToProfile(user.id)} key={user.id}>
      <Avatar size={64} src={user.photo_100} />
    </HorizontalCell>]);
    setIsMember(true);
    setActiveModal('JOIN-MODAL');
  }

  const unsubscribe = async (id) => {
    const response = await ApiSevice.put('event', id, 'unsubscribe');
    setActiveModal(null);
    const userIdx = membersData.findIndex(m => m.id === user.id);
    membersData.splice(userIdx, 1);
    setMembersData([...membersData]);
    setIsMember(false);
    if (!eventData.is_active) {
      props.go();
    }
  }

  const forkEvent = async (event) => {
    const body = {
      title: event.title,
      description: event.description,
      author: user.id,
      category: event.category,
      source: 'fork_group',
      avatar: event.avatar,

      geo: event.geo,
      group_info: {
        group_id: event.group_info.group_id,
        is_admin: false,
      },
      time_start: event.time_start,
      members_limit: event.members_limit,
      ticket: event.ticket,
      images: event.images,
      parent: event.id
    };

    const { code, response } = await ApiSevice.post('event/create', body);
    if (response.id) {
      props.goToGroup(eventGroup.id);
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

  const addPhotos = async () => {
    const { permissions } = user;
    if (!permissions.includes('photos')) {
      const token = await VkApiService.getUserToken('photos');
      console.log(token);
      dispatch(setToken(token));
      const newUser = structuredClone(user);
      newUser.permissions = 'photos';
      dispatch(set(newUser));
    }
    setActiveModal('PHOTO-MODAL');
  }

  const removeMember = async (userId) => {
    const response = await ApiSevice.put('event', eventData.id, 'unsubscribe', {
      user: userId
    });
    const idx = membersData.findIndex(u => u.id === userId);
    membersData.splice(idx, 1);
    setMembersData([...membersData]);
    console.log(response);
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

  useEffect(() => {
    setMembers(membersData.filter(m => m.id !== eventData.author).map(m =>
      <HorizontalCell size="s" header={m.first_name} onClick={() => props.goToProfile(m.id)} key={m.id}>
        <Avatar size={64} src={m.photo_100} />
      </HorizontalCell>
    ));
  }, [membersData])

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
          <img style={{ maxHeight: user.platform === 'web' ? '300px' : '500px' }} src={i !== '' ? i : placeholder} className='event__avatar' />
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

      setCanReport(res.can_be_reported);

      if (res.group_info.group_id) {
        const [group] = await props.getGroupInfo(res.group_info.group_id, userToken);
        setEventGroup(group);
      }

      setAlbums(res.albums);

      if (res.group_info?.is_need_approve) {
        setIsNeedApprove(true);
      }

      setIsMember(Boolean(res.members?.find(m => m === user?.id)));
      const transformedMembers = await props.getUsersInfo(res.members.join(','), userToken);
      setMembersData(transformedMembers);
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
        ??????????????
      </PanelHeader>
      <Modal
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        albumId={userAlbum}
        addAlbum={addAlbum}
        event={eventData}
        share={share}
        members={membersData}
        removeMember={removeMember}
        goToChat={() => props.goToChat(eventData.id)}
        unsubscribe={() => unsubscribe(eventData.id)}
        setCanReport={setCanReport}
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

      <Group header={<Header mode="secondary">????????????????????</Header>}>
        <Div style={{ paddingTop: '0px', paddingBottom: '0px' }}>
          <Text weight='1' className='event__info-title'>????????:</Text>
          <Text weight='3' className='event__info-data'>{eventDate}</Text>
          <Spacing size={2} />
          <Text weight='1' className='event__info-title'>??????????:</Text>
          <Text weight='3' className='event__info-data'>{eventTime}</Text>
          <Spacing size={2} />
          <Text weight='1' className='event__info-title'>??????????:</Text>
          <Text weight='3' className='event__info-data'>{address}</Text>
          <Spacing size={2} />
          <Text weight='1' className='event__info-title'>????????:</Text>
          {
            eventData.ticket && (
              (Number(eventData?.ticket.cost) !== 0 && eventData?.ticket.link) ?
                <Link href={eventData.ticket.link} target='_blank' className='event__info-data'>{eventData.ticket.cost} ???</Link> :
                eventData?.ticket.cost && Number(eventData?.ticket.cost) !== 0 ?
                  <Text weight='3' className='event__info-data'>{eventData.ticket.cost} ???</Text> :
                  Number(eventData?.ticket.cost) === 0 ?
                    <Text weight='3' className='event__info-data'>??????????????????</Text> :
                    <Text weight='3' className='event__info-data'>???? ??????????????</Text>
            )

          }
          <Spacing size={2} />
          <Text weight='1' className='event__info-title'>??????????????????:</Text>
          <Text weight='3' className='event__info-data'>{eventData.category ?? '????????????'}</Text>
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
                <Button size="m" onClick={() => approve(eventId, true)}> ???????????????? ?????????????? </Button>
              }
              {
                (adminedGroups.find(g => g.id === eventData?.group_info?.group_id)) &&
                eventData.is_active &&
                <Button size="m" onClick={() => approve(eventId, false)}> ?????????????????? ?????????????? </Button>
              }

            </ButtonGroup>
          </ButtonGroup> :
          // ???? ?????????????? ?????????????? - ?????????????????????? ????????????
          <ButtonGroup mode="vertical" align='center' style={{ display: 'unset', textAlign: 'center', alignItems: 'unset' }}>
            <ButtonGroup
              mode="horizontal"
              style={{ alignItems: 'center' }}
            >
              {
                (user?.id === eventData.author) &&
                eventData.is_active && user?.id === eventData.author &&
                <Button size="m" onClick={() => props.goToEditing(eventId)}> ?????????????????????????? </Button>
              }

              {
                (user?.id === eventData.author) &&
                eventData.is_active &&
                <Button size="m" onClick={() => deleteEvent(eventId)}> ?????????????? ?????????????? </Button>
              }

              {
                canSubscribe &&
                <Button size="m" disabled={isBanned} onClick={() => subscribe(eventId)}> {isBanned ? '???? ???????? ??????????????????' : '?? ??????????'} </Button>
              }

              {
                (isMember && user?.id !== eventData.author && eventData.is_active) &&
                <Button size="m" onClick={() => setActiveModal('LEAVE-MODAL')}> ???????????????????? ???? ?????????????? </Button>
              }

              {
                Boolean(!isMember && user?.id !== eventData.author && !adminedGroups.find(g => g.id === eventData?.groupInfo?.group_id) && eventData.is_active && eventData?.group_info?.group_id) &&
                <Button size="m" onClick={() => forkEvent(eventData)}> ?????????????? ???????????????? </Button>
              }

              {
                eventData.is_active &&
                <IconButton onClick={() => openShareModal(eventData.id, eventData?.title, eventData?.avatar.avatar_vk_id, eventData?.avatar.avatar_url)}>
                  <Icon24ShareOutline />
                </IconButton>
              }

              {
                user.platform === 'web' && eventData.is_active &&
                <IconButton onClick={downloadCalendar}> <Icon24CalendarOutline /> </IconButton>
              }

              {
                canReport &&
                <IconButton onClick={() => setActiveModal('REPORT-MODAL')}>
                  <Icon24ReportOutline style={{ color: 'var(--vkui--color_text_negative)' }} />
                </IconButton>
              }


            </ButtonGroup>
            {
              (!eventData.is_active && isMember) &&
              <ButtonGroup mode="vertical" style={{ alignItems: 'center' }}>
                <Button size="m" onClick={() => addPhotos()}> ???????????????? ???????????????????? ?? ?????????????????????? </Button>
                <Button size="m" onClick={() => unsubscribe(eventData.id)}> ?????????????? ???? ???????????????? </Button>
              </ButtonGroup>

            }
          </ButtonGroup>
      }

      <Spacing />
      <Separator />

      {
        eventGroup &&
        <Group header={<Header mode="secondary">????????????</Header>} onClick={() => props.goToGroup(eventGroup.id)}>
          <Cell
            before={eventGroup.photo_200 ? <Avatar src={eventGroup.photo_200} /> : null}
          >
            {eventGroup.name}
          </Cell>
        </Group>
      }

      {
        eventAuthor
          ? <Group header={<Header mode="secondary">??????????</Header>} onClick={() => props.goToProfile(eventAuthor.id)}>
            <Cell
              before={eventAuthor.photo_200 ? <Avatar src={eventAuthor.photo_200} /> : null}
            >
              {`${eventAuthor.first_name} ${eventAuthor.last_name}`}
            </Cell>
          </Group>
          : <Text> ?????????????????? ?????????????? </Text>
      }


      {
        !isNeedApprove &&
        <Group header={
          <div className='event__members-header' style={{ flexDirection: user.platform !== 'web' ? 'column' : '' }}>
            <Header>
              ?????????????????? - {members.length} {eventData.is_active && `?????????????????? ???????? - ${eventData.members_limit - members.length}`}
            </Header>
            {
              user?.id === eventData.author && eventData.is_active &&
              <Div>
                <Button onClick={() => setActiveModal('AUTHOR-MODAL')}>????????????????????</Button>
              </Div>
            }
          </div>
        } style={{ minHeight: '60px' }}
        >
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


      {
        Boolean(!eventData.is_active && albumsDOM.length) &&
        <Group header={
          <Header>
            ?????????????????????? ?? ?????????????????????? {albumsDOM.length}
          </Header>
        }
        >
          <div className='events-finished__grid'>
            {albumsDOM}
          </div>
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
