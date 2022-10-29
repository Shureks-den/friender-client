import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, PanelHeaderBack, Avatar, Cell, Group, Header, HorizontalCell, HorizontalScroll, Button } from '@vkontakte/vkui';
import VkApiService from '../modules/VkApiService';
import ApiSevice from '../modules/ApiSevice';

import '../assets/styles/Profile.scss';

const Profile = props => {
  const [pageUser, setPageUser] = useState({});
  const [activeEvents, setActiveEvents] = useState([]);
  const [finishedEvents, setFinishedEvents] = useState([]);
  const [adminedGroups, setAdminedGroups] = useState([]);

  const [isSubscribed, setIsSubscribed] = useState(false);

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

  useEffect(async () => {
    try {
      const userId = props.profileId ?? window.location.hash?.slice(1).split('=').slice(1, 2).join('');
      const u = await VkApiService.fetchUserData(Number(userId));
      const events = await ApiSevice.getAll('events', {
        id: u.id,
        is_active: true,
      });
      const domEvents = events.map((e, idx) =>
        <HorizontalCell key={idx} header={e.title} size="l" subtitle={new Date(e.time_start * 1000).toLocaleString()} onClick={() => props.goTo(e.id)}>
          <img
            className={e.author === user?.id ? 'profile-active-card__avatar-author' : 'profile-active-card__avatar'}
            src={e.avatar.avatar_url}
          />
        </HorizontalCell>
      );
      setActiveEvents(domEvents);
      const eevents = await ApiSevice.getAll('events', {
        id: u.id,
        is_active: false,
      });
      setFinishedEvents(eevents);

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
    setIsSubscribed(Boolean(subscribtions.find(s => s === pageUser.id)));
  }, [pageUser, user]);

  return (
    <Panel id={props.id}>
      <PanelHeader
        style={{ textAlign: 'center' }}
      >
        Пользователь
      </PanelHeader>
      {
        pageUser
        && <Group header={<Header mode="secondary"></Header>}>
          <a className='profile__link' target="_blank" href={`https://vk.com/id${pageUser.id}`}>
            <Cell
              before={pageUser.photo_200 ? <Avatar src={pageUser.photo_200} /> : null}
            >
              {`${pageUser.first_name} ${pageUser.last_name}`}
            </Cell>
          </a>
        </Group>
      }
      {
        (pageUser?.id === user?.id) ?
          <Button onClick={() => connectGroup()}>Добавить группу</Button> :

          !isSubscribed ?
            <Button onClick={subscribe}>Подписаться</Button> :
            <Button onClick={unsubscribe}>Отписаться</Button>

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

      <Group description={pageUser?.id === user?.id && "Ваши и те, на которые вы подписаны, события"}>
        <Header>Активные события</Header>
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
          История
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
            {finishedEvents.map((ev, idx) =>
              <HorizontalCell size='m' key={idx} onClick={() => props.goTo(ev.id)}>
                <Avatar
                  size={88}
                  mode='app'
                  src={ev.avatar.avatar_url}
                />
              </HorizontalCell>
            )}
          </div>
        </HorizontalScroll>
      </Group>

      {/* <Header>События</Header>
      <ImageGrid /> */}

    </Panel>
  )
}

export default Profile;