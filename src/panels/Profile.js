import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, PanelHeaderBack, Avatar, Cell, Group, Header, HorizontalCell, HorizontalScroll } from '@vkontakte/vkui';
import VkApiService from '../modules/VkApiService';
import ApiSevice from '../modules/ApiSevice';

import '../assets/styles/Profile.scss';
import ImageGrid from '../components/ImageGrid/ImageGrid';

const Profile = props => {
  const [pageUser, setPageUser] = useState(null);
  const [activeEvents, setActiveEvents] = useState([]);
  const [finishedEvents, setFinishedEvents] = useState([]);
  const user = useSelector(state => state.user.value);

  const openProfile = (id) => {
    window.open(`https://vk.com/id${id}`, '_blank').focus();
  }

  useEffect(async () => {
    try {
      const userId = props.profileId ?? window.location.hash?.slice(1).split('=').slice(1, 2).join('')
      const u = await VkApiService.fetchUserData(Number(userId));
      const events = await ApiSevice.getAll('events', {
        id: u.id,
        is_active: true,
      });
      const domEvents = events.map((e, idx) =>
        <HorizontalCell key={idx} header={e.title} size="l" subtitle={new Date(e.time_start * 1000).toLocaleString()} onClick={() => props.goTo(e.id)}>
          <img
            className={e.author === user?.id ? 'profile-active-card__avatar-author': 'profile-active-card__avatar'}
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

      setPageUser(u);
    } catch (err) {
      console.log(err);
    }
  }, [props.profileId, user]);

  return (
    <Panel id={props.id}>
      <PanelHeader
        left={<PanelHeaderBack onClick={props.go} data-to='home' />}
      >
        Пользователь
      </PanelHeader>
      {
        pageUser
        && <Group header={<Header mode="secondary"></Header>} onClick={() => openProfile(pageUser.id)}>
          <Cell
            before={pageUser.photo_200 ? <Avatar src={pageUser.photo_200} /> : null}
          >
            {`${pageUser.first_name} ${pageUser.last_name}`}
          </Cell>
        </Group>
      }
      <Group description="Ваши и те, на которые вы подписаны, события">
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