import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, AdaptivityProvider, AppRoot, ConfigProvider, SplitLayout, SplitCol, Epic, Tabbar, TabbarItem, Panel, PanelHeader } from '@vkontakte/vkui';
import { Icon28NewsfeedOutline, Icon28AddCircleOutline, Icon28Profile } from '@vkontakte/icons'
import '@vkontakte/vkui/dist/vkui.css';

import { withRouter, useRouterSelector, useRouterActions } from 'react-router-vkminiapps';
import { ViewTypes, PanelTypes } from './routing/structure.js';

import Home from './panels/Home';
import Persik from './panels/Persik';

const App = ({ router }) => {
	const [scheme, setScheme] = useState('bright_light')
	const [activePanel, setActivePanel] = useState('home');
	const [fetchedUser, setUser] = useState(null);
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);

	const makeRepost = async () => {
		const repost = await bridge.send("VKWebAppShowWallPostBox", { "message": "Тест мини аппа", "attachments": "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=20s&ab_channel=RickAstley" });
		console.log(repost);
	}

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
		fetchData();
	}, []);

	const go = e => {
		setActivePanel(e.currentTarget.dataset.to);
	};

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
							<Home id={PanelTypes.MAIN_HOME} fetchedUser={fetchedUser} go={() => router.toView(ViewTypes.ADDNEW)} makeRepost={makeRepost} />
						</View>

						<View id={ViewTypes.ADDNEW} activePanel={router.activePanel}>
							<Persik id={PanelTypes.ADDNEW} go={() => router.toView(ViewTypes.MAIN)} />
						</View>

						<View id={ViewTypes.PROFILE} activePanel={router.activePanel}>
							<Panel id={PanelTypes.PROFILE}>
								<PanelHeader>Профиль</PanelHeader>
							</Panel>
						</View>
					</Epic>
				</AppRoot>
			</AdaptivityProvider>
		</ConfigProvider>
	);
}

export default withRouter(App);