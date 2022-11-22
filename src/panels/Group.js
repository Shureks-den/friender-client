import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, PanelHeaderBack, Avatar, Cell, Group, Header, HorizontalCell, HorizontalScroll, Button, Separator, Link, Checkbox, Div } from '@vkontakte/vkui';
import VkApiService from '../modules/VkApiService';
import ApiSevice from '../modules/ApiSevice';

import { setIsAdmin, setGroupId } from '../store/group/groupSlice.js';
import placeholder from '../img/placeholder.webp';

import EventPlaceholder from '../components/EventPlaceholder/EventPlaceholder';

const GroupView = props => {
  const dispatch = useDispatch();

  const [pageGroup, setPageGroup] = useState({});
  const [allowUserEvents, setAllowUserEvents] = useState(false);
  const [isAdmin, setIsAdminOnPage] = useState(false);

  const [adminEvents, setAdminEvents] = useState([]);
  const [usersEvents, setUsersEvents] = useState([]);
  const [companyEvents, setCompanyEvents] = useState([]);
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
      if (!grInfo) return;

      setAllowUserEvents(grInfo.allow_user_events);
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
            src={e.avatar.avatar_url !== '' ? e.avatar.avatar_url : placeholder}
          />
        </HorizontalCell>
      );
      setAdminEvents(domEvents);

      if (user.id === grInfo.user_id) {
        const usersEvents = await ApiSevice.post('events', {
          group_id: Number(groupId),
          is_need_approve: {
            defined: true,
            value: true
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
              src={e.avatar.avatar_url !== '' ? e.avatar.avatar_url : placeholder}
            />
          </HorizontalCell>
        );
        setUsersEvents(domUserEvents);
      }

      const findCompanyEvents = await ApiSevice.post('events', {
        group_id: Number(groupId),
        source: 'fork_group',
        is_active: {
          defined: true,
          value: true
        },
      });
      const findCompanyDomEvents = findCompanyEvents?.response.map((e, idx) =>
        <HorizontalCell key={idx} header={e.title} size="l" subtitle={new Date(e.time_start * 1000).toLocaleString()} onClick={() => props.goTo(e.id)}>
          <img
            className={'profile-active-card__avatar'}
            src={e.avatar.avatar_url !== '' ? e.avatar.avatar_url : placeholder}
          />
        </HorizontalCell>
      );
      setCompanyEvents(findCompanyDomEvents);

      setCompanyEvents

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
          <Cell
            before={pageGroup.photo_200 ? <Avatar src={pageGroup.photo_200} /> : null}
            after={
              !isAdmin &&
              (!isSubscribed ?
                <Button onClick={subscribe}>Подписаться</Button> :
                <Button onClick={unsubscribe}>Отписаться</Button>)
            }
          >
            <div>
              <div>{`${pageGroup.name}`}</div>
              <Link className='profile__link' target="_blank" href={`https://vk.com/club${pageGroup.id}`}>Ссылка на страницу</Link>
            </div>
          </Cell>
        </Group>
      }
      {
        isAdmin ?
          <Checkbox defaultChecked={allowUserEvents} onChange={handleChangeAllowUserEvents} style={{ marginBottom: '10px' }}>
            Разрешить пользователям предлагать события
          </Checkbox> :
          allowUserEvents &&
          <Div style={{ textAlign: 'center' }}>
            <Button onClick={() => handleAddEvent(false)}>
              Предложить событие
            </Button>
          </Div>
      }

      <Group>
        <Header aside={
          isAdmin &&
          <Button onClick={() => handleAddEvent(true)}>
            Добавить событие
          </Button>
        }>События сообщества  {adminEvents.length} </Header>
        {
          adminEvents.length ?
            <HorizontalScroll
              showArrows
              getScrollToLeft={(i) => i - 120}
              getScrollToRight={(i) => i + 120}
            >
              <div style={{ display: "flex" }}>{adminEvents}</div>
            </HorizontalScroll> :
            isAdmin && <EventPlaceholder text={'Тут будут события, опубликованные от имени группы'} />
        }

      </Group>

      {(allowUserEvents && isAdmin) &&
        <Group>
          <Header>Предложенные события {usersEvents.length}</Header>
          {usersEvents.length ?
            <HorizontalScroll
              showArrows
              getScrollToLeft={(i) => i - 120}
              getScrollToRight={(i) => i + 120}
            >
              <div style={{ display: "flex" }}>{usersEvents}</div>
            </HorizontalScroll> :
            <EventPlaceholder text={'Тут будут события пользователей, которые еще не прошли модерацию'} />
          }

        </Group>
      }


      <Group>
        <Header>Поиск компании {companyEvents.length}</Header>
        {companyEvents.length ?
          <HorizontalScroll
            showArrows
            getScrollToLeft={(i) => i - 120}
            getScrollToRight={(i) => i + 120}
          >
            <div style={{ display: "flex" }}>{companyEvents}</div>
          </HorizontalScroll> : isAdmin && <EventPlaceholder text={'Тут пользователи смогут найти компанию на ваши мероприятия'} />
        }

      </Group>

      <Group header={
        <Header>
          Прошедшие события {finishedEvents.length}
        </Header>
      }
      >
        <div className='events-finished__grid'>
          {finishedEvents.map((e, idx) =>
            <HorizontalCell
              key={idx}
              header={
                <Text style={{ wordBreak: 'break-word' }}>
                  {e.title}
                </Text>
              }
              size="l"
              style={{ height: '100%', width: '100%' }}
              subtitle={new Date(e.time_start * 1000).toLocaleString()}
              onClick={() => props.goTo(e.id)}>
              <img
                className={'profile-finished-card__avatar'}
                src={e.avatar.avatar_url !== '' ? e.avatar.avatar_url : placeholder}
              />
            </HorizontalCell>
          )}
        </div>
      </Group>


    </Panel>
  )
}

export default GroupView;