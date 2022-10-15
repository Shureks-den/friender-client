import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, AdaptivityProvider, AppRoot, ConfigProvider, SplitLayout, SplitCol, Epic, Tabbar, TabbarItem, Panel, PanelHeader } from '@vkontakte/vkui';
import { Icon28NewsfeedOutline, Icon28AddCircleOutline, Icon28Profile } from '@vkontakte/icons';
import '@vkontakte/vkui/dist/vkui.css';

import { withRouter, useRouterSelector, useRouterActions } from 'react-router-vkminiapps-updated';
import { ViewTypes, PanelTypes } from './routing/structure.js';

import VkApiService from './modules/VkApiService.js';

import { useSelector, useDispatch } from 'react-redux'
import { remove, set } from './store/user/userSlice'

import Feed from './panels/Feed';
import NewEvent from './panels/NewEvent';
import Event from './panels/Event.js';

const App = ({ router }) => {
  const dispatch = useDispatch();
  const [scheme, setScheme] = useState('bright_light');
  const user = useSelector((state => state.user.value));

  const [eventId, setEventId] = useState('');

  useEffect(() => {
    VkApiService.updateConfigWatcher(setScheme);

    async function fetchData () {
      const user = await VkApiService.fetchUserData();
      dispatch(set(user));
      console.log(user);
    }

    fetchData();
  }, []);

  const goTo = async id => {
    setEventId(id);
    router.toView(ViewTypes.EVENT);
    await VkApiService.setNewLocation(`event?id=${id}`);
  };

  const makeRepost = async (eventId, eventName, eventAvatar) => {
    const response = VkApiService.repost(eventId, eventName, eventAvatar);
    console.log(response);
  };

  const makeShare = async (eventId) => {
    const response = VkApiService.share(eventId);
    console.log(response);
  };

  return (
    <ConfigProvider scheme={scheme}>
      <AdaptivityProvider>
        <AppRoot>
          <Epic
            activeStory={router.activeView} tabbar={
              <Tabbar>
                <TabbarItem
                  onClick={() => router.toView(ViewTypes.MAIN)}
                  selected={router.activeView === ViewTypes.MAIN}
                  text='Лента'
                >
                  <Icon28NewsfeedOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => router.toView(ViewTypes.ADDNEW)}
                  selected={router.activeView === ViewTypes.ADDNEW}
                  text='Добавить событие'
                >
                  <Icon28AddCircleOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => router.toView(ViewTypes.PROFILE)}
                  selected={router.activeView === ViewTypes.PROFILE}
                  text='Профиль'
                >
                  <Icon28Profile />
                </TabbarItem>
              </Tabbar>
          }
          >

            <View id={ViewTypes.MAIN} activePanel={router.activePanel}>
              <Feed id={PanelTypes.MAIN_HOME} fetchedUser={user} go={(id) => goTo(id)} />
            </View>

            <View id={ViewTypes.ADDNEW} activePanel={router.activePanel}>
              <NewEvent id={PanelTypes.ADDNEW} userId={user?.id} go={() => router.toBack()} onSuccess={goTo} />
            </View>

            <View id={ViewTypes.PROFILE} activePanel={router.activePanel}>
              <Panel id={PanelTypes.PROFILE}>
                <PanelHeader>Профиль</PanelHeader>
              </Panel>
            </View>

            <View id={ViewTypes.EVENT} activePanel={router.activePanel}>
              <Event id={PanelTypes.EVENT} eventId={eventId} go={() => router.toView(ViewTypes.MAIN)} makeRepost={makeRepost} makeShare={makeShare} getUserInfo={VkApiService.fetchUserData} />
            </View>
          </Epic>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

export default withRouter(App);
