import React from 'react';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, Header, Button, Group, Cell, Div, CardGrid, ContentCard } from '@vkontakte/vkui';
import persik from '../img/persik.png';

const Feed = ({ id, go, makeRepost, fetchedUser }) => {
	const data = [
		{title: 'kek', data: 1665229604662, src: persik, id: 'blabla1'},
		{title: 'kek', data: 1665229604662, src: persik, id: 'blabla2'},
		{title: 'kek', data: 1665229604662, src: persik, id: 'blabla3'},
	]

	const listItems = data.map((elem) =>
	  <ContentCard src={elem.src} subtitle={elem.title} caption={Date(elem.data)} onClick={() => go(elem.id)} key={elem.id}/>
	);

	console.log(listItems)

	return (
		<Panel id={id}>
		<PanelHeader>Лента событий</PanelHeader>
		<Group header={<Header mode="secondary">Navigation Example</Header>}>
			<CardGrid size="l">
				{listItems}
			</CardGrid>
		</Group>
	</Panel>
	)
};

Feed.propTypes = {
	id: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
	fetchedUser: PropTypes.shape({
		photo_200: PropTypes.string,
		first_name: PropTypes.string,
		last_name: PropTypes.string,
		city: PropTypes.shape({
			title: PropTypes.string,
		}),
	}),
};

export default Feed;
