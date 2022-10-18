import React, { useState, useEffect } from 'react';
import { View, AdaptivityProvider, AppRoot, ConfigProvider, Epic, Tabbar, TabbarItem, Panel, PanelHeader } from '@vkontakte/vkui';
import { Icon28NewsfeedOutline, Icon28AddCircleOutline, Icon28Profile } from '@vkontakte/icons';
import '@vkontakte/vkui/dist/vkui.css';

import { withRouter, useRouterSelector, useRouterActions } from 'react-router-vkminiapps-updated';
import { ViewTypes, PanelTypes } from './routing/structure.js';

import VkApiService from './modules/VkApiService.js';
import ApiSevice from './modules/ApiSevice.js';

import { useSelector, useDispatch } from 'react-redux';
import { remove, set } from './store/user/userSlice';

import Feed from './panels/Feed';
import NewEvent from './panels/NewEvent';
import Event from './panels/Event.js';
import Profile from './panels/Profile.js';

const App = ({ router }) => {
  const dispatch = useDispatch();
  const [scheme, setScheme] = useState('bright_light');
  const user = useSelector(state => state.user.value);

  const [eventId, setEventId] = useState('');
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    VkApiService.updateConfigWatcher(setScheme);

    async function fetchData () {
      const user = await VkApiService.fetchUserData();
      dispatch(set(user));
      ApiSevice.setHeaderId(user.id);
    }

    fetchData();
  }, []);

  const goTo = async id => {
    setEventId(id);
    router.toView(ViewTypes.EVENT);
    await VkApiService.setNewLocation(`event?id=${id}`);
  };

  const goToProfile = async id => {
    setProfileId(id);
    router.toView(ViewTypes.PROFILE);
    await VkApiService.setNewLocation(`profile?id=${id}`);
  }

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
              <Feed id={PanelTypes.MAIN_HOME} fetchedUser={user} go={(id) => goTo(id)} />
            </View>

            <View id={ViewTypes.ADDNEW} activePanel={router.activePanel}>
              <NewEvent id={PanelTypes.ADDNEW} userId={user?.id} go={() => router.toBack()} onSuccess={goTo} />
            </View>

            <View id={ViewTypes.PROFILE} activePanel={router.activePanel}>
              <Profile id={PanelTypes.PROFILE} go={() => router.toBack()} profileId={profileId} goTo={goTo}/>
            </View>

            <View id={ViewTypes.EVENT} activePanel={router.activePanel}>
              <Event 
                id={PanelTypes.EVENT} 
                eventId={eventId} go={() => router.toView(ViewTypes.MAIN)} 
                makeRepost={makeRepost} 
                makeShare={makeShare} 
                getUserInfo={VkApiService.fetchUserData}
                goToProfile={goToProfile}
              />
            </View>
          </Epic>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

export default withRouter(App);
