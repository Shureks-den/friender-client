import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, PanelHeaderBack, Avatar, Cell, Group, Header, HorizontalCell, HorizontalScroll, Button, Separator, FormItem, Checkbox } from '@vkontakte/vkui';
import VkApiService from '../modules/VkApiService';
import ApiSevice from '../modules/ApiSevice';

import { setIsAdmin, setGroupId } from '../store/group/groupSlice.js';

const GroupView = props => {
  const dispatch = useDispatch();

  const [pageGroup, setPageGroup] = useState({});
  const [allowUserEvents, setAllowUserEvents] = useState(true);
  const [isAdmin, setIsAdminOnPage] = useState(false);

  const [adminEvents, setAdminEvents] = useState([]);
  const [usersEvents, setUsersEvents] = useState([]);
  const [finishedEvents, setFinishedEvents] = useState([]);

  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleChangeAllowUserEvents = async () => {
    const response = await ApiSevice.put('group', '', 'update', {
      group_id: pageGroup.id,
      user_id: user.id,
      allow_user_events: !allowUserEvents,
    });
    console.log(response);
    setAllowUserEvents(!allowUserEvents);
  }

  const subscribe = async () => {
    const response = await ApiSevice.post('profile/subscribe', {
      user_id: pageGroup.id,
    });
    setIsSubscribed(true);
    console.log(response);
  };

  const unsubscribe = async () => {
    const response = await ApiSevice.post('profile/unsubscribe', {
      user_id: pageGroup.id,
    });
    setIsSubscribed(false);
    console.log(response);
  }

  const user = useSelector(state => state.user.value);

  const handleAddEvent = async (admin) => {
    console.log(pageGroup)
    dispatch(setIsAdmin({ isAdmin: admin }));
    dispatch(setGroupId({ groupId: pageGroup.id }));
    props.goToNewEventPage(false);
  };

  useEffect(async () => {
    if (!user.id) return;
    try {
      const groupId = props.groupId ?? window.location.hash?.slice(1).split('=').slice(1, 2).join('');

      const gr = await VkApiService.fetchGroupData(Number(groupId));
      const grInfo = await ApiSevice.getAll('group/get', {
        group_id: groupId
      });
      if (grInfo) {
        console.log(grInfo.allow_user_events)
        setAllowUserEvents(grInfo.allow_user_events);
      }
      const adminEvents = await ApiSevice.post('events', {
        group_id: Number(groupId),
        is_admin: {
          defined: true,
          value: true
        },
        is_active: {
          defined: true,
          value: true
        },
      });
      const domEvents = adminEvents?.response.map((e, idx) =>
        <HorizontalCell key={idx} header={e.title} size="l" subtitle={new Date(e.time_start * 1000).toLocaleString()} onClick={() => props.goTo(e.id)}>
          <img
            className={'profile-active-card__avatar'}
            src={e.avatar.avatar_url}
          />
        </HorizontalCell>
      );
      setAdminEvents(domEvents);

      const usersEvents = await ApiSevice.post('events', {
        group_id: Number(groupId),
        is_admin: {
          defined: true,
          value: false
        },
        is_active: {
          defined: true,
          value: true
        },
      });
      const domUserEvents = usersEvents?.response.map((e, idx) =>
        <HorizontalCell key={idx} header={e.title} size="l" subtitle={new Date(e.time_start * 1000).toLocaleString()} onClick={() => props.goTo(e.id)}>
          <img
            className={'profile-active-card__avatar'}
            src={e.avatar.avatar_url}
          />
        </HorizontalCell>
      );
      setUsersEvents(domUserEvents);

      const historyEvents = await ApiSevice.post('events', {
        group_id: Number(groupId),
        is_active: {
          defined: true,
          value: false
        },
      });
      setFinishedEvents(historyEvents.response);

      setPageGroup(gr);
    } catch (err) {
      console.log(err);
    }
  }, [props.groupId, user]);

  useEffect(async () => {
    if (pageGroup.id) {
      const isAdmin = await ApiSevice.getAll('group/admin/check', {
        group_id: pageGroup.id
      });
      setIsAdminOnPage(isAdmin);
    } else {
      setIsAdminOnPage(false);
    }
  }, [user, pageGroup]);

  useEffect(async () => {
    if (!pageGroup.id || isAdmin) {
      return;
    }
    const subscribtions = await ApiSevice.getAll('profile/get');
    console.log(subscribtions);
    setIsSubscribed(Boolean(subscribtions.groups.find(s => s === pageGroup.id)));
  }, [pageGroup, user, isAdmin]);

  return (
    <Panel id={props.id}>
      <PanelHeader
        left={<PanelHeaderBack onClick={props.go} data-to='home' />}
      >
        Группа
      </PanelHeader>
      {
        pageGroup
        && <Group header={<Header mode="secondary"></Header>}>
          <a className='profile__link' target="_blank" href={`https://vk.com/club${pageGroup.id}`}>
            <Cell
              before={pageGroup.photo_200 ? <Avatar src={pageGroup.photo_200} /> : null}
            >
              {`${pageGroup.name}`}
            </Cell>
          </a>
        </Group>
      }
      {
        isAdmin &&
        <Checkbox defaultChecked={allowUserEvents} onChange={handleChangeAllowUserEvents} style={{ marginBottom: '10px' }}>Разрешить пользовательские события</Checkbox>
      }
      {
        !isAdmin &&
        (!isSubscribed ?
          <Button onClick={subscribe}>Подписаться</Button> :
          <Button onClick={unsubscribe}>Отписаться</Button>)
      }

      <Group>
        <Header aside={
          isAdmin &&
          <Button onClick={() => handleAddEvent(true)}>
            Добавить событие
          </Button>
        }>События сообщества</Header>
        <HorizontalScroll
          showArrows
          getScrollToLeft={(i) => i - 120}
          getScrollToRight={(i) => i + 120}
        >
          <div style={{ display: "flex" }}>{adminEvents}</div>
        </HorizontalScroll>
      </Group>

      {allowUserEvents &&
        <Group>
          <Header
            aside={
              <Button onClick={() => handleAddEvent(false)}>
                Добавить событие
              </Button>
            }>Найти компанию</Header>
          <HorizontalScroll
            showArrows
            getScrollToLeft={(i) => i - 120}
            getScrollToRight={(i) => i + 120}
          >
            <div style={{ display: "flex" }}>{usersEvents}</div>
          </HorizontalScroll>
        </Group>
      }




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


    </Panel>
  )
}

export default GroupView;