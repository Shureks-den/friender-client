import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, PanelHeaderBack, Input, FormItem, Textarea, Button, File, HorizontalCell, HorizontalScroll, Avatar, Calendar, Group, Header, Checkbox, FormLayoutGroup, Select } from '@vkontakte/vkui';
import { Icon24Camera } from '@vkontakte/icons';

import ApiSevice from '../modules/ApiSevice';

import { useSelector, useDispatch } from 'react-redux';
import { remove, set } from '../store/categories/categoriesSlice.js';

import Map from '../components/Map/Map.js';

const NewEvent = props => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.value);

  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [coords, setCoords] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [members, setMembers] = useState(1);

  const categories = useSelector(state => state.categories.value);
  const [category, setCategory] = useState('Туса');

  const [imagesSrc, setImagesSrc] = useState([]);
  const [eventImages, setEventImages] = useState([]);

  const [formItemStatus, setFormItemStatus] = useState('default');

  useEffect(async () => {
    if (!categories.length) {
      const categories = await ApiSevice.getAll('categories');
      if (!categories) return;
      dispatch(set(categories));
    }
    setCategory(categories[0]);
  }, [user]);

  const sendEvent = async () => {
    const res = await ApiSevice.post('event/create', {
      title: eventTitle,
      description: eventDescription,
      author: props.userId,
      category: category,
      geo: {
        latitude: coords[0],
        longitude: coords[1]
      },
      time_start: Math.round(eventDate.getTime() / 1000),
      members_limit: Number(members),
      is_private: isPrivate
    });

    if (eventImages.length) {
      const newAdvertId = res.id;

      const formData = new FormData();
      eventImages.forEach((img, idx) => {
        formData.append(`photo${idx}`, img);
      })
      
      const imageRes = await fetch(`https://vkevents.tk/image/upload?uid=${newAdvertId}`, {
        method: 'POST',
        headers: {
          'X-User-ID': user.id,
        },
        body: formData
      });
      console.log(imageRes);
    }
    if (res.id) {
      props.onSuccess(res.id);
    }
  };

  const changeImage = (e) => {
    const files = Array.from(e.target.files);
    setEventImages(files);
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
        <File before={<Icon24Camera role='presentation' />} size='m' accept='image/png, image/gif, image/jpeg' multiple onInput={changeImage}>
          Открыть галерею
        </File>
      </FormItem>
      {imagesSrc.length > 0 &&
        <Group header={
          <Header>
            Изображения
          </Header>
        }
        >
          <HorizontalScroll
            top='Изображения'
            showArrows
            getScrollToLeft={(i) => i - 120}
            getScrollToRight={(i) => i + 120}
          >
            <div style={{ display: 'flex', userSelect: 'none' }}>
              {imagesSrc.map((url, idx) =>
                <HorizontalCell size='m' key={idx}>
                  <Avatar
                    size={88}
                    mode='app'
                    src={url}
                  />
                </HorizontalCell>
              )}
            </div>
          </HorizontalScroll>
        </Group>}

      <FormItem top='Описание события' status={formItemStatus}>
        <Textarea placeholder='Самая лучшая тусовка!!!' value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
      </FormItem>

      <FormLayoutGroup mode='horizontal' style={{ alignItems: 'center' }}>
        <Checkbox value={isPrivate} onChange={((e) => setIsPrivate(e.target.value))}>Приватное событие</Checkbox>
        <FormItem top='Количество участников'>
          <Input type='number' min={1} value={members} onChange={(e) => setMembers(e.target.value)} />
        </FormItem>
      </FormLayoutGroup>

      <FormItem top='Категория' status={formItemStatus}>
        <Select
          options={[
            ...categories
          ].map((i) => ({
            label: i,
            value: i
          }))}
          defaultValue='Туса'
          onChange={(e) => setCategory(e.target.value)}
        />
      </FormItem>

      <Group header={
        <Header>
          Время события
        </Header>
      }
      >
        <div style={{ display: 'flex', marginBottom: '30px', justifyContent: 'space-around' }}>
          <Calendar
            value={eventDate}
            onChange={setEventDate}
            enableTime
            disablePast
            disablePickers
            size='m'
          />
        </div>
      </Group>

      <Map isClickable={true} setCoords={setCoords} />

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
