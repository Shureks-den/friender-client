import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, Group, CardGrid, ContentCard, Tabs, TabsItem, HorizontalScroll, Badge, Button, ButtonGroup, Spinner, IconButton, FixedLayout, Search, FormItem, Select, FormLayoutGroup, Div } from '@vkontakte/vkui';
import { Icon24SortOutline } from '@vkontakte/icons';
import { Icon24NewsfeedOutline, Icon24LogoVk, Icon24Users, Icon24ShareOutline, Icon24LikeOutline, Icon24Like } from '@vkontakte/icons';
import ApiSevice from '../modules/ApiSevice';

import '../assets/styles/Feed.scss';

import { setActiveEvents } from '../store/user/userSlice';
import { set } from '../store/categories/categoriesSlice';

import { monthNames, cities } from '../variables/constants';

import AwesomeDebouncePromise from 'awesome-debounce-promise';
import {
  useAsync,
  useAsyncAbortable,
  useAsyncCallback,
  UseAsyncReturn,
} from 'react-async-hook';
import useConstant from 'use-constant';

const Feed = ({ id, go, makeRepost, fetchedUser, onSuccess }) => {
  const categories = useSelector(state => state.categories.value);
  const dispatch = useDispatch();
  const [eventsData, setEventsData] = useState([]);
  const [activeEventsIds, setActiveEventsIds] = useState([]);

  const user = useSelector(state => state.user.value);
  const activeEvents = useSelector(state => state.user.activeEvents);

  const [selected, setSelected] = useState('newEvents');
  const [isSearchEmpty, setIsSearchEmpty] = useState(true);

  const [searchCategory, setSearchCategory] = useState('');
  const [searchCity, setSearchCity] = useState('');

  useEffect(async () => {
    const cat = await ApiSevice.getAll('categories');
    if (!cat) return;
    dispatch(set(cat));
  }, [user]);

  const searchByCategory = async (value) => {
    setSearchCategory(value);
  }

  const searchByCity = async (value) => {
    setSearchCity(value);
  }

  const subscribe = async (elem) => {
    if (!activeEventsIds.find(i => i === elem.id)) {
      const response = await ApiSevice.put('event', elem.id, 'subscribe');
      if (response) {
        const activeEvents = await ApiSevice.getAll('events', {
          id: user.id,
          is_active: true,
        });
        dispatch(setActiveEvents(activeEvents));
      }
    }
  };

  const createLink = (id, onSuccess) => {
    const link = document.createElement('a');
    link.href = `https://vk.com/event${id}`;
    link.target = '_blank';
    link.click();
  }

  const makeCopy = async (elem) => {
    const body = {
      title: elem.title,
      avatar: elem.avatar,
      description: elem.description,
      author: user.id,
      category: elem.category,
      source: 'user',
      group_info: null,
      time_start: elem.time_start / 1000, // тут милисекунды
      members_limit: Number(5),
      is_private: false,
    };
    console.log(elem)
    const { response } = await ApiSevice.post('event/create', body);
    onSuccess(response.id);
  }

  const setEvents = (res, isVk) => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();

    if (!res) return;
    console.log(res);
    const listItems = res.map((elem) => {
      const eventDate = new Date(elem.time_start * 1000);
      const time = `${eventDate.getDate()} ${monthNames[eventDate.getMonth()]}, ${eventDate.getHours()}:${eventDate.getMinutes() < 10 ? '0' : ''}${eventDate.getMinutes()}`;
      const eventStart = (day === eventDate.getDate() && month === eventDate.getMonth()) ? 'Сегодня' : '' + time;
      if (isVk) {
        return (
          <ContentCard
            key={elem.id}
            src={elem.avatar.avatar_url}
            subtitle={elem.title}
            className='vk-event'
            caption={
              <div>
                <div style={{ paddingBottom: '12px' }}>{eventStart}</div>
                <ButtonGroup mode="horizontal" gap="m">
                  <Button onClick={() => createLink(elem.id)} size="s" stretched>
                    Подробнее
                  </Button>
                  <Button onClick={() => makeCopy(elem, onSuccess)} size="s" stretched>
                    Найти компанию
                  </Button>
                </ButtonGroup>
              </div>
            }
          />
        )
      } else {
        const city = elem.geo.address ? elem.geo.address.split(',')[0] : '';
        return (
          <ContentCard
            key={elem.id}
            src={elem.avatar.avatar_url}
            subtitle={elem.title}
            caption={<div className="event-caption">
              <div className='event-caption__info-wrapper'>
                <div className='event-caption__info-date'>
                  {eventStart}
                </div>
                <div className='event-caption__info-address'>
                  {city}
                </div>
              </div>
              <ButtonGroup mode="horizontal" gap="m" style={{ alignItems: 'center' }}>
                <IconButton onClick={() => subscribe(elem)}>
                  {activeEventsIds.find(i => i === elem.id) ? <Icon24Like /> : <Icon24LikeOutline />}
                </IconButton>
                <IconButton onClick={() => makeRepost(elem.id, elem.title, elem.avatar_url)}>
                  <Icon24ShareOutline />
                </IconButton>
                <Button onClick={() => go(elem.id)} style={{ position: 'absolute', right: '16px' }} >Подробнее</Button>
              </ButtonGroup>
            </div>}
          />)
      }

    });
    setEventsData(listItems);
  }

  const getVkEvents = async () => {
    const res = await ApiSevice.getAll('events', {
      is_active: true,
      source: 'vk_event',
      category: searchCategory,
      city: searchCity,
    });
    setEvents(res, true);
  }

  const getNewEvents = async () => {
    const res = await ApiSevice.getAll('events', {
      is_active: true,
      source: 'not_vk',
      category: searchCategory,
      city: searchCity,
    });
    setEvents(res);
  }

  const getSubscribedEvents = async () => {
    const res = await ApiSevice.getAll('events', {
      id: user.id,
      source: 'subscribe',
      category: searchCategory,
      city: searchCity,
    });
    setEvents(res);
  }

  const getEvents = async () => {
    setEventsData([]);
    if (selected === 'newEvents') {
      await getNewEvents();
    } else if (selected === 'vkEvents') {
      await getVkEvents();
    } else if (selected === 'subscriptions') {
      await getSubscribedEvents();
    }
  }

  useEffect(async () => {
    if (isSearchEmpty) {
      await getEvents();
    }
  }, [user, selected, activeEventsIds, isSearchEmpty, searchCategory, searchCity]);

  useEffect(() => {
    setActiveEventsIds(activeEvents.map(a => a.id));
  }, [activeEvents]);

  return (
    <Panel id={id}>
      <PanelHeader style={{ textAlign: 'center' }} separator={false}>Лента событий</PanelHeader>
      <Scrollable selected={selected} setSelected={setSelected} />
      {
        selected === 'newEvents' &&
        <SearchDebounced selected='newEvents' setEvents={(res) => setEvents(res)} setSearch={setIsSearchEmpty} />
      }
      {
        selected === 'vkEvents' &&
        <SearchDebounced selected='vkEvents' setEvents={(res) => setEvents(res, true)} setSearch={setIsSearchEmpty} />
      }
      {
        selected === 'subscriptions' &&
        <SearchDebounced selected='subscriptions' setSearch={setIsSearchEmpty} />
      }
      <FormLayoutGroup
        mode="horizontal"
      >
        <FormItem bottom="Категория">
          <Select
            options={[
              ...categories
            ].map((i) => ({
              label: i,
              value: i
            }))}
            placeholder='Выберите категорию'
            onChange={(e) => searchByCategory(e.target.value)}
          />
        </FormItem>
        <FormItem bottom="Город">
          <Select
            options={[
              ...cities
            ].map((i) => ({
              label: i,
              value: i
            }))}
            placeholder='Выберите город'
            onChange={(e) => searchByCity(e.target.value)}
          />
        </FormItem>
        <FormItem bottom="Сортировать по">
          <Select
            options={[
              ...cities
            ].map((i) => ({
              label: i,
              value: i
            }))}
            placeholder=''
            onChange={(e) => searchByCity(e.target.value)}
          />
        </FormItem>
        <IconButton> <Icon24SortOutline /> </IconButton>
      </FormLayoutGroup>

      <Group>
        <CardGrid size='l'>
          {eventsData.length ? eventsData : selected !== 'subscriptions' ? <Spinner size="large" style={{ margin: "20px 0" }} /> : <Div>Нет событий :(</Div>}
        </CardGrid>
      </Group>
    </Panel>
  );
};

const Scrollable = (props) => {
  const mode = 'default';

  return (
    <Group>
      <Tabs mode={mode}>
        <HorizontalScroll arrowsize="m">
          <TabsItem
            selected={props.selected === "newEvents"}
            onClick={() => props.setSelected("newEvents")}
          >
            Новые события
          </TabsItem>
          <TabsItem
            selected={props.selected === "vkEvents"}
            onClick={() => props.setSelected("vkEvents")}
          >
            События Вконтакте
          </TabsItem>
          <TabsItem
            status={<Badge mode="prominent" />}
            selected={props.selected === "subscriptions"}
            onClick={() => props.setSelected("subscriptions")}
          >
            Подписки
          </TabsItem>
        </HorizontalScroll>
      </Tabs>
    </Group>
  );
};

const SearchDebounced = props => {
  const handleSearchInput = async (e) => {
    const sources = props.selected === 'newEvents' ? ['user', 'group'] : ['vk_event'];
    const { response } = await ApiSevice.post('search', {
      words: e.split(' '),
      sources: sources
    });
    console.log(response);
    if (response.length) {
      console.log(response);
      props.setEvents(response);
    }
  }

  const useSearch = () => {
    const [inputText, setInputText] = useState('');

    // Debounce the original search async function
    const debouncedSearchStarwarsHero = useConstant(() =>
      AwesomeDebouncePromise(handleSearchInput, 300)
    );

    const search = useAsyncAbortable(
      async (abortSignal, text) => {
        if (text.length === 0) {
          return [];
        } else {
          return debouncedSearchStarwarsHero(text, abortSignal);
        }
      }, [inputText]);

    // Return everything needed for the hook consumer
    return {
      inputText,
      setInputText,
      search,
    };
  };

  const { inputText, setInputText, search } = useSearch();

  useEffect(() => {
    if (inputText.length === 0) {
      props.setSearch(true);
    } else {
      props.setSearch(false);
    }
  }, [inputText]);

  return (
    <Search value={inputText} onChange={e => setInputText(e.target.value)} />
  )
}

Feed.propTypes = {
  id: PropTypes.string.isRequired,
  go: PropTypes.func.isRequired,
  fetchedUser: PropTypes.shape({
    photo_200: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    city: PropTypes.shape({
      title: PropTypes.string
    })
  })
};

export default Feed;
