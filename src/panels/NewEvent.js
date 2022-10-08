import React from 'react';
import PropTypes from 'prop-types';
import { useState, useRef } from 'react';

import { Panel, PanelHeader, PanelHeaderBack, Input, FormItem, Textarea, Button, File } from '@vkontakte/vkui';
import { Icon24Camera } from '@vkontakte/icons'


const NewEvent = props => {
	const [formItemStatus, setFormItemStatus] = useState("default");
	const [eventTitle, setEventTitle] = useState('');
	const [eventDescription, setEventDescription] = useState('');


	const [imageSrc, setImageSrc] = useState(null);
	const [eventImage, setEventImage] = useState(null);

	const sendEvent = async () => {
		console.log({
			title: eventTitle,
			description: eventDescription,
			author: props.userId,
			image: eventImage,
		})
	}

	const changeImage = (e) => {
		const [file] = e.target.files;
		console.log(file)
		setEventImage(new Object(file));
		const src = URL.createObjectURL(file);
		setImageSrc(src);
	}

	return (
		<Panel id={props.id}>
			<PanelHeader
				left={<PanelHeaderBack onClick={props.go} data-to="home" />}
			>
				Новое событие
			</PanelHeader>
			<FormItem top="Название события" status={formItemStatus}>
				<Input type="text" title='Название События' label='Название события' value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
			</FormItem>
			<FormItem top="Загрузите фото">
				<File before={<Icon24Camera role="presentation" />} size="m" accept="image/png, image/gif, image/jpeg" onInput={changeImage}>
					Открыть галерею
				</File>
			</FormItem>
			<img src={imageSrc} />
			<FormItem top="Описание события" status={formItemStatus}>
				<Textarea placeholder="Самая лучшая тусовка!!!" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
			</FormItem>


			<Button sizeY={'regular'} onClick={sendEvent}> Опубликовать </Button>
		</Panel>
	)
};

NewEvent.propTypes = {
	id: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
	userId: PropTypes.number,
};

export default NewEvent;
