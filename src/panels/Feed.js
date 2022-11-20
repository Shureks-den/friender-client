import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, Group, CardGrid, ContentCard, Tabs, TabsItem, HorizontalScroll, Badge, Button, ButtonGroup, Spinner, IconButton, SimpleCell, Search, FormItem, Select, FormLayoutGroup, Div, Avatar } from '@vkontakte/vkui';
import { Icon24ArrowDownOutline, Icon24ArrowUpOutline, Icon24ShareOutline } from '@vkontakte/icons';
import ApiSevice from '../modules/ApiSevice';

import '../assets/styles/Feed.scss';

import { set } from '../store/categories/categoriesSlice';

import { monthNames, shortMonthNames, sortOptions } from '../variables/constants';

import AwesomeDebouncePromise from 'awesome-debounce-promise';
import {
  useAsync,
  useAsyncAbortable,
  useAsyncCallback,
  UseAsyncReturn,
} from 'react-async-hook';
import useConstant from 'use-constant';

import sadPersik from '../img/sad-persik.png';
import {NotFoundContent} from '../components/NotFoundContent/NotFoundContent';
import { ShareModal } from '../components/ShareModal/ShareModal';
import VkApiService from '../modules/VkApiService';

const Feed = ({ id, go, makeRepost, makeShare, makeStory, onSuccess, goToProfile, goToGroup }) => {
  const dispatch = useDispatch();

  const cities = useSelector(state => state.cities.value);
  const categories = useSelector(state => state.categories.value);

  const [page, setPage] = useState(0);

  const [eventsData, setEventsData] = useState([]);
  const [activeModal, setActiveModal] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  let debounce = false;
  let i = 0;
  const limit = 20;
  const scrollEvent = (e) => {
    if (document.body.scrollHeight * 0.7 < window.scrollY && !debounce) {
      setPage(i + 1);
      i++;
      debounce = true;
      setTimeout(() => debounce = false, 500);
    }
  }

  const user = useSelector(state => state.user.value);
  const userToken = useSelector(state => state.user.token);

  const [selected, setSelected] = useState('newEvents');

  const [searchWords, setSearchWords] = useState([]);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [sortValue, setSortValue] = useState('');

  const [sortOrder, setSortOrder] = useState('asc');

  const setOrder = () => {
    if (sortOrder === 'desc') {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    }
  }

  const setSort = (value) => {
    setSortOrder('asc');
    setSortValue(value);
  }

  useEffect(async () => {
    if (!user.id || categories.length) return;
    const cat = await ApiSevice.getAll('categories');
    dispatch(set(cat));
  }, [user]);

  const createLink = (id, onSuccess) => {
    const link = document.createElement('a');
    link.href = `https://vk.com/event${id}`;
    link.target = '_blank';
    link.click();
  }

  const [share, setShare] = useState(null);

  const openShareModal = (eventId, title, eventImageId, avatarUrl) => {
    const repost = () => makeRepost(eventId, title, eventImageId);
    const share = () => makeShare(eventId);
    const story = () => makeStory(eventId, title, avatarUrl);
    setShare({ repost: repost, share: share, story: story });
    setActiveModal('SHARE-MODAL');
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
      time_start: elem.time_start, // тут милисекунды
      members_limit: Number(5),
      is_private: false,
    };
    console.log(elem)
    const { response } = await ApiSevice.post('event/create', body);
    onSuccess(response.id);
  }


  const setEvents = async (res, isVk, pagination) => {
    if (!res) return;
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();

    const authors = !isVk ? await VkApiService.getUsersInfo(
      res
        .map(el => el.author)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(',')
      , userToken) : [];

    const groups = !isVk ? await VkApiService.getGroupsInfo(
      res
        .map(el => el.group_info.group_id)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(','), userToken
    ) : [];

    const listItems = res.map((elem) => {
      const eventDate = new Date(elem.time_start * 1000);
      const time = `${eventDate.getDate()} ${monthNames[eventDate.getMonth()]}, `;
      const hour = `${eventDate.getHours()}:${eventDate.getMinutes() < 10 ? '0' : ''}${eventDate.getMinutes()}`;
      const eventStart = ((day === eventDate.getDate() && month === eventDate.getMonth()) ? 'Сегодня, ' : time) + hour;
      const city = elem.geo.address ? elem.geo.address.split(',')[0] : '';

      const created = new Date(elem.time_created);
      const createdTime = `${created.getDate()} ${shortMonthNames[created.getMonth()]} ${created.getFullYear()} ${created.getHours()}:${created.getMinutes() < 10 ? '0' : ''}${created.getMinutes()}`;
      if (isVk) {
        return (
          <ContentCard
            key={elem.id}
            src={elem.avatar.avatar_url}
            subtitle={elem.title}
            className='vk-event'
            caption={
              <div className="event-caption">
                <div className='event-caption__info-wrapper'>
                  <div className='event-caption__info-date'>
                    {eventStart}
                  </div>
                  <div className='event-caption__info-address'>
                    {city}
                  </div>
                </div>
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
        const price = elem.ticket?.cost;
        const author = authors.find(a => a.id === elem.author);
        const group = elem.group_info.group_id ? groups.find(gr => gr.id === elem.group_info.group_id) : null;
        return (
          <ContentCard
            key={elem.id}
            src={elem.avatar.avatar_url}
            subtitle={
              <div className='event-subtitle-wrapper'>
                <SimpleCell
                  style={{ paddingLeft: '0px' }}
                  before={group ?
                    group.photo_200 ? <Avatar size={32} src={group.photo_200} /> : null :
                    author.photo_200 ? <Avatar size={32} src={author.photo_200} /> : null}
                  onClick={() => group ? goToGroup(group.id) : goToProfile(author.id)}
                >
                  <div>
                    <div className='event-subtitle-wrapper__name'>{group ? group.name : `${author.first_name} ${author.last_name}`}</div>
                    <div className='event-subtitle-wrapper__created'>{createdTime}</div>
                  </div>
                </SimpleCell>
                <IconButton onClick={() => openShareModal(elem.id, elem?.title, elem?.avatar.avatar_vk_id, elem?.avatar.avatar_url)}>
                  <Icon24ShareOutline />
                </IconButton>
              </div>
            }
            header={elem.title}
            caption={
              <div className="event-caption">
                <div className='event-caption__info-wrapper'>
                  <div className='event-caption__info-date'>
                    {eventStart}
                  </div>
                  <div className='event-caption__info-address'>
                    {city}
                  </div>
                  {price ?
                    Number(price) === 0 ?
                      <div className='event-caption__info-price'>
                        Бесплатно
                      </div>
                      :
                      <div className='event-caption__info-price'>
                        {price + ' ₽'}
                      </div>
                    :
                    <div className='event-caption__info-price'>
                      Цена не указана
                    </div>
                  }
                </div>
                <ButtonGroup mode="vertical" align='right' style={{ marginTop: '15px', display: 'unset', textAlign: 'center', alignItems: 'unset' }}>
                  <Button onClick={() => go(elem.id)} size="m">Подробнее</Button>
                </ButtonGroup>
              </div>}
          />)
      }
    });
    if (pagination) {
      setEventsData(eventsData.concat(listItems));
    } else {
      setEventsData(listItems);
    }
    setIsLoading(false);
  }

  const getTypedEvents = async (type, pagination) => {
    const sort = {};
    sort[sortValue === 'Количество участников' ? 'sort_members' : ''] = sortOrder;
    const source = type === 'newEvents' ? 'not_vk' : type === 'vkEvents' ? 'vk_event' : 'subscribe';
    const sources = type === 'newEvents' ? ['user', 'group'] : ['vk_event'];
    const res = await ApiSevice.post('events', {
      is_active: {
        value: true,
        defined: true,
      },
      source: source,
      city: searchCity,
      category: searchCategory,

      search: {
        enabled: Boolean(searchWords.length),
        data: {
          words: searchWords,
          sources: sources
        }
      },
      limit: limit,
      page: page,
      ...sort,
    });
    if (res) {
      setEvents(res.response, type === 'vkEvents', pagination);
    }
  }

  const getEvents = async () => {
    setIsLoading(true);
    setPage(0);
    setEventsData([]);
    await getTypedEvents(selected);
  }

  useEffect(async () => {
    if (!user.id) return;
    await getEvents();
  }, [selected, searchCategory, searchCity, sortOrder, sortValue, user, searchWords.join('')]);

  useEffect(async () => {
    await getTypedEvents(selected, true);
  }, [page])

  useEffect(() => {
    setSearchCategory('');
    setSearchCity('');
    setSort('');
  }, [selected])

  useEffect(() => {
    document.addEventListener('scroll', scrollEvent);
    return function cleanup() {
      document.removeEventListener('scroll', scrollEvent);
    }
  }, []);

  return (
    <Panel id={id} style={{ overflowX: user.platform === 'web' ? '' : 'hidden' }}>
      <PanelHeader style={{ textAlign: 'center' }} separator={false}>Лента событий</PanelHeader>
      <Scrollable selected={selected} setSelected={setSelected} />
      <SearchDebounced setSearchWords={setSearchWords} />
      <ShareModal
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        share={share}
      />
      <FormLayoutGroup
        mode="horizontal"
      >
        <FormItem bottom="Категория">
          <Select
            options={
              [
                {
                  label: 'Все',
                  value: '',
                },
                ...categories
                  .map((i) => ({
                    label: i,
                    value: i
                  })
                )
              ]
            }
            placeholder='Выберите категорию'
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          />
        </FormItem>
        <FormItem bottom="Город">
          <Select
            options={
              [
                {
                  label: 'Все',
                  value: '',
                },
                ...cities
                  .map((i) => ({
                    label: i,
                    value: i
                  })
                )
              ]
            }
            placeholder='Выберите город'
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
        </FormItem>
        <FormItem bottom="Сортировать по">
          <Select
            options={[
              ...sortOptions
            ].map((i) => ({
              label: i,
              value: i
            }))}
            placeholder='Выберите параметр сортировки'
            value={sortValue}
            onChange={(e) => setSort(e.target.value)}
          />
        </FormItem>
        {sortValue !== '' && <IconButton onClick={setOrder}> {sortOrder === 'asc' ? <Icon24ArrowDownOutline /> : <Icon24ArrowUpOutline />} </IconButton>}
      </FormLayoutGroup>

      <Group>
        <CardGrid size='l'>
            {
              isLoading ? <Spinner size="large" style={{ margin: "20px 0" }} /> :
              eventsData.length ? eventsData : <NotFoundContent text='Ничего не найдено' />
            }
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
            События ВКонтакте
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
    props.setSearchWords(e.split(' '));
  }

  const useSearch = () => {
    const [inputText, setInputText] = useState('');

    // Debounce the original search async function
    const debounceQuery = useConstant(() =>
      AwesomeDebouncePromise(handleSearchInput, 300)
    );

    const search = useAsyncAbortable(
      async (abortSignal, text) => {
        if (text.length === 0) {
          // props.setSearchWords([]);

          return [];
        } else {
          return debounceQuery(text, abortSignal);
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
    if (!inputText.length) {
      setTimeout(() => {
        props.setSearchWords([]);
      }, 300);
    }
  }, [inputText])



  return (
    <Search value={inputText} onChange={e => setInputText(e.target.value)} style={{ overflow: 'hidden' }} />
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
