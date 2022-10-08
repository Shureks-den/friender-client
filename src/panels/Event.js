import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { useState, useRef } from 'react';

import { Panel, PanelHeader, PanelHeaderBack, Input, FormItem, Textarea, Button, File } from '@vkontakte/vkui';
import { Icon24Camera } from '@vkontakte/icons'
import ApiSevice from '../modules/ApiSevice';

const Event = props => {

    const [eventData, setEventData] = useState({});

    useEffect(async () => {
		try {
            console.log(props.eventId)
			const res = await ApiSevice.get('event', props.eventId);
            setEventData(res);
			console.log(res)
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
            <br></br>
            <p> Автор </p>
            <p> {eventData.author} </p>


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
