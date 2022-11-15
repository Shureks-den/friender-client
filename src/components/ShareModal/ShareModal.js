
import React, { useEffect, useState, useRef, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Icon56ShareOutline, Icon56MessagesOutline, Icon24Dismiss, Icon24Cancel, Icon24Done } from '@vkontakte/icons';
import { Icon56ArrowUturnLeftOutline, Icon24PhotosStackOutline, Icon24Camera, Icon28RemoveCircleOutline, Icon28UserStarBadgeOutline } from '@vkontakte/icons';

import { ModalCard, Button, ModalRoot, SplitLayout, ButtonGroup, Input, FormItem, File, Div, Text, ModalPage, SimpleCell, Avatar, Group, Header, IconButton, ModalPageHeader, PanelHeaderButton, PanelHeaderClose, ANDROID, IOS, usePlatform } from '@vkontakte/vkui';
import ApiSevice from '../../modules/ApiSevice';

export const ShareModal = ({ activeModal, setActiveModal, share, goToChat, unsubscribe, event, members, removeMember}) => {
  const platform = usePlatform();
  const user = useSelector(state => state.user.value);

  const [albumUrl, setAlbumUrl] = useState('');
  const [albumState, setAlbumState] = useState('default');

  const sendImages = async () => {
    if (albumUrl) {
      if (!albumUrl.includes('vk.com') || !albumUrl.includes('album')) {
        setAlbumState('error');
        return;
      }
      console.log(albumUrl);
      const albumId = albumUrl.split('_')[1];
      const response = await ApiSevice.put('event', '', 'album', {
        uid_album: albumId,
        uid_event: event.id,
        type: 'add'
      });
      const { code } = response;
      if (code === 200) {
        setActiveModal('SUCCESS-MODAL');
      }
    }
  }

  const modal = (
    <ModalRoot
      activeModal={activeModal}
      onClose={() => setActiveModal(null)}
    >
      <ModalCard
        id='SHARE-MODAL'
        onClose={() => setActiveModal(null)}
        icon={<Icon56ShareOutline />}
        style={{ alignItems: 'center' }}
        header="Поделиться событием"
        subheader="Расскажите о событие друзьям, чтобы собрать компанию"
        actions={
          <ButtonGroup mode='vertical' stretched={true}>
            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => share.repost()}
            >
              Репост
            </Button>
            {
              user.platform !== 'web' &&
              <Button
                size="m"
                mode="primary"
                stretched={true}
                onClick={() => share.share()}
              >
                Отправить в личном сообщении
              </Button>
            }

            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => share.story()}
            >
              Опубликовать историю
            </Button>
          </ButtonGroup>
        }
      >
      </ModalCard>
      <ModalCard
        id='JOIN-MODAL'
        onClose={() => setActiveModal(null)}
        icon={<Icon56MessagesOutline />}
        style={{ alignItems: 'center' }}
        header="Вы записались на событие!"
        subheader="Перейдите в чат, чтобы начать общаться с участниками"
        actions={
          <ButtonGroup mode='vertical' stretched={true}>
            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => goToChat()}
            >
              Перейти
            </Button>
          </ButtonGroup>
        }
      >
      </ModalCard>
      <ModalCard
        id='LEAVE-MODAL'
        onClose={() => setActiveModal(null)}
        icon={<Icon56ArrowUturnLeftOutline />}
        style={{ alignItems: 'center' }}
        header="Покинуть событие"
        subheader='Вы действительно хотите отказаться от участия?'
        actions={
          <ButtonGroup mode='vertical' stretched={true}>
            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => unsubscribe()}
            >
              Покинуть событие
            </Button>
          </ButtonGroup>
        }
      >
      </ModalCard>
      <ModalCard
        id='PHOTO-MODAL'
        onClose={() => setActiveModal(null)}
        icon={<Icon24PhotosStackOutline width={56} height={56} />}
        style={{ alignItems: 'center' }}
        header="Загрузить фотографии с мероприятия"
        actions={
          <ButtonGroup mode='vertical' stretched={true} style={{ alignItems: 'center' }}>
            <FormItem top='Укажите ссылку на альбом...' style={{ paddingTop: '0px', paddingBottom: '0px' }} status={albumState} bottom={albumState === 'error' && 'Ссылка должна быть на альбом ВКонтакте'}>
              <Input
                onFocus={() => setAlbumState('default')}
                type="text"
                value={albumUrl}
                onInput={(e) => setAlbumUrl(e.target.value)}
                placeholder='ссылка'
              />
            </FormItem>
            <Div style={{ paddingTop: '0px', paddingBottom: '0px' }}>
              <Text>или...</Text>
            </Div>
            <FormItem style={{ paddingTop: '0px', paddingBottom: '0px' }}>
              <File before={<Icon24Camera role='presentation' />} size='m' accept='image/png, image/gif, image/jpeg' multiple disabled>
                Загрузите фото
              </File>
            </FormItem>
            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => sendImages()}
            >
              Добавить фото
            </Button>
          </ButtonGroup>
        }
      >
      </ModalCard>
      <ModalCard
        id='SUCCESS-MODAL'
        onClose={() => setActiveModal(null)}
        icon={<Icon24PhotosStackOutline width={56} height={56} />}
        style={{ alignItems: 'center' }}
        header="Фотографии загружены"
        actions={
          <ButtonGroup mode='vertical' stretched={true}>
            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => setActiveModal(null)}
            >
              Закрыть
            </Button>
          </ButtonGroup>
        }
      >
      </ModalCard>

      <ModalPage
        id='AUTHOR-MODAL'
        style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}
        onClose={() => setActiveModal(null)}
        settlingHeight={100}
        header={
          <ModalPageHeader
            before={
              <Fragment>
                {(platform === ANDROID || platform === VKCOM) && (
                  <PanelHeaderButton onClick={() => setActiveModal(null)}>
                    <Icon24Cancel />
                  </PanelHeaderButton>
                )}
              </Fragment>
            }
            after={
              <Fragment>
                {(platform === ANDROID || platform === VKCOM) && (
                  <PanelHeaderButton onClick={() => setActiveModal(null)}>
                    <Icon24Done />
                  </PanelHeaderButton>
                )}
                {platform === IOS && (
                  <PanelHeaderButton onClick={() => setActiveModal(null)}>Готово</PanelHeaderButton>
                )}
              </Fragment>
            }
          >
            Участники {members?.length}
          </ModalPageHeader>
        }
      >
        <Group>
          {members?.map((u) => {
            return (
              <SimpleCell
                before={<Avatar src={u.photo_100} />}
                key={u.id}
                after={
                  u.id === user.id ?
                    <IconButton>
                      <Icon28UserStarBadgeOutline />
                    </IconButton>
                    :
                    <IconButton onClick={() => removeMember(u.id)}>
                      <Icon28RemoveCircleOutline />
                    </IconButton>
                }
              >
                {`${u.first_name} ${u.last_name}`}
              </SimpleCell>
            );
          })}
        </Group>
      </ModalPage>
    </ModalRoot>
  )

  return (
    <SplitLayout modal={modal} />
  )
};
