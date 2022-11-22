import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, PanelHeaderBack, Avatar, Cell, Group, Header, HorizontalCell, HorizontalScroll, Button, Spinner, Link, Text, ButtonGroup, IconButton } from '@vkontakte/vkui';
import { Icon24ReportOutline } from '@vkontakte/icons';
import VkApiService from '../modules/VkApiService';
import ApiSevice from '../modules/ApiSevice';

import '../assets/styles/Profile.scss';
import placeholder from '../img/placeholder.webp';

import { Modal } from '../components/Modal/Modal';

const Profile = props => {
  const [pageUser, setPageUser] = useState({});
  const [activeEvents, setActiveEvents] = useState([]);
  const [adminedEvents, setAdminedEvents] = useState([]);
  const [finishedEvents, setFinishedEvents] = useState([]);
  const [adminedGroups, setAdminedGroups] = useState([]);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [canReport, setCanReport] = useState(false);

  const user = useSelector(state => state.user.value);

  const connectGroup = async () => {
    const groupId = await VkApiService.addToGroup(user.id);
    await props.goToGroup(groupId);
  };

  const subscribe = async () => {
    const response = await ApiSevice.post('profile/subscribe', {
      user_id: pageUser.id,
    });
    setIsSubscribed(true);
    console.log(response);
  };

  const unsubscribe = async () => {
    const response = await ApiSevice.post('profile/unsubscribe', {
      user_id: pageUser.id,
    });
    setIsSubscribed(false);
    console.log(response);
  }

  const transfromToList = (value, isFinished = false) => {
    return (value.map((e, idx) => {
      return (
        <HorizontalCell
          key={idx}
          header={
            <Text style={{ wordBreak: 'break-word' }}>
              {e.title}
            </Text>
          }
          size="l"
          style={{ height: '100%', width: isFinished ? '100%' : '', maxWidth: isFinished ? '' : '275px' }}
          subtitle={new Date(e.time_start * 1000).toLocaleString()}
          onClick={() => props.goTo(e.id)}>
          <img
            className={isFinished ? 'profile-finished-card__avatar' : 'profile-active-card__avatar'}
            src={e.avatar.avatar_url !== '' ? e.avatar.avatar_url : placeholder}
          />
        </HorizontalCell>
      );
    }))

  };

  useEffect(async () => {
    if (!user.id) return;
    try {
      const userId = props.profileId ?? window.location.hash?.slice(1).split('=').slice(1, 2).join('');
      const u = await VkApiService.fetchUserData(Number(userId));
      const events = await ApiSevice.post('events', {
        id: u.id,
        is_active: {
          defined: true,
          value: true,
        },
      });
      setActiveEvents(transfromToList(events.response.filter(e => e.author !== u.id)));
      setAdminedEvents(transfromToList(events.response.filter(e => e.author === u.id)));

      const finish = await ApiSevice.post('events', {
        id: u.id,
        is_active: {
          defined: true,
          value: false,
        },
      });
      setFinishedEvents(transfromToList(finish.response, true));

      const adminedGroups = await ApiSevice.getAll('group', {
        user_id: userId
      });
      const fullInfoGroups = [];
      for (let i = 0; i < adminedGroups.length; i++) {
        const gr = await VkApiService.fetchGroupData(Number(adminedGroups[i].group_id));
        fullInfoGroups.push(gr);
      }
      setAdminedGroups(fullInfoGroups);

      setPageUser(u);
    } catch (err) {
      console.log(err);
    }
  }, [props.profileId, user]);

  useEffect(async () => {
    if (!pageUser.id || pageUser.id === user.id) {
      return;
    }
    const subscribtions = await ApiSevice.getAll('profile/get');
    console.log(subscribtions);
    setIsSubscribed(Boolean(subscribtions.users.find(s => s === pageUser.id)));
  }, [pageUser, user]);

  return (
    <Panel id={props.id}>
      <PanelHeader
        style={{ textAlign: 'center' }}
        left={<PanelHeaderBack onClick={props.go} data-to='home' />}
      >
        Пользователь
      </PanelHeader>
      <Modal
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        setCanReport={setCanReport}
        reportUserId={pageUser.id}
      />
      {
        pageUser.id ?
          <Group header={<Header mode="secondary"></Header>}>

            <Cell
              before={pageUser.photo_200 ? <Avatar src={pageUser.photo_200} /> : null}
              after={
                (pageUser?.id === user?.id) ?
                  <Button onClick={() => connectGroup()}>Добавить группу</Button> :

                  <ButtonGroup mode='horizontal' style={{alignItems: 'center'}}>
                    {!isSubscribed ?
                      <Button onClick={subscribe}>Подписаться</Button> :
                      <Button onClick={unsubscribe}>Отписаться</Button>}

                    <IconButton onClick={() => setActiveModal('REPORT-MODAL')}>
                      <Icon24ReportOutline style={{ color: 'var(--vkui--color_text_negative)' }} />
                    </IconButton>
                  </ButtonGroup>

              }
            >
              <div>
                <div>{`${pageUser.first_name} ${pageUser.last_name}`}</div>
                <Link className='profile__link' target="_blank" href={`https://vk.com/id${pageUser.id}`}>Ссылка на страницу</Link>
              </div>
            </Cell>
          </Group>
          : <Spinner size="large" style={{ margin: "20px 0" }} />
      }
      {
        adminedGroups.length !== 0 && <Group header={
          <Header>
            {pageUser?.id === user?.id ? 'Ваши группы' : `Группы ${pageUser.first_name}`}
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
              {adminedGroups.map((gr, idx) =>
                <HorizontalCell size='m' key={idx} onClick={() => props.goToGroup(gr.id)}>
                  <Avatar
                    size={88}
                    mode='app'
                    src={gr.photo_100}
                  />
                </HorizontalCell>
              )}
            </div>
          </HorizontalScroll>
        </Group>
      }

      <Group header={<Header>{user.id === pageUser.id ? 'Мои события' : 'Организатор'} {adminedEvents.length}</Header>}>
        <HorizontalScroll
          showArrows
          getScrollToLeft={(i) => i - 120}
          getScrollToRight={(i) => i + 120}
        >
          <div style={{ display: "flex" }}>{adminedEvents}</div>
        </HorizontalScroll>
      </Group>

      <Group header={<Header>{user.id === pageUser.id ? 'Собираюсь посетить' : 'Собирается посетить'}  {activeEvents.length}</Header>}>
        <HorizontalScroll
          showArrows
          getScrollToLeft={(i) => i - 120}
          getScrollToRight={(i) => i + 120}
        >
          <div style={{ display: "flex" }}>{activeEvents}</div>
        </HorizontalScroll>
      </Group>

      <Group header={
        <Header>
          Прошедшие события {finishedEvents.length}
        </Header>
      }
      >
        <div className='events-finished__grid'>
          {finishedEvents}
        </div>
      </Group>
    </Panel>
  )
}

export default Profile;