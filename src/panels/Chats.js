import React, { useState, useEffect, Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Panel, PanelHeader, Header, Group, Cell, SimpleCell, Avatar, Div, IconButton, WriteBar, WriteBarIcon, FixedLayout, Counter, PanelHeaderBack, Search } from '@vkontakte/vkui';
import { Icon28MessageOutline } from '@vkontakte/icons';
import ApiSevice from '../modules/ApiSevice';


import '../assets/styles/Chats.scss';
import { monthNames } from '../variables/constants';

const Chats = (props) => {
  const user = useSelector(state => state.user.value);
  const userToken = useSelector(state => state.user.token);
  const messagesEndRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [displayChats, setDisplayChats] = useState([]);
  const [isChatsListOpen, setIsChatsListOpen] = useState(true);
  const [inputText, setInputText] = useState('');

  const [chatInfo, setChatInfo] = useState({});
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

  useEffect(() => {
    setDisplayChats(chats);
  }, [chats]);

  useEffect(() => {
    setDisplayChats([...chats.filter(c => c.event_title.includes(inputText))]);
  }, [inputText]);

  const getHistory = async (id) => {
    const messages = await ApiSevice.getAll('messages', {
      event: id,
      page: 0,
      limit: 100
    });
    const { members, avatar, title } = await ApiSevice.get('event/get', id);
    setChatInfo({ avatar: avatar.avatar_url, title: title, id: id });
    const allMembers = members;
    messages.forEach(m => {
      if (allMembers.findIndex(u => u === m.user_id) === -1) {
        allMembers.push(m.user_id);
      }
    });
    const fetchedUsers = await props.getUserInfo(allMembers.join(','), userToken);
    setMembers(fetchedUsers);
    setMessages(messages.reverse());
  }

  const openChat = async (id, userId) => {
    await getHistory(id);
    setIsChatsListOpen(false);
    const s = new WebSocket(`wss://vk-events.ru/wsws/messenger/${id}?user_id=${userId}`);
    s.onopen = () => {
      setSocket(s);
    };
  }

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = async (event) => {
      const messageData = JSON.parse(event.data);
      const userId = messageData.user_id;
      if (!members.find(m => m.id === userId)) {
        const userInfo = await props.getUserInfo(String(userId), userToken);
        setMembers([...members, userInfo]);
      }
      setTimeout(() => setMessages([...messages, messageData]), 0);
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
    if (!user.id) return;
    if (isChatsListOpen) {
      closeChat();
      await getAllChats();
    }
  }, [user, isChatsListOpen]);

  useEffect(() => {
    if (!user.id) return;
    const hash = window.location.hash;
    const chatId = props.chatId ? props.chatId : hash?.slice(1).split('=').slice(1, 2).join('');
    if (props.chatId || (chatId && hash?.slice(0).includes('chats'))) {
      openChat(chatId, user.id, socket);
    }
  }, [user]);

  return (
    <Panel id={props.id}>
      <PanelHeader left={!isChatsListOpen && <PanelHeaderBack onClick={() => setIsChatsListOpen(true)} />} style={{ textAlign: 'center' }} separator={false}>Чаты</PanelHeader>
      {
        isChatsListOpen &&
        <Search value={inputText} onChange={e => setInputText(e.target.value)} />
      }
      {
        isChatsListOpen &&
        <ChatsLists chats={displayChats} openChat={openChat} userId={user.id} />
      }
      {
        !isChatsListOpen &&
        <FixedLayout vertical='top' className='chat__info'>
          <Cell
            before={chatInfo.avatar ? <Avatar src={chatInfo.avatar} size={25} /> : null}
            onClick={() => props.goToEvent(chatInfo.id)}
            className='chat__info-cell'
          >
            {`${chatInfo.title}`}
          </Cell>
        </FixedLayout>
      }

      {
        !isChatsListOpen &&
        <Messages messages={messages} users={members} user={user} goToProfile={props.goToProfile} closeChat={closeChat} />
      }

      {
        !isChatsListOpen &&
        <ChatView sendMessage={sendMessage} />
      }
      <div ref={messagesEndRef} />
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
        onClick={() => props.openChat(c.event_uid, props.userId, props.socket)}
        after={
          <IconButton>
            {
              Boolean(c.unread_messages_number ?? 0) &&
              <Counter size="s" mode="prominent" style={{ position: 'absolute', right: '-0.175rem', top: '0.175rem' }}>
                {c.unread_messages_number}
              </Counter>
            }
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
          <Div key={idx} className={(m.user_id === user.id ? 'message-author' : 'message-user') + ' message'} style={{ paddingBottom: '6px', paddingTop: '6px' }}>
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
    <Group className={'chat__messages'} style={{ paddingTop: '45px' }}>
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
