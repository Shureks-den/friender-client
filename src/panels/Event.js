import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, PanelHeaderBack, Input, FormItem, Button, Card, Group, Text, Header, Cell, Avatar, HorizontalScroll, HorizontalCell, ButtonGroup, IconButton, Link, InfoRow, Spacing, Separator } from '@vkontakte/vkui';
import { Icon24Share, Icon24Camera, Icon24Message } from '@vkontakte/icons';

import '../assets/styles/Event.scss';

import ApiSevice from '../modules/ApiSevice';

import { setActiveEvents } from '../store/user/userSlice';

import Map from '../components/Map/Map.js';
import VkApiService from '../modules/VkApiService';

/*! ics.js Wed Aug 20 2014 17:23:02 */
var saveAs = saveAs || function (e) { "use strict"; if (typeof e === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) { return } var t = e.document, n = function () { return e.URL || e.webkitURL || e }, r = t.createElementNS("http://www.w3.org/1999/xhtml", "a"), o = "download" in r, a = function (e) { var t = new MouseEvent("click"); e.dispatchEvent(t) }, i = /constructor/i.test(e.HTMLElement) || e.safari, f = /CriOS\/[\d]+/.test(navigator.userAgent), u = function (t) { (e.setImmediate || e.setTimeout)(function () { throw t }, 0) }, s = "application/octet-stream", d = 1e3 * 40, c = function (e) { var t = function () { if (typeof e === "string") { n().revokeObjectURL(e) } else { e.remove() } }; setTimeout(t, d) }, l = function (e, t, n) { t = [].concat(t); var r = t.length; while (r--) { var o = e["on" + t[r]]; if (typeof o === "function") { try { o.call(e, n || e) } catch (a) { u(a) } } } }, p = function (e) { if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)) { return new Blob([String.fromCharCode(65279), e], { type: e.type }) } return e }, v = function (t, u, d) { if (!d) { t = p(t) } var v = this, w = t.type, m = w === s, y, h = function () { l(v, "writestart progress write writeend".split(" ")) }, S = function () { if ((f || m && i) && e.FileReader) { var r = new FileReader; r.onloadend = function () { var t = f ? r.result : r.result.replace(/^data:[^;]*;/, "data:attachment/file;"); var n = e.open(t, "_blank"); if (!n) e.location.href = t; t = undefined; v.readyState = v.DONE; h() }; r.readAsDataURL(t); v.readyState = v.INIT; return } if (!y) { y = n().createObjectURL(t) } if (m) { e.location.href = y } else { var o = e.open(y, "_blank"); if (!o) { e.location.href = y } } v.readyState = v.DONE; h(); c(y) }; v.readyState = v.INIT; if (o) { y = n().createObjectURL(t); setTimeout(function () { r.href = y; r.download = u; a(r); h(); c(y); v.readyState = v.DONE }); return } S() }, w = v.prototype, m = function (e, t, n) { return new v(e, t || e.name || "download", n) }; if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) { return function (e, t, n) { t = t || e.name || "download"; if (!n) { e = p(e) } return navigator.msSaveOrOpenBlob(e, t) } } w.abort = function () { }; w.readyState = w.INIT = 0; w.WRITING = 1; w.DONE = 2; w.error = w.onwritestart = w.onprogress = w.onwrite = w.onabort = w.onerror = w.onwriteend = null; return m }(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content); if (typeof module !== "undefined" && module.exports) { module.exports.saveAs = saveAs } else if (typeof define !== "undefined" && define !== null && define.amd !== null) { define("FileSaver.js", function () { return saveAs }) }
var ics = function (e, t) { "use strict"; { if (!(navigator.userAgent.indexOf("MSIE") > -1 && -1 == navigator.userAgent.indexOf("MSIE 10"))) { void 0 === e && (e = "default"), void 0 === t && (t = "Calendar"); var r = -1 !== navigator.appVersion.indexOf("Win") ? "\r\n" : "\n", n = [], i = ["BEGIN:VCALENDAR", "PRODID:" + t, "VERSION:2.0"].join(r), o = r + "END:VCALENDAR", a = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]; return { events: function () { return n }, calendar: function () { return i + r + n.join(r) + o }, addEvent: function (t, i, o, l, u, s) { if (void 0 === t || void 0 === i || void 0 === o || void 0 === l || void 0 === u) return !1; if (s && !s.rrule) { if ("YEARLY" !== s.freq && "MONTHLY" !== s.freq && "WEEKLY" !== s.freq && "DAILY" !== s.freq) throw "Recurrence rrule frequency must be provided and be one of the following: 'YEARLY', 'MONTHLY', 'WEEKLY', or 'DAILY'"; if (s.until && isNaN(Date.parse(s.until))) throw "Recurrence rrule 'until' must be a valid date string"; if (s.interval && isNaN(parseInt(s.interval))) throw "Recurrence rrule 'interval' must be an integer"; if (s.count && isNaN(parseInt(s.count))) throw "Recurrence rrule 'count' must be an integer"; if (void 0 !== s.byday) { if ("[object Array]" !== Object.prototype.toString.call(s.byday)) throw "Recurrence rrule 'byday' must be an array"; if (s.byday.length > 7) throw "Recurrence rrule 'byday' array must not be longer than the 7 days in a week"; s.byday = s.byday.filter(function (e, t) { return s.byday.indexOf(e) == t }); for (var c in s.byday) if (a.indexOf(s.byday[c]) < 0) throw "Recurrence rrule 'byday' values must include only the following: 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'" } } var g = new Date(l), d = new Date(u), f = new Date, S = ("0000" + g.getFullYear().toString()).slice(-4), E = ("00" + (g.getMonth() + 1).toString()).slice(-2), v = ("00" + g.getDate().toString()).slice(-2), y = ("00" + g.getHours().toString()).slice(-2), A = ("00" + g.getMinutes().toString()).slice(-2), T = ("00" + g.getSeconds().toString()).slice(-2), b = ("0000" + d.getFullYear().toString()).slice(-4), D = ("00" + (d.getMonth() + 1).toString()).slice(-2), N = ("00" + d.getDate().toString()).slice(-2), h = ("00" + d.getHours().toString()).slice(-2), I = ("00" + d.getMinutes().toString()).slice(-2), R = ("00" + d.getMinutes().toString()).slice(-2), M = ("0000" + f.getFullYear().toString()).slice(-4), w = ("00" + (f.getMonth() + 1).toString()).slice(-2), L = ("00" + f.getDate().toString()).slice(-2), O = ("00" + f.getHours().toString()).slice(-2), p = ("00" + f.getMinutes().toString()).slice(-2), Y = ("00" + f.getMinutes().toString()).slice(-2), U = "", V = ""; y + A + T + h + I + R != 0 && (U = "T" + y + A + T, V = "T" + h + I + R); var B, C = S + E + v + U, j = b + D + N + V, m = M + w + L + ("T" + O + p + Y); if (s) if (s.rrule) B = s.rrule; else { if (B = "rrule:FREQ=" + s.freq, s.until) { var x = new Date(Date.parse(s.until)).toISOString(); B += ";UNTIL=" + x.substring(0, x.length - 13).replace(/[-]/g, "") + "000000Z" } s.interval && (B += ";INTERVAL=" + s.interval), s.count && (B += ";COUNT=" + s.count), s.byday && s.byday.length > 0 && (B += ";BYDAY=" + s.byday.join(",")) } (new Date).toISOString(); var H = ["BEGIN:VEVENT", "UID:" + n.length + "@" + e, "CLASS:PUBLIC", "DESCRIPTION:" + i, "DTSTAMP;VALUE=DATE-TIME:" + m, "DTSTART;VALUE=DATE-TIME:" + C, "DTEND;VALUE=DATE-TIME:" + j, "LOCATION:" + o, "SUMMARY;LANGUAGE=en-us:" + t, "TRANSP:TRANSPARENT", "END:VEVENT"]; return B && H.splice(4, 0, B), H = H.join(r), n.push(H), H }, download: function (e, t) { if (n.length < 1) return !1; t = void 0 !== t ? t : ".ics", e = void 0 !== e ? e : "calendar"; var a, l = i + r + n.join(r) + o; if (-1 === navigator.userAgent.indexOf("MSIE 10")) a = new Blob([l]); else { var u = new BlobBuilder; u.append(l), a = u.getBlob("text/x-vCalendar;charset=" + document.characterSet) } return saveAs(a, e + t), l }, build: function () { return !(n.length < 1) && i + r + n.join(r) + o } } } console.log("Unsupported Browser") } };



const Event = props => {
  const dispatch = useDispatch();
  const [eventData, setEventData] = useState({});
  const [members, setMembers] = useState([]);
  const [eventAuthor, setEventAuthor] = useState(null);
  const [eventImage, setEventImage] = useState(undefined);
  const [eventImageId, setEventImageId] = useState(null);
  const [eventDate, setEventDate] = useState(new Date().toLocaleString());
  const [eventId, setEventId] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [address, setAddress] = useState('');

  const user = useSelector(state => state.user.value);
  const adminedGroups = useSelector(state => state.groupInfo.adminedGroups);

  const downloadCalendar = () => {
    const cal = ics();
    const date = new Date(eventData.time_start * 1000);
    const finishDate = new Date(eventData.time_start * 1000 + 60 * 60 * 1000);
    console.log(date, finishDate)
    cal.addEvent(
      eventData.title,
      eventData.description,
      eventData.geo.address,
      date,
      finishDate
    );
    cal.download(eventData.title);
  }

  const subscribe = async (id) => {
    const response = await ApiSevice.put('event', id, 'subscribe');
    setIsMember(true);
    if (response) {
      const { response } = await ApiSevice.post('events', {
        id: user.id,
        is_active: {
          define: true,
          value: true,
        },
      });
      dispatch(setActiveEvents(response));
    }
  }

  const unsubscribe = async (id) => {
    const response = await ApiSevice.put('event', id, 'unsubscribe');
    setIsMember(false);
    console.log(response);
    if (!eventData.is_active) {
      props.go();
    }
    if (response) {
      const { response } = await ApiSevice.post('events', {
        id: user.id,
        is_active: {
          define: true,
          value: true,
        },
      });
      dispatch(setActiveEvents(response));
    }
  }

  const deleteEvent = async (id) => {
    const response = await ApiSevice.put('event', id, 'delete', {
      group_id: eventData.group_info.group_id,
      is_admin: Boolean(adminedGroups.find(g => g.group_id === eventData?.group_info?.group_id))
    });
    if (response) {
      const { response } = await ApiSevice.post('events', {
        id: user.id,
        is_active: {
          define: true,
          value: true,
        },
      });
      dispatch(setActiveEvents(response));
    }
    props.go();
  }

  useEffect(async () => {
    try {
      const eId = props.eventId.length !== 0 ? props.eventId : window.location.hash?.slice(1).split('=').slice(1, 2).join('');
      setEventId(eId);
      const res = await ApiSevice.get('event/get', eId);
      if (!res) return;
      setEventData(res);
      const imageSrc = res.avatar.avatar_url;
      setEventImageId(res.avatar.avatar_vk_id);
      setEventImage(imageSrc);

      const date = new Date(res.time_start * 1000).toLocaleString();
      setEventDate(date);

      if (res.author) {
        const author = await props.getUserInfo(res.author);
        setEventAuthor(author);
      }

      const transformedMembers = [];
      setIsMember(Boolean(res.members?.find(m => m === user?.id)));
      const memb = res.members;
      for (let i = 0; i < memb.length; i++) {
        if (memb[i] === res.author) continue;
        const member = await props.getUserInfo(memb[i]);

        transformedMembers.push(
          <HorizontalCell size="s" header={member.first_name} onClick={() => props.goToProfile(member.id)} key={member.id}>
            <Avatar size={64} src={member.photo_100} />
          </HorizontalCell>
        );
      }
      setMembers(transformedMembers);
    } catch (err) {
      console.log(err);
    }
  }, [user, isMember, eventId]);

  return (
    <Panel id={props.id}>
      <PanelHeader
        left={<PanelHeaderBack onClick={props.go} data-to='home' />}
      >
        {eventData.title}
      </PanelHeader>


      <Card mode="outline" style={{ width: '50%', margin: '20px auto' }}>
        <div style={{ height: 250 }} >
          <img className='event__avatar' src={eventImage} />
        </div>
      </Card>

      {eventData?.images?.filter(i => i !== '').length > 0 &&
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
              {eventData?.images?.filter(i => i !== '').map((url, idx) =>
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
        </Group>
      }


      <FormItem top='Описание события'>
        <Text weight="semibold" style={{ outline: 'ridge', borderRadius: '8px', padding: '15px 10px' }}>{eventData.description}</Text>
      </FormItem>

      <FormItem top='Категория'>
        <Text weight="bold" >{eventData.category}</Text>
      </FormItem>


      {
        eventAuthor
          ? <Group header={<Header mode="secondary">Автор</Header>} onClick={() => props.goToProfile(eventAuthor.id)}>
            <Cell
              before={eventAuthor.photo_200 ? <Avatar src={eventAuthor.photo_200} /> : null}
            >
              {`${eventAuthor.first_name} ${eventAuthor.last_name}`}
            </Cell>
          </Group>
          : <Text> Публичное событие </Text>
      }

      <Group header={<Header>Участники</Header>}>
        <HorizontalScroll showArrows
          getScrollToLeft={(i) => i - 120}
          getScrollToRight={(i) => i + 120}>
          <div style={{ display: "flex" }}>{members}</div>
        </HorizontalScroll>
      </Group>

      <FormItem top='Время события'>
        <InfoRow weight="bold" style={{ padding: '10px 0px' }}>{eventDate}</InfoRow>
      </FormItem>

      {
        (eventData?.ticket?.cost || eventData?.ticket?.link) &&
        <FormItem top='Информация о билетах'>
          {
            eventData.ticket.cost
            &&
            <InfoRow weight="bold" style={{ padding: '10px 0px' }}>Цена: {eventData.ticket.cost} ₽</InfoRow>
          }
          {
            eventData.ticket.link
            &&
            <Link href={eventData.ticket.link} target='_blank'>Ссылка для покупки билета</Link>
          }
        </FormItem>
      }


      <Map isClickable={false} latitude={eventData.geo?.latitude} longitude={eventData.geo?.longitude} address={address} setAddress={setAddress} />


      {eventData.is_active &&
        <ButtonGroup
          mode="horizontal"
          stretched
          style={{ justifyContent: 'center', marginBottom: '30px' }}
        >
          <IconButton onClick={() => props.makeRepost(eventId, eventData?.title, eventImageId)}>
            <Icon24Share />
          </IconButton>
          <IconButton onClick={() => VkApiService.postStory(eventId, eventData?.title, eventData?.avatar.avatar_url)}>
            <Icon24Camera />
          </IconButton>
          <IconButton onClick={() => props.makeShare(eventId)}>
            <Icon24Message />
          </IconButton>
        </ButtonGroup>
      }


      <Button sizeY='regular' onClick={downloadCalendar}> Добавить в календарь </Button>
      <Separator />
      <Spacing />

      {(user?.id === eventData.author || adminedGroups.find(g => g.group_id === eventData?.group_info?.group_id)) && eventData.is_active ?

        <ButtonGroup
          mode="vertical"
          stretched
          style={{ justifyContent: 'center', marginBottom: '30px', alignItems: 'center' }}
        >
          {user?.id === eventData.author && <Button sizeY='regular' onClick={() => props.goToEditing(eventId)}> Редактировать </Button>}

          <Button sizeY='regular' onClick={() => deleteEvent(eventId)}> Удалить событие </Button>
        </ButtonGroup>

        : (isMember || !eventData.is_active)
        && <Button sizeY='regular' onClick={() => unsubscribe(eventId)}> Отписаться </Button>
      }

      {(!isMember && user?.id !== eventData.author && eventData.is_active) && <Button sizeY='regular' onClick={() => subscribe(eventId)}> Подписаться на событие </Button>}
    </Panel>
  );
};

Event.propTypes = {
  id: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
  go: PropTypes.func.isRequired,
  userId: PropTypes.number
};

export default Event;
