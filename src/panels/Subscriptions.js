import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, Group, Tabs, TabsItem, HorizontalScroll, Badge, Spinner, Cell, Avatar, Search, Div } from '@vkontakte/vkui';
import ApiSevice from '../modules/ApiSevice';

import '../assets/styles/Feed.scss';
import VkApiService from '../modules/VkApiService';

const Subscriptions = ({ id, goToProfile, goToGroup }) => {
  const [selected, setSelected] = useState('users');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [inputText, setInputText] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  const [data, setData] = useState(null);

  const user = useSelector(state => state.user.value);

  const fetchData = async (array, apiMethod, redirectFunc) => {
    const info = [];
    for (let i = 0; i < array.length; i++) {
      const userInfo = await VkApiService[apiMethod](array[i]);
      info.push(userInfo);
    }
    return info;
  }

  useEffect(async () => {
    if (!user.id) return;
    setIsLoading(true);
    const res = await ApiSevice.getAll('profile/get');

    const usersData = await fetchData(res.users, 'fetchUserData', goToProfile);
    setUsers(usersData);

    const gropsData = await fetchData(res.groups, 'fetchGroupData', goToGroup);
    setGroups(gropsData);

    setIsLoading(false);
  }, [user]);

  const setShowingInfo = (value) => {
    setData(value.map((user) => {
      return (
        <Cell
          key={user.id}
          before={user.photo_200 ? <Avatar src={user.photo_200} /> : null}
          onClick={() => redirectFunc(user.id)}
        >
          {user.name ? user.name : `${user.first_name} ${user.last_name}`}
        </Cell>
      )
    }));
  }


  useEffect(async () => {
    const show = selected === 'users' ? users : groups;
    if (inputText) {
      setShowingInfo(show.filter(e => {
        const value = e.name ? e.name : `${e.first_name} ${e.last_name}`;
        return value.toLowerCase().includes(inputText.toLowerCase());
      }));
    } else {
      setShowingInfo(show);
    }
  }, [selected, users, groups, inputText]);

  return (
    <Panel id={id}>
      <PanelHeader style={{ textAlign: 'center' }} separator={false}>Подписки</PanelHeader>
      <Group>
        <Tabs mode="default">
          <HorizontalScroll arrowsize="m">
            <TabsItem
              status={<Badge mode="prominent" />}
              selected={selected === "users"}
              onClick={() => setSelected("users")}
            >
              Пользователи
            </TabsItem>
            <TabsItem
              status={<Badge mode="prominent" />}
              selected={selected === "groups"}
              onClick={() => setSelected("groups")}
            >
              Группы
            </TabsItem>
          </HorizontalScroll>
        </Tabs>
      </Group>
      <Search value={inputText} onChange={e => setInputText(e.target.value)} />
      <Group>
        {isLoading ?
          <Spinner size="large" style={{ margin: "20px 0" }} /> :
          data && data.length ?
            data :
            <Div>{'Нет подписок'}</Div>}
      </Group>
    </Panel>
  );
};

export default Subscriptions;
