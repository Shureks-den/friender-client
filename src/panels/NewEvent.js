import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, Input, FormItem, Textarea, Div, Button, CustomSelectOption, File, HorizontalCell, HorizontalScroll, Avatar, Calendar, Group, Header, Checkbox, FormLayoutGroup, Select, Spacing } from '@vkontakte/vkui';
import { Icon24Camera } from '@vkontakte/icons';

import ApiSevice from '../modules/ApiSevice';

import { useSelector, useDispatch } from 'react-redux';
import { remove, set } from '../store/categories/categoriesSlice.js';

import Map from '../components/Map/Map.js';
import VkApiService from '../modules/VkApiService';

const NewEvent = props => {
  const dispatch = useDispatch();
  const startPage = useRef(null);
  const user = useSelector(state => state.user.value);

  const groups = useSelector(state => state.groupInfo.adminedGroups);
  const [groupId, setGroupId] = useState('');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [coords, setCoords] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);

  const [hasPrice, setHasPrice] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [ticketPrice, setTicketPrice] = useState(0);

  const [members, setMembers] = useState(1);
  const [address, setAddress] = useState('');

  // для редактирования
  const [editAvatar, setAvatar] = useState({});
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [eventId, setEventId] = useState(null);

  const categories = useSelector(state => state.categories.value);
  const [category, setCategory] = useState('');

  const [imagesSrc, setImagesSrc] = useState([]);
  const [eventImages, setEventImages] = useState([]);

  const [formTitleItemStatus, setFormTitleItemStatus] = useState('default');
  const [formTextAreaItemStatus, setFormAreaItemStatus] = useState('default');

  const onChangeInput = (value, where) => {
    if (where === 'title') {
      setEventTitle(value);
      setFormTitleItemStatus('default');
    }
    if (where === 'description') {
      setEventDescription(value);
      setFormAreaItemStatus('default');
    }
  };

  useEffect(() => {
    startPage.current?.scrollIntoView();
  }, []);

  useEffect(async () => {
    if (!categories.length) {
      const categories = await ApiSevice.getAll('categories');
      if (!categories) return;
      dispatch(set(categories));
    }
    setCategory(categories[0]);
  }, [user]);

  useEffect(async () => {
    if (!props.isEditing) return;

    const eId = props.eventId.length !== 0 ? props.eventId : window.location.hash?.slice(1).split('=').slice(1, 2).join('');
    setEventId(eId);
    const res = await ApiSevice.get('event/get', eId);
    if (res.author !== user.id) props.go();
    if (!res) return;
    const { time_start, title, description, category, members_limit, is_private, images, avatar, geo } = res;
    setEventDate(new Date(time_start * 1000), new Date());
    setEventTitle(title ?? '');
    setEventDescription(description ?? '');
    setIsPrivate(is_private ?? false);
    setMembers(members_limit ?? 1);
    setCategory(category);
    setAvatar(avatar);

    const img = images.unshift(avatar?.avatar_url);
    setImagesSrc(img);

    setLatitude(geo?.latitude);
    setLongitude(geo?.longitude);
    setCoords([geo?.latitude, geo?.longitude]);
  }, [props.isEditing]);

  const sendEvent = async () => {

    const body = {
      title: eventTitle,
      description: eventDescription,
      author: props.userId,
      category: category,
      source: groupId ? 'group' : 'user',
      geo: {
        address: address,
        latitude: coords[0],
        longitude: coords[1]
      },
      group_info: groupId ? {
        group_id: Number(groupId),
        is_admin: true,
      } : null,
      time_start: Math.round(eventDate.getTime() / 1000),
      members_limit: Number(members),
      ticket: {
        link: paymentLink,
        cost: String(ticketPrice),
      },
      is_private: isPrivate
    };
    if (props.isEditing) {
      body.id = eventId;
      body.avatar = editAvatar;
    }
    const { code, response } = props.isEditing ? await ApiSevice.put('event', '', 'change', body) : await ApiSevice.post('event/create', body);
    console.log(code, response, 'aaa', eventImages.length)


    if (code === 400) {
      if (response.includes('title')) {
        setFormTitleItemStatus('error');
      } else {
        setFormAreaItemStatus('error');
      }
      VkApiService.scrollToTop();
      return;
    }

    if (eventImages.length) {
      const newAdvertId = response.id;

      const formData = new FormData();
      eventImages.forEach((img, idx) => {
        formData.append(`photo${idx}`, img);
      });

      const { code, response: imageRes } = await fetch(`https://vk-events.ru/image/upload?uid=${newAdvertId}`, {
        method: 'POST',
        headers: {
          'X-User-ID': user.id,
        },
        body: formData
      });
      console.log(imageRes);
    }
    if (response.id) {
      if (groupId) {
        props.onSuccessGroup(groupId);
      } else {
        props.onSuccess(response.id);
      }
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
      <div ref={startPage} />
      <PanelHeader
        style={{ textAlign: 'center' }}
      >
        Новое событие
      </PanelHeader>
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

      <FormItem top='Название события' status={formTitleItemStatus} bottom={formTitleItemStatus === 'error' && 'Форма содержит недопустимые слова'}>
        <Input type='text' title='Название События' label='Название события' value={eventTitle} onChange={(e) => onChangeInput(e.target.value, 'title')} />
      </FormItem>

      <FormItem top='Описание события' status={formTextAreaItemStatus} bottom={formTextAreaItemStatus === 'error' && 'Форма содержит недопустимые слова'}>
        <Textarea value={eventDescription} onChange={(e) => onChangeInput(e.target.value, 'description')} />
      </FormItem>

      <FormItem top="Категория">
        <Select
          placeholder='Не выбрана'
          options={[
            ...categories
          ].map((i) => ({
            label: i,
            value: i
          }))}
          onChange={(e) => setCategory(e.target.value)}
        />
      </FormItem>

      <FormItem top='Количество участников'>
        <Input type='number' min={1} value={members} onChange={(e) => setMembers(e.target.value)} />
      </FormItem>

      <FormItem top='Цена'>
        <Input type='number' min={0} value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} />
      </FormItem>


      <Checkbox value={isPrivate} onChange={((e) => setIsPrivate(!isPrivate))}>Приватное событие</Checkbox>
      <Checkbox value={hasPrice} onChange={((e) => setHasPrice(!hasPrice))}>Добавить ссылку на билеты</Checkbox>
      {hasPrice &&
        <FormLayoutGroup mode='horizontal' style={{ alignItems: 'center' }}>
          <FormItem top='Ссылка для покупки билета'>
            <Input value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} />
          </FormItem>
        </FormLayoutGroup>
      }

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

      <Map isClickable={true} setCoords={setCoords} latitude={latitude} longitude={longitude} address={address} setAddress={setAddress} />

      {groups && groups.length &&
        <FormItem top='Администратор события'>
          <Select
            options={
              [
                { label: 'От своего имени', value: '', avatar: user.photo_100 },
                ...groups
                  .map((gr) => ({
                    label: gr.name,
                    value: String(gr.id),
                    avatar: gr.photo_100,
                  }))
              ]
            }
            onChange={(e) => setGroupId(e.target.value)}
            value={groupId}
            renderOption={({ option, ...restProps }) => (
            <CustomSelectOption
              {...restProps}
              before={<Avatar size={24} src={option.avatar} />}
            />
          )}
          />
        </FormItem>
      }
      <Div>
        <Button stretched sizeY='regular' onClick={sendEvent}> {props.isEditing ? 'Редактировать' : 'Опубликовать'} </Button>
      </Div>
    </Panel>
  );
};

NewEvent.propTypes = {
  id: PropTypes.string.isRequired,
  go: PropTypes.func.isRequired,
  userId: PropTypes.number,
  isEditing: PropTypes.bool
};

export default NewEvent;
