import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, AdaptivityProvider, AppRoot, ConfigProvider, SplitLayout, SplitCol, Epic, Tabbar, TabbarItem, Panel, PanelHeader } from '@vkontakte/vkui';
import { Icon28NewsfeedOutline, Icon28AddCircleOutline, Icon28Profile } from '@vkontakte/icons';
import '@vkontakte/vkui/dist/vkui.css';

import { withRouter, useRouterSelector, useRouterActions } from 'react-router-vkminiapps-updated';
import { ViewTypes, PanelTypes } from './routing/structure.js';

import Feed from './panels/Feed';
import NewEvent from './panels/NewEvent';
import Event from './panels/Event.js';

const App = ({ router }) => {
	const [scheme, setScheme] = useState('bright_light')
	const [activePanel, setActivePanel] = useState('home');
	const [fetchedUser, setUser] = useState(null);
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);

	const [token, setToken] = useState('')

	const [eventId, setEventId] = useState('')

	useEffect(() => {
		bridge.subscribe(({ detail: { type, data } }) => {
			if (type === 'VKWebAppUpdateConfig') {
				setScheme(data.scheme)
			}
		});

		async function fetchData() {
			console.log(bridge)
			const user = await bridge.send('VKWebAppGetUserInfo');
			console.log(user);
			setUser(user);
			setPopout(null);
		}

		async function getToken() {
			const res = await bridge.send("VKWebAppGetAuthToken", { 
				"app_id": 51441556, 
				"scope": ""
			});
			console.log(res)
			setToken(res.access_token);

		}

		fetchData();
		getToken();
	}, []);

	const goTo = id => {
		setEventId(id);
		router.toView(ViewTypes.EVENT);
		bridge.send("VKWebAppSetLocation", {"location": 'event?id=' + id});
	}

	const getUserInfo = async vkId => {
		const userInfo = await bridge.send('VKWebAppCallAPIMethod', {"method": "users.get", "params": {"user_ids": `${vkId}`, 'field': 'screen_name, city', "v":"5.131", "access_token": `vk1.a.Qi72aoB0A_f8XZ8aZY2SbspUhdS0x7xDIezw-7Lm_kRG_iaXnZkUSv0E1qOVIUVbW3j9ezSV1wzcWmhgE1WWyxy59YHOX6yrF2-BcKiRifRWLoTzrLi7kQydxcvabuaPkzO78da8NeQj21XTygq-DEtqmUn3PKxB2ZI2PQfoYCDuEE5YtizF30g5v4BAvB_b`}});
		return userInfo;
	}

	const makeRepost = async (eventId) => {
		const repost = await bridge.send("VKWebAppShowWallPostBox", { "message": "Тест мини аппа " + eventId, attachments: 'https://vk.com/app51441556_133937404#/event'  });
		console.log(repost);
	}

	const makeShare = async (eventId) => {
		const response = await bridge.send("VKWebAppGetFriends", {multi: true});
		console.log(response)
		response.users.forEach(async u => {
			const request = await bridge.send('VKWebAppCallAPIMethod', {"method": "messages.send", "request_id": "32test", "params": {"user_id": `${u.id}`, "message": `Тест с id event ${eventId}`, "v":"5.131", "random_id": "0", "access_token": ``}})
		})	
	}

	const share = async (eventId) => {
		const response = await bridge.send("VKWebAppShare");
	}

	console.log(router)

	return (
		<ConfigProvider scheme={scheme}>
			<AdaptivityProvider>
				<AppRoot>
					<Epic activeStory={router.activeView} tabbar={
						<Tabbar>
							<TabbarItem
								onClick={() => router.toView(ViewTypes.MAIN)}
								selected={router.activeView === ViewTypes.MAIN}
								text="Лента"
							>
								<Icon28NewsfeedOutline />
							</TabbarItem>
							<TabbarItem
								onClick={() => router.toView(ViewTypes.ADDNEW)}
								selected={router.activeView === ViewTypes.ADDNEW}
								text="Добавить событие"
							>
								<Icon28AddCircleOutline />
							</TabbarItem>
							<TabbarItem
								onClick={() => router.toView(ViewTypes.PROFILE)}
								selected={router.activeView === ViewTypes.PROFILE}
								text="Профиль"
							>
								<Icon28Profile />
							</TabbarItem>
						</Tabbar>
					}>

						<View id={ViewTypes.MAIN} activePanel={router.activePanel}>
							<Feed id={PanelTypes.MAIN_HOME} fetchedUser={fetchedUser} go={(id) => goTo(id)} />
						</View>

						<View id={ViewTypes.ADDNEW} activePanel={router.activePanel}>
							<NewEvent id={PanelTypes.ADDNEW} userId={fetchedUser?.id} go={() => router.toView(ViewTypes.MAIN)} />
						</View>

						<View id={ViewTypes.PROFILE} activePanel={router.activePanel}>
							<Panel id={PanelTypes.PROFILE}>
								<PanelHeader>Профиль</PanelHeader>
							</Panel>
						</View>

						<View id={ViewTypes.EVENT} activePanel={router.activePanel}>
							<Event id={PanelTypes.EVENT} eventId={eventId} go={() => router.toView(ViewTypes.MAIN)} makeRepost={makeRepost} makeShare={share} getUserInfo={getUserInfo}/>
						</View>
					</Epic>
				</AppRoot>
			</AdaptivityProvider>
		</ConfigProvider>
	);
}

export default withRouter(App);