import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, Header, Group, CardGrid, SimpleCell, Tabs, TabsItem, HorizontalScroll, Badge, Separator, Div, Avatar, IconButton } from '@vkontakte/vkui';
import { Icon28MessageOutline } from '@vkontakte/icons';
import ApiSevice from '../modules/ApiSevice';
import { io } from "socket.io-client";


import '../assets/styles/Chats.scss';

const Chats = (props) => {
  const user = useSelector(state => state.user.value);
  const [chats, setChats] = useState([]);
  const [isChatsListOpen, setIsChatsListOpen] = useState(true);
  let socket;

  const getAllChats = async () => {
    const chats = await ApiSevice.getAll('chats');
    console.log(chats);
    if (chats) {
      setChats(chats);
    }
  }

  const openChat = async (id) => {
    // getHistory
    setIsChatsListOpen(false);
    socket = new WebSocket(`wss://vkevents.tk/ws/chat/${id}`);
    socket.onopen = () => {
      console.log('kek1')
      socket.send('kek');
    };
    socket.onerror = function (error) {
      console.log('error', error)
    };
    socket.onclose = function (event) {
      console.log('closed', event);
    }
  }

  useEffect(async () => {
    if (isChatsListOpen) {
      await getAllChats();
      socket?.close();
    }
  }, [user, isChatsListOpen]);

  return (
    <Panel id={props.id}>
      <PanelHeader style={{ textAlign: 'center' }} separator={false}>Чаты</PanelHeader>
      {isChatsListOpen && <ChatsLists chats={chats} openChat={openChat} />}
    </Panel>
  );
};


const ChatsLists = (props) => {
  const chats = props.chats.map(c => {
    return (
      <SimpleCell
        key={c.event_uid}
        before={
          <Avatar size={40} src={c.event_avatar} />
        }
        onClick={() => props.openChat(c.event_uid)}
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

const messages = ({ messages }) => {
  const domMessages = messages.map(m => {
    return (
      <Div className={m.user_id === user.id ? 'message-user' : 'message-author'}>{m.text}</Div>
    )
  })
  return (
    <Group>
      {domMessages}
    </Group>
  )
}

const ChatView = (props) => {
  const [message, setMessage] = useState('');
  return (
    <Group>
      <WriteBar
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        after={
          <Fragment>
            <WriteBarIcon onClick={() => props.sendMessage(message)} mode="send" disabled={message.length === 0} />
          </Fragment>
        }
        placeholder="Сообщение"
      />
    </Group>
  )
}


export default Chats;
