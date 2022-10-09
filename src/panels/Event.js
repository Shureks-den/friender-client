import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { useState, useRef } from 'react';

import { Panel, PanelHeader, PanelHeaderBack, Input, FormItem, Textarea, Button, File } from '@vkontakte/vkui';
import { Icon24Camera } from '@vkontakte/icons'
import ApiSevice from '../modules/ApiSevice';

const Event = props => {

    const [eventData, setEventData] = useState({});
    const [eventAuthor, setEventAuthor] = useState({});
    const [eventImage, setEventImage] = useState(undefined);

    useEffect(async () => {
		try {
            console.log(window.location.hash?.slice(1).split('=').slice(1,2).join(''), 'aaa')
            const eventId = props.eventId.length !== 0 ? props.eventId : window.location.hash?.slice(1).split('=').slice(1,2).join('');
			const res = await ApiSevice.get('event', eventId);
            setEventData(res);
            const imageSrc = res.is_public ? res.images[0] : `https://vkevents.tk/static/${res.images[1]}`;
            setEventImage(imageSrc);

            const userResponse = await props.getUserInfo(res.author);
            const user = userResponse.response[0];
            setEventAuthor(user);
			
		} catch(err) {
			console.log(err)
		}

	}, []);

	return (
		<Panel id={props.id}>
			<PanelHeader
				left={<PanelHeaderBack onClick={props.go} data-to="home" />}
			>
				{eventData.title}
			</PanelHeader>

            <p> Описание </p>
            <p> {eventData.description} </p>
            <img src={eventImage}></img>
            <br></br>
            <p> Автор </p>
            <p> {eventAuthor.first_name} {eventAuthor.last_name}</p>


			<Button sizeY={'regular'} onClick={() => props.makeRepost(eventData.title)}> Поделиться </Button>
            <Button sizeY={'regular'} onClick={() => props.makeShare(eventData.title)}> Пригласить друзей </Button>
		</Panel>
	)
};

Event.propTypes = {
	id: PropTypes.string.isRequired,
    eventId: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
	userId: PropTypes.number,
};

export default Event;
