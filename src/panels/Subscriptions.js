import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, Group, RadioGroup, FormLayout, Tabs, TabsItem, HorizontalScroll, Badge, Header, ButtonGroup, Spinner, Cell, Avatar, FormItem, Separator, Radio, Div } from '@vkontakte/vkui';
import { Icon24NewsfeedOutline, Icon24LogoVk, Icon24Users, Icon24ShareOutline, Icon24LikeOutline, Icon24Like } from '@vkontakte/icons';
import { Icon24ArrowDownOutline, Icon24ArrowUpOutline, Icon24SortOutline } from '@vkontakte/icons';
import ApiSevice from '../modules/ApiSevice';

import '../assets/styles/Feed.scss';
import VkApiService from '../modules/VkApiService';

const Subscriptions = ({ id, goToProfile, goToGroup }) => {
  const [selected, setSelected] = useState('subscriptions');
  const [friends, setFriends] = useState([]);
  const [subscribtions, setSubscribtions] = useState([]);

  const [subscriptionMode, setSubscriptionMode] = useState('all')

  const [isLoading, setIsLoading] = useState(true);

  const [data, setData] = useState(null);

  const user = useSelector(state => state.user.value);

  useEffect(async () => {
    setData(null);
    setIsLoading(true);
    if (selected === 'friends') {
      const res = await ApiSevice.getAll('profile/friends');
      setFriends(res);
    } else {
      const res = await ApiSevice.getAll('profile/get');
      setSubscribtions(res);
    }
  }, [user, selected]);

  useEffect(async () => {
    const info = [];
    for (let i = 0; i < friends.length; i++) {
      const userInfo = await VkApiService.fetchUserData(friends[i]);
      info.push(userInfo);
    }
    const res = info.map((user) => {
      return (
        <Cell
          key={user.id}
          before={user.photo_200 ? <Avatar src={user.photo_200} /> : null}
          onClick={() => goToProfile(user.id)}
        >
          {`${user.first_name} ${user.last_name}`}
        </Cell>
      )
    });
    setData(res);
    setIsLoading(false);
  }, [friends]);

  const fetchData = async (array, apiMethod, resultArray, redirectFunc) => {
    const info = [];
    for (let i = 0; i < array.length; i++) {
      const userInfo = await VkApiService[apiMethod](array[i]);
      info.push(userInfo);
    }
    resultArray.push(...info.map((user) => {
      return (
        <Cell
          key={user.id}
          before={user.photo_200 ? <Avatar src={user.photo_200} /> : null}
          onClick={() => redirectFunc(user.id)}
        >
          {`${user.first_name} ${user.last_name}`}
        </Cell>
      )
    }));
  }

  useEffect(async () => {
    if (!subscribtions || typeof subscribtions !== 'object' || subscribtions.length === 0) return;
    let res = [];
    const { users, groups } = subscribtions;
    if (subscriptionMode === 'users') {
      await fetchData(users, 'fetchUserData', res, goToProfile);
    } else if (subscriptionMode === 'groups') {
      await fetchData(groups, 'fetchGroupData', res, goToGroup);
    } else if (subscriptionMode === 'all') {
      if (users.length) {
        res.push(<Div>Пользователи</Div>);
        await fetchData(users, 'fetchUserData', res, goToProfile);
        res.push(<Separator />);
      }
      if (groups.length) {
        res.push(<Div>Группы</Div>);
        await fetchData(groups, 'fetchGroupData', res, goToGroup);
      }
    }
    setData(res);
    setIsLoading(false);
  }, [subscribtions, subscriptionMode])

  return (
    <Panel id={id}>
      <PanelHeader style={{ textAlign: 'center' }} separator={false}>Подписки</PanelHeader>
      <Group>
        <Tabs mode="default">
          <HorizontalScroll arrowsize="m">
            <TabsItem
              status={<Badge mode="prominent" />}
              selected={selected === "subscriptions"}
              onClick={() => setSelected("subscriptions")}
            >
              Подписки
            </TabsItem>
            <TabsItem
              status={<Badge mode="prominent" />}
              selected={selected === "friends"}
              onClick={() => setSelected("friends")}
            >
              Друзья
            </TabsItem>
          </HorizontalScroll>
        </Tabs>
      </Group>
      {selected === 'subscriptions' &&
        <Group header={<Header>Отображать</Header>}>
          <FormLayout>
            <RadioGroup mode="horizontal" onChange={(e) => setSubscriptionMode(e.target.value)}>
              <Radio name="pay" value="all" defaultChecked>
                Все подписки
              </Radio>
              <Radio name="pay" value="users">
                Пользователей
              </Radio>
              <Radio name="pay" value="groups">
                Группы
              </Radio>
            </RadioGroup>
          </FormLayout>
        </Group>
      }
      <Group>
        {isLoading ?
          <Spinner size="large" style={{ margin: "20px 0" }} /> :
          data && data.length ?
            data :
            <Div>{selected === "friends" ? 'Похоже, что никто из ваших друзей еще не пользовался приложением' : 'Нет подписок'}</Div>}
      </Group>
    </Panel>
  );
};

export default Subscriptions;
