import React, { useState, useEffect, Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, Header, Group, Cell, SimpleCell, Avatar, TabsItem, HorizontalScroll, Badge, Separator, Div, IconButton, WriteBar, WriteBarIcon, FixedLayout, PanelHeaderBack } from '@vkontakte/vkui';
import { Icon28MessageOutline } from '@vkontakte/icons';
import ApiSevice from '../modules/ApiSevice';


import '../assets/styles/Chats.scss';
import { monthNames } from '../variables/constants';

const Chats = (props) => {
  const user = useSelector(state => state.user.value);
  const messagesEndRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [isChatsListOpen, setIsChatsListOpen] = useState(true);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!isChatsListOpen) {
      setTimeout(scrollToBottom, 0);
    }
  }, [messages, isChatsListOpen]);

  const getAllChats = async () => {
    const chats = await ApiSevice.getAll('chats');
    if (chats) {
      setChats(chats);
    }
  }

  const getHistory = async (id) => {
    const messages = await ApiSevice.getAll('messages', {
      event: id,
      page: 0,
      limit: 100
    });
    console.log(messages);
    const { members } = await ApiSevice.get('event/get', id);
    const fetchedUsers = [];
    for (let i = 0; i < members.length; i++) {
      const member = await props.getUserInfo(members[i]);
      fetchedUsers.push(member);
    }
    setMembers(fetchedUsers);
    setMessages(messages.reverse());
  }

  const openChat = async (id, userId) => {
    await getHistory(id);
    setIsChatsListOpen(false);
    const s = new WebSocket(`wss://vk-events.ru/ws/messenger/${id}?user_id=${userId}`);
    s.onopen = () => {
      setSocket(s);
    };
  }

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      setMessages([...messages, JSON.parse(event.data)]);
    }
    socket.onerror = function (error) {
      console.log('error', error)
    };
    socket.onclose = function (event) {
      console.log('closed', event);
    }
  }, [socket, messages]);

  const sendMessage = (text) => {
    socket.send(text);
  };

  const closeChat = () => {
    setMessages([]);
    socket?.close();
  }

  useEffect(async () => {
    if (isChatsListOpen) {
      closeChat();
      await getAllChats();
    }
  }, [user, isChatsListOpen]);

  useEffect(() => {
    if (!user.id) return;
    const chatId = props.chatId ? props.chatId : window.location.hash?.slice(1).split('=').slice(1, 2).join('');
    if (chatId) {
      openChat(chatId, user.id, socket);
    }
  }, [user]);

  return (
    <Panel id={props.id}>
      <PanelHeader left={!isChatsListOpen && <PanelHeaderBack onClick={() => setIsChatsListOpen(true)} />} style={{ textAlign: 'center' }} separator={false}>Чаты</PanelHeader>
      {isChatsListOpen &&
        <ChatsLists chats={chats} openChat={openChat} userId={user.id} />}
      {messages && <Messages messages={messages} users={members} user={user} goToProfile={props.goToProfile} closeChat={closeChat} />}
      {!isChatsListOpen && <ChatView sendMessage={sendMessage} />}
      <div ref={messagesEndRef} />
    </Panel>
  );
};


const ChatsLists = (props) => {
  console.log(props)
  const chats = props.chats.map(c => {
    return (
      <SimpleCell
        key={c.event_uid}
        before={
          <Avatar size={40} src={c.event_avatar} />
        }
        onClick={() => props.openChat(c.event_uid, props.userId, props.socket)}
        after={
          <IconButton>
            <Icon28MessageOutline />
          </IconButton>
        }
      >
        {c.event_title}
      </SimpleCell>
    )
  })
  return (
    <Group>
      <Header mode="secondary">
        Список Чатов
      </Header>
      {chats}
    </Group>
  )
}

const Messages = ({ messages, users, user, goToProfile, closeChat }) => {
  const [domMessages, setDomMessages] = useState([]);

  const clickAvatar = (userId) => {
    closeChat();
    goToProfile(userId);
  }

  useEffect(() => {
    const messagesCopy = messages;
    for (let idx = 0; idx < messagesCopy.length; idx++) {
      if (new Date(messagesCopy[idx].time_created * 1000).getDate() < new Date(messagesCopy[idx + 1]?.time_created * 1000).getDate()) {
        messagesCopy.splice(idx + 1, 0, { isSeparator: true, time_created: messagesCopy[idx + 1].time_created });
        idx++;
      }
    }
    if (messagesCopy[0] && !messagesCopy[0].isSeparator) {
      messagesCopy.unshift({ isSeparator: true, time_created: messagesCopy[0].time_created });
    }
    setDomMessages(messagesCopy.map((m, idx) => {
      const isSeparator = m.isSeparator;
      const time = new Date(m.time_created * 1000);
      const timeFormatted = `${time.getHours()}:${time.getMinutes() < 10 ? '0' : ''}${time.getMinutes()}`;
      const profile = users.find(u => u.id === m?.user_id);
      const isUser = m?.user_id === user.id;
      if (isSeparator) {
        const now = new Date();
        const messageDay = (now.getDate() === time.getDate() && now.getMonth() === time.getMonth()) ? 'Сегодня' : `${time.getDate()} ${monthNames[time.getMonth()]}`;
        return (
          <Div key={idx} className='message__separator'>
            {messageDay}
          </Div>);
      } else {
        return (
          <Div key={idx} className={(m.user_id === user.id ? 'message-author' : 'message-user') + ' message'}>
            {!isUser &&
              <Cell
                before={profile.photo_200 ? <Avatar src={profile.photo_200} /> : null}
                onClick={() => clickAvatar(m.user_id)}
              />
            }

            <Div className={(m.user_id === user.id ? 'message-wrapper-author' : 'message-wrapper-user') + ' message-wrapper'}>
              <div className='message__user' onClick={() => clickAvatar(m.user_id)}>{profile.first_name} {profile.last_name}</div>
              <div className='message__text'>{m.text}</div>
              <div className='message__time'>{timeFormatted}</div>
            </Div>

            {isUser &&
              <Cell
                before={profile.photo_200 ? <Avatar src={profile.photo_200} /> : null}
                onClick={() => clickAvatar(m.user_id)}
              />
            }
          </Div>
        )
      }
    }));
  }, [messages]);

  return (
    <Group className={'chat__messages'}>
      {domMessages}
    </Group>
  )
}

const ChatView = (props) => {
  const [message, setMessage] = useState('');
  const send = () => {
    if (message.length) {
      props.sendMessage(message);
    }

    setMessage('');
  };
  const handleEnterClick = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      send();
    }
  };
  return (
    <FixedLayout vertical='bottom' className='chat__input'>
      <WriteBar
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleEnterClick}
        after={
          <Fragment>
            <WriteBarIcon onClick={send} mode="send" disabled={message.length === 0} />
          </Fragment>
        }
        placeholder="Сообщение"
      />
    </FixedLayout>
  )
}


export default Chats;
