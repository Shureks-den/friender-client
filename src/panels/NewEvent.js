import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, Input, FormItem, Textarea, Div, Button, CustomSelectOption, File, Spinner, Avatar, Calendar, Group, Header, Checkbox, FormLayoutGroup, Select, CardScroll, Card, Text, Spacing } from '@vkontakte/vkui';
import { Icon20Cancel, Icon28AddSquareOutline, Icon24Camera } from '@vkontakte/icons';

import ApiSevice from '../modules/ApiSevice';

import { useSelector, useDispatch } from 'react-redux';
import { remove, set } from '../store/categories/categoriesSlice.js';
import { setIsAdmin, setGroupId } from '../store/group/groupSlice.js';

import { ShareModal } from '../components/ShareModal/ShareModal';

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

  const [activeModal, setActiveModal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // для редактирования
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [eventId, setEventId] = useState(null);

  const categories = useSelector(state => state.categories.value);
  const [category, setCategory] = useState('');

  const [imagesSrc, setImagesSrc] = useState([]);
  const [eventImages, setEventImages] = useState([]);

  // Валидация
  const titleRef = useRef(null);
  const [formTitleItemStatus, setFormTitleItemStatus] = useState('default');
  const [titleErrorText, setTitleTextError] = useState('');
  const descRef = useRef(null);
  const [formTextAreaItemStatus, setFormAreaItemStatus] = useState('default');
  const [formTextError, setFormTextError] = useState('');
  const [priceStatus, setPriceStatus] = useState('default');
  const [priceError, setPriceError] = useState('');
  const [membersLimitStatus, setMembersLimitStatus] = useState('default');
  const [membersLimitError, setMembersLimitError] = useState('');
  const [timeError, setTimeError] = useState('');

  // логика для групп, предложка, пост оттуда
  const suggestGroupId = useSelector(state => state.groupInfo.groupId);
  const adminFromGroup = useSelector(state => state.groupInfo.isAdmin);
  const adminedGroups = useSelector(state => state.groupInfo.adminedGroups);

  const scrollTo = (item) => {
    item.current?.scrollIntoView({behavior: 'smooth'});
  }

  const setDate = (value) => {
    if (eventDate.getDate() !== value.getDate()) {
      value.setHours(12);
      value.setMinutes(0);
    }
    setTimeError('');
    setEventDate(value);
  }

  const onChangeInput = (value, where) => {
    switch (where) {
      case 'title':
        setEventTitle(value);
        setFormTitleItemStatus('default');
        break;
      case 'description':
        setEventDescription(value);
        setFormAreaItemStatus('default');
        break;
      case 'members':
        setMembers(value);
        setMembersLimitStatus('default');
        break;
      case 'price':
        setTicketPrice(value);
        setPriceStatus('default');
        break;
    
      default:
        break;
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

  const suggestAction = () => {
    dispatch(setGroupId({ groupId: null }));
    dispatch(setIsAdmin({ isAdmin: false }));
    props.onSuccessGroup(groupId);
  }

  const sendEvent = async () => {
    let hasError = false;
    if (!eventTitle.length) {
      setTitleTextError('Название не должно быть пустым');
      setFormTitleItemStatus('error');
      hasError = true;
    }
    if (eventTitle.length > 256) {
      setTitleTextError('Слишком длинное название');
      setFormTitleItemStatus('error');
      hasError = true;
    }

    if (!eventDescription.length) {
      setFormTextError('Описание не должно быть пустым');
      setFormAreaItemStatus('error');
      hasError = true;
    }
    if (eventDescription.length > 1000) {
      setFormTextError('Слишком длинное описание');
      setFormAreaItemStatus('error');
      hasError = true;
    }

    if (ticketPrice < 0 || ticketPrice > 10000000 || !Number.isFinite(Number(ticketPrice))) {
      setPriceStatus('error');
      setPriceError('Невалидное значение');
      hasError = true;
    }

    if (members < 1 || members > 10000000 || !Number.isFinite(Number(members))) {
      setMembersLimitStatus('error');
      setMembersLimitError('Невалидное значение');
      hasError = true;
    }

    const dateNow = new Date();
    if (eventDate.getTime() - 1000 * 60 * 60 < dateNow.getTime()) {
      setTimeError('Не валидное значение времени - событие не должно начинаться раньше чем за час');
      hasError = true;
    }

    if (hasError) {
      startPage.current?.scrollIntoView();
      return;
    }

    const isAdmin = (groupId && adminFromGroup) || Boolean(adminedGroups.find(g => g.id === Number(groupId)));

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
        is_admin: isAdmin,
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
    setIsLoading(true);
    const { code, response } = props.isEditing ? await ApiSevice.put('event', '', 'change', body) : await ApiSevice.post('event/create', body);
    console.log(code, response, 'aaa', eventImages.length)


    if (code === 400) {
      if (response.includes('title')) {
        setTitleTextError('Название содержит недопустимые слова');
        setFormTitleItemStatus('error');
        scrollTo(titleRef);
      } else {
        setFormTextError('Описание содержит недопустимые слова');
        setFormAreaItemStatus('error');
        scrollTo(descRef);
      }
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
    setIsLoading(false);
    if (response.id) {
      if (groupId) {
        if (!adminFromGroup) {
          setActiveModal('SUGGEST-MODAL');
        } else {
          dispatch(setGroupId({ groupId: null }));
          dispatch(setIsAdmin({ isAdmin: false }));
          props.onSuccessGroup(groupId);
        }
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
      <ShareModal
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        groupSuggestAction={() => suggestAction()}
      />

      {
        imagesSrc.length ?
          <CardScroll
            size={user.platform === 'web' ? 'm' : 'l'}
            style={{ paddingTop: '20px' }}
          >
            {imagesSrc.map((i, idx) =>
              <Card key={i}>
                <div>
                  <Icon20Cancel style={{ position: 'absolute', right: '0px', cursor: 'pointer' }} onClick={() => removePhoto(idx)} />
                  <img style={{ maxHeight: user.platform === 'web' ? '300px' : '500px' }} src={i} className='event__avatar' />
                </div>
              </Card>)
            }
          </CardScroll> :
          <Div>
            <div style={{ maxHeight: user.platform === 'web' ? '300px' : '500px', background: 'grey', textAlign: 'center' }} className='event__file-background' >
              <File before={<Icon28AddSquareOutline />} size='m' accept='image/png, image/gif, image/jpeg' className={'event__file-input' + (user.platform === 'web' ? ' event__file-input-web' : ' event__file-input-mobile') } multiple onInput={changeImage}>
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

      <FormItem top='Название события' status={formTitleItemStatus} bottom={formTitleItemStatus === 'error' && titleErrorText} getRootRef={titleRef}>
        <Input type='text' title='Название События' label='Название события' value={eventTitle} onChange={(e) => onChangeInput(e.target.value, 'title')} />
      </FormItem>

      <FormItem top='Описание события' status={formTextAreaItemStatus} bottom={formTextAreaItemStatus === 'error' && formTextError} getRootRef={descRef}>
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

      <FormItem top='Количество участников' status={membersLimitStatus} bottom={membersLimitStatus === 'error' && membersLimitError}>
        <Input type='number' min={1} value={members} onChange={(e) => onChangeInput(e.target.value, 'members')} />
      </FormItem>

      <FormItem top='Цена' status={priceStatus} bottom={priceStatus === 'error' && priceError}>
        <Input type='number' min={0} value={ticketPrice} onChange={(e) => onChangeInput(e.target.value, 'price')} />
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
        <Div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', justifyContent: 'space-around' }}>
        {Boolean(timeError.length) && <Text style={{color: 'var(--vkui--color_text_negative)', marginBottom: '10px'}}>{timeError}</Text>}
          <Calendar
            value={eventDate}
            onChange={setDate}
            enableTime
            disablePast
            disablePickers
            size='m'
          />
        </Div>
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
        <Button stretched sizeY='regular' onClick={sendEvent} disabled={isLoading}> {
          isLoading ?
            <Spinner size="small" style={{ margin: "5px 0" }} /> :
            props.isEditing ?
              'Редактировать' :
              (!groupId || (groupId && adminFromGroup)) ?
                'Опубликовать' : 'Предложить событие'}
        </Button>
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
