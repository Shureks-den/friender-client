import React, { useState, useEffect } from 'react';
import { View, AdaptivityProvider, AppRoot, ConfigProvider, Epic, Tabbar, TabbarItem, Panel, PanelHeader } from '@vkontakte/vkui';
import { Icon28NewsfeedOutline, Icon28AddCircleOutline, Icon28Profile, Icon28MessageOutline, Icon28UsersOutline } from '@vkontakte/icons';
import '@vkontakte/vkui/dist/vkui.css';

import { withRouter, useRouterSelector, useRouterActions } from 'react-router-vkminiapps-updated';
import { ViewTypes, PanelTypes } from './routing/structure.js';

import VkApiService from './modules/VkApiService.js';
import ApiSevice from './modules/ApiSevice.js';

import { useSelector, useDispatch } from 'react-redux';
import { remove, set, setActiveEvents, setToken } from './store/user/userSlice';
import { removeGroupId, setAdminedGroups } from './store/group/groupSlice';
import { setCities } from './store/cities/citiesSlice';

import Feed from './panels/Feed';
import NewEvent from './panels/NewEvent';
import Event from './panels/Event.js';
import Profile from './panels/Profile.js';
import GroupView from './panels/Group.js';
import Chats from './panels/Chats.js';
import Subscriptions from './panels/Subscriptions.js';

const App = ({ router }) => {
  const dispatch = useDispatch();
  const [scheme, setScheme] = useState('bright_light');

  const user = useSelector(state => state.user.value);
  const userToken = useSelector(state => state.user.token);

  const [eventId, setEventId] = useState('');
  const [profileId, setProfileId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    VkApiService.updateConfigWatcher(setScheme);
    async function fetchData() {
      const user = await VkApiService.fetchUserData();
      await VkApiService.getSessionInfo();
      const token = await VkApiService.getUserToken();
      dispatch(setToken(token));
      ApiSevice.setHeaderId(user.id);
      dispatch(set(user));
      const activeEvents = await ApiSevice.post('events', {
        id: user.id,
        source: 'not_vk',
        is_active: {
          value: true,
          defined: true,
        },
      });
      dispatch(setActiveEvents(activeEvents.response));
    }
    function checkGroupRedirect() {
      const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });
      const grId = params.vk_group_id;
      if (grId) {
        setTimeout(async () => {
          goToGroup(grId);
        }, 0);
      }
    }
    fetchData();
    checkGroupRedirect();
  }, []);

  useEffect(async () => {
    const adminedGroups = await ApiSevice.getAll('group', {
      user_id: user.id
    });
    if (adminedGroups) {
      const groupInfo = await VkApiService.getGroupsInfo(
        adminedGroups.map(g => g.group_id).join(','), userToken
      );
      dispatch(setAdminedGroups({ adminedGroups: groupInfo }));
    }
    const cities = await ApiSevice.getAll('cities');
    if (cities) {
      dispatch(setCities(cities));
    }
  }, [user])

  const goToEditing = async id => {
    setIsEditing(true);
    setEventId(id);
    router.toView(ViewTypes.ADDNEW);
    await VkApiService.setNewLocation(`newEvent?id=${id}&isEditing=true`);
  };

  const goTo = async id => {
    setEventId(id);
    router.toView(ViewTypes.EVENT);
    await VkApiService.setNewLocation(`event?id=${id}`);
  };

  const goToGroup = async id => {
    setGroupId(id);
    router.toView(ViewTypes.GROUP);
    await VkApiService.setNewLocation(`group?id=${id}`);
  };

  const goToChat = async id => {
    setChatId(id);
    router.toView(ViewTypes.CHATS);
    await VkApiService.setNewLocation(`chats?id=${id}`);
  };

  const goToNewAdd = (deleteGroupInfo = true) => {
    if (deleteGroupInfo) {
      dispatch(removeGroupId());
    }
    setIsEditing(false);
    router.toView(ViewTypes.ADDNEW);
    window.scrollTo({ y: 0, behavior: 'smooth' });
  };

  const goToProfile = async id => {
    setProfileId(id);
    router.toView(ViewTypes.PROFILE);
    await VkApiService.setNewLocation(`profile?id=${id}`);
  };

  const makeRepost = async (eventId, eventName, eventAvatar) => {
    const response = VkApiService.repost(eventId, eventName, eventAvatar);
    console.log(response);
  };

  const makeShare = async (eventId) => {
    const response = VkApiService.share(eventId);
    console.log(response);
  };

  const makeStory = async (id, title, avatarUrl) => {
    const response = await VkApiService.postStory(id, title, avatarUrl);
    console.log(response);
  };

  const toView = (view) => {
    router.toView(view);
  };

  return (
    <ConfigProvider scheme={scheme}>
      <AdaptivityProvider>
        <AppRoot>
          <Epic
            activeStory={router.activeView} tabbar={
              <Tabbar>
                <TabbarItem
                  onClick={() => toView(ViewTypes.MAIN)}
                  selected={router.activeView === ViewTypes.MAIN}
                  text='Лента'
                >
                  <Icon28NewsfeedOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => toView(ViewTypes.CHATS)}
                  selected={router.activeView === ViewTypes.CHATS}
                  text='Чаты'
                >
                  <Icon28MessageOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => goToNewAdd()}
                  selected={router.activeView === ViewTypes.ADDNEW}
                  text='Новое событие'
                >
                  <Icon28AddCircleOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => toView(ViewTypes.SUBSCRIPTIONS)}
                  selected={router.activeView === ViewTypes.SUBSCRIPTIONS}
                  text='Подписки'
                >
                  <Icon28UsersOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => goToProfile(user.id)}
                  selected={router.activeView === ViewTypes.PROFILE}
                  text='Профиль'
                >
                  <Icon28Profile />
                </TabbarItem>
              </Tabbar>
            }
          >

            <View id={ViewTypes.MAIN} activePanel={router.activePanel}>
              <Feed
                id={PanelTypes.MAIN_HOME}
                fetchedUser={user}
                go={(id) => goTo(id)}
                goToProfile={goToProfile}
                goToGroup={goToGroup}
                onSuccess={goTo}
                makeRepost={makeRepost}
                makeShare={makeShare}
                makeStory={makeStory}
              />
            </View>

            <View id={ViewTypes.ADDNEW} activePanel={router.activePanel}>
              <NewEvent
                id={PanelTypes.ADDNEW}
                userId={user?.id}
                go={() => router.toBack()}
                onSuccess={goTo}
                onSuccessGroup={goToGroup}
                isEditing={isEditing}
                eventId={eventId} />
            </View>

            <View id={ViewTypes.PROFILE} activePanel={router.activePanel}>
              <Profile
                id={PanelTypes.PROFILE}
                go={() => router.toBack()}
                goToGroup={goToGroup}
                profileId={profileId}
                goTo={goTo} />
            </View>

            <View id={ViewTypes.GROUP} activePanel={router.activePanel}>
              <GroupView
                id={PanelTypes.GROUP}
                go={() => router.toBack()}
                groupId={groupId} goTo={goTo}
                goToNewEventPage={goToNewAdd} />
            </View>

            <View id={ViewTypes.EVENT} activePanel={router.activePanel}>
              <Event
                id={PanelTypes.EVENT}
                eventId={eventId}
                go={() => router.toBack()}
                makeRepost={makeRepost}
                makeShare={makeShare}
                makeStory={makeStory}
                getUserInfo={VkApiService.fetchUserData}
                getUsersInfo={VkApiService.getUsersInfo}
                getGroupInfo={VkApiService.getGroupsInfo}
                goToProfile={goToProfile}
                goToGroup={goToGroup}
                goToChat={goToChat}
                goToEditing={goToEditing}
              />
            </View>
            <View id={ViewTypes.CHATS} activePanel={router.activePanel}>
              <Chats
                id={PanelTypes.CHATS}
                chatId={chatId}
                getUserInfo={VkApiService.fetchUserData}
                goToProfile={goToProfile}
              />
            </View>
            <View id={ViewTypes.SUBSCRIPTIONS} activePanel={router.activePanel}>
              <Subscriptions
                id={PanelTypes.SUBSCRIPTIONS}
                goToProfile={goToProfile}
                goToGroup={goToGroup}
              />
            </View>
          </Epic>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

export default withRouter(App);
