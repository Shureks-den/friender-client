import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, PanelHeaderBack, Input, FormItem, Textarea, Button, File, HorizontalCell, HorizontalScroll, Avatar, Calendar, Group, Header } from '@vkontakte/vkui';
import { Icon24Camera } from '@vkontakte/icons';

import ApiSevice from '../modules/ApiSevice';

import Map from '../components/Map.js';

const NewEvent = props => {
  const [formItemStatus, setFormItemStatus] = useState('default');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());

  const [imagesSrc, setImagesSrc] = useState([]);
  const [eventImages, setEventImages] = useState([]);

  const sendEvent = async () => {
    const res = await ApiSevice.post('event/create', {
      title: eventTitle,
      description: eventDescription,
      author: props.userId,
      category: 'ART'
    });
    if (eventImage) {
      const newAdvertId = res.id;

      const formData = new FormData();
      formData.append('photo', eventImage);
      const imageRes = await fetch(`https://vkevents.tk/image/upload?uid=${newAdvertId}`, {
        method: 'POST',
        body: formData
      });
      console.log(imageRes);
    }
    if (res.id) {
      props.onSuccess(res.id);
    }
  };

  const changeImage = (e) => {
    console.log(e.target.files)
    const files = Array.from(e.target.files);
    setEventImages(files.map(f => new Object(f)));
    const src = files.map(f => URL.createObjectURL(f));
    setImagesSrc(src);
  };

  return (
    <Panel id={props.id}>
      <PanelHeader
        left={<PanelHeaderBack onClick={props.go} data-to='home' />}
      >
        Новое событие
      </PanelHeader>
      <FormItem top='Название события' status={formItemStatus}>
        <Input type='text' title='Название События' label='Название события' value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
      </FormItem>
      <FormItem top='Загрузите фото'>
        <File before={<Icon24Camera role='presentation' />} size='m' accept='image/png, image/gif, image/jpeg' multiple={true} onInput={changeImage}>
          Открыть галерею
        </File>
      </FormItem>
      {imagesSrc.length > 0 &&
        <Group header={
          <Header>
            Изображения
          </Header>
        }>
          <HorizontalScroll top="Изображения"
            showArrows
            getScrollToLeft={(i) => i - 120}
            getScrollToRight={(i) => i + 120}>
            <div style={{ display: "flex", userSelect: 'none' }}>
              {imagesSrc.map((url, idx) =>
                <HorizontalCell size="m" key={idx}>
                  <Avatar
                    size={88}
                    mode="app"
                    src={url}
                  />
                </HorizontalCell>
              )}
            </div>
          </HorizontalScroll>
        </Group>
      }

      <FormItem top='Описание события' status={formItemStatus}>
        <Textarea placeholder='Самая лучшая тусовка!!!' value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
      </FormItem>

      <Group header={
        <Header>
          Время события
        </Header>
      }>
        <div style={{ display: 'flex', marginBottom: '30px', justifyContent: 'space-around'}}>
          <Calendar
            value={eventDate}
            onChange={setEventDate}
            enableTime={true}
            disablePast={true}
            disablePickers={true}
            size={'m'}
          />
        </div>
      </Group>

      <Map isClickable={true} latitude={50} longitude={50}/>

      <Button sizeY='regular' onClick={sendEvent}> Опубликовать </Button>
    </Panel>
  );
};

NewEvent.propTypes = {
  id: PropTypes.string.isRequired,
  go: PropTypes.func.isRequired,
  userId: PropTypes.number
};

export default NewEvent;
