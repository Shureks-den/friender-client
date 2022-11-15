import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, Input, FormItem, Textarea, Div, Button, CustomSelectOption, File, HorizontalCell, HorizontalScroll, Avatar, Calendar, Group, Header, Checkbox, FormLayoutGroup, Select, CardScroll, Card, IconButton, Spacing } from '@vkontakte/vkui';
import { Icon20Cancel, Icon28AddSquareOutline, Icon24Camera } from '@vkontakte/icons';

import ApiSevice from '../modules/ApiSevice';

import { useSelector, useDispatch } from 'react-redux';
import { remove, set } from '../store/categories/categoriesSlice.js';
import { setIsAdmin, setGroupId } from '../store/group/groupSlice.js';

import Map from '../components/Map/Map.js';
import VkApiService from '../modules/VkApiService';
import '../assets/styles/NewEvent.scss';

const NewEvent = props => {
  const dispatch = useDispatch();
  const startPage = useRef(null);
  const user = useSelector(state => state.user.value);

  const groups = useSelector(state => state.groupInfo.adminedGroups);
  const [groupId, setStateGroupId] = useState('');

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
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [eventId, setEventId] = useState(null);

  const categories = useSelector(state => state.categories.value);
  const [category, setCategory] = useState('');

  const [imagesSrc, setImagesSrc] = useState([]);
  const [eventImages, setEventImages] = useState([]);

  const [formTitleItemStatus, setFormTitleItemStatus] = useState('default');
  const [formTextAreaItemStatus, setFormAreaItemStatus] = useState('default');

  const suggestGroupId = useSelector(state => state.groupInfo.groupId);
  const adminFromGroup = useSelector(state => state.groupInfo.isAdmin);
  const adminedGroups = useSelector(state => state.groupInfo.adminedGroups);

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

  useEffect(() => {
    if (Boolean(suggestGroupId)) {
      setStateGroupId(suggestGroupId);
    }
  }, [suggestGroupId])

  useEffect(async () => {
    if (!user.id || categories.length) return;
    const cat = await ApiSevice.getAll('categories');
    dispatch(set(cat));
    setCategory(categories[0]);
  }, [user]);

  useEffect(async () => {
    if (!props.isEditing) return;

    const eId = props.eventId.length !== 0 ? props.eventId : window.location.hash?.slice(1).split('=').slice(1, 2).join('');
    setEventId(eId);
    const res = await ApiSevice.get('event/get', eId);
    if (res.author !== user.id) {
      props.go();
      return;
    }
    if (!res) return;
    const { time_start, title, description, category, members_limit, is_private, images, avatar, geo, ticket } = res;
    setEventDate(new Date(time_start * 1000), new Date());
    setEventTitle(title ?? '');
    setEventDescription(description ?? '');
    setIsPrivate(is_private ?? false);
    setMembers(members_limit ?? 1);
    setCategory(category);

    images.unshift(avatar?.avatar_url);
    setImagesSrc(images);

    setTicketPrice(Number(ticket.cost ?? 0));
    if (ticket.link) {
      setHasPrice(true);
      setPaymentLink(ticket.link);
    }

    setLatitude(geo?.latitude);
    setLongitude(geo?.longitude);
    setCoords([geo?.latitude, geo?.longitude]);
  }, [props.isEditing]);

  const sendEvent = async () => {
    const isAdmin = (groupId && adminFromGroup) || adminedGroups.find(g => g.id === groupId);

    const body = {
      title: eventTitle,
      description: eventDescription,
      author: user.id,
      category: category,
      source: groupId ? 'group' : 'user',
      geo: {
        address: address,
        latitude: coords[0],
        longitude: coords[1]
      },
      group_info: groupId ? {
        group_id: Number(groupId),
        is_admin: isAdmin ? true : false,
      } : null,
      time_start: Math.round(eventDate.getTime() / 1000),
      members_limit: Number(members),
      ticket: {
        link: hasPrice ? paymentLink : null,
        cost: String(ticketPrice),
      },
      is_private: isPrivate
    };
    if (props.isEditing) {
      body.id = eventId;
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
        dispatch(setGroupId({ groupId: null }));
        dispatch(setIsAdmin({ isAdmin: false }));
        props.onSuccessGroup(groupId);
      } else {
        props.onSuccess(response.id);
      }
    }
  };

  const changeImage = (e) => {
    const files = Array.from(e.target.files);
    setEventImages([...eventImages, ...files]);
    const src = files.map(f => URL.createObjectURL(f));
    setImagesSrc([...imagesSrc, ...src]);
  };

  const removePhoto = (idx) => {
    const newImages = eventImages;
    newImages.splice(idx, 1);
    const newSrcs = imagesSrc;
    newSrcs.splice(idx, 1);
    setEventImages([...newImages]);
    setImagesSrc([...newSrcs]);
  }

  return (
    <Panel id={props.id}>
      <div ref={startPage} />
      <PanelHeader
        style={{ textAlign: 'center' }}
      >
        Новое событие
      </PanelHeader>

      {
        imagesSrc.length ?
          <CardScroll
            size={user.platform === 'web' ? 'm' : 'l'}
            style={{paddingTop: '20px'}}

          >
            {imagesSrc.map((i, idx) =>
              <Card key={i}>
                <div>
                  <Icon20Cancel style={{position: 'absolute', right: '0px', cursor: 'pointer'}} onClick={() => removePhoto(idx)}/>
                  <img style={{ maxHeight: user.platform === 'web' ? '300px' : '500px' }} src={i} className='event__avatar' />
                </div>
              </Card>)
            }
          </CardScroll> :
          <Div>
            <div style={{ maxHeight: user.platform === 'web' ? '300px' : '500px', background: 'grey', textAlign: 'center' }} className='event__file-background' >
              <File before={<Icon28AddSquareOutline />} size='m' accept='image/png, image/gif, image/jpeg' className='event__file-input' multiple onInput={changeImage}>
                Добавить фото
              </File>
            </div>
          </Div>
      }

      {
        Boolean(imagesSrc.length) &&
        <FormItem top='Добавить фото'>
          <File before={<Icon24Camera role='presentation' />} size='m' accept='image/png, image/gif, image/jpeg' multiple onInput={changeImage}>
            Открыть галерею
          </File>
        </FormItem>
      }

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
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </FormItem>

      <FormItem top='Количество участников'>
        <Input type='number' min={1} value={members} onChange={(e) => setMembers(e.target.value)} />
      </FormItem>

      <FormItem top='Цена'>
        <Input type='number' min={0} value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} />
      </FormItem>


      {/* <Checkbox value={isPrivate} onChange={((e) => setIsPrivate(!isPrivate))}>Приватное событие</Checkbox> */}
      <Checkbox checked={hasPrice} value={hasPrice} onChange={((e) => setHasPrice(!hasPrice))}>Добавить ссылку на билеты</Checkbox>
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

      {(Boolean(groups?.length) && !Boolean(suggestGroupId)) &&
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
            onChange={(e) => setStateGroupId(e.target.value)}
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
        <Spacing size={16} />
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
