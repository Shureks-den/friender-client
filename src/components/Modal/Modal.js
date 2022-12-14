
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Icon56ShareOutline, Icon56MessagesOutline, Icon24Dismiss, Icon24Cancel, Icon24Done, Icon24ReportOutline } from '@vkontakte/icons';
import { Icon56ArrowUturnLeftOutline, Icon24PhotosStackOutline, Icon24Camera, Icon28RemoveCircleOutline, Icon28UserStarBadgeOutline } from '@vkontakte/icons';

import { ModalCard, Button, ModalRoot, SplitLayout, ButtonGroup, Input, FormItem, File, Div, Text, ModalPage, SimpleCell, Avatar, Group, Counter, IconButton, ModalPageHeader, PanelHeaderButton, PanelHeaderClose, ANDROID, IOS, VKCOM, usePlatform, Textarea } from '@vkontakte/vkui';
import ApiSevice from '../../modules/ApiSevice';
import VkApiService from '../../modules/VkApiService';

export const Modal = ({
  activeModal,
  setActiveModal,
  share,
  goToChat,
  unsubscribe,
  event = {},
  members = [],
  removeMember = () => ({}),
  groupSuggestAction = () => ({}),
  reportUserId = null,
  setCanReport = () => ({}),
  albumId = null,
  addAlbum = () => ({}),
}) => {
  const platform = usePlatform();
  const user = useSelector(state => state.user.value);
  const userToken = useSelector(state => state.user.token);

  const [albumUrl, setAlbumUrl] = useState('');
  const [albumState, setAlbumState] = useState('default');

  const [usersImages, setUsersImages] = useState([]);

  const [reportReason, setReportReason] = useState([]);
  const [canUploadPhotos, setCanUploadPhotos] = useState(false);

  useEffect(() => {
    setCanUploadPhotos(albumUrl.length || usersImages.length);
  }, [albumUrl, usersImages])

  const shareHandler = async (func) => {
    const response = await func();
    if (response) setActiveModal(null);
  }

  const sendReport = async () => {
    const response = await ApiSevice.put('complaint', '', '', {
      reason: reportReason,
      user: reportUserId,
      event: event.id
    })
    setReportReason('');
    setCanReport(false);
    setActiveModal('REPORT-SUCCESS-MODAL');
  }

  const changeImage = (e) => {
    const files = Array.from(e.target.files);
    setUsersImages(files);
  }

  const sendImages = async () => {
    if (albumUrl) {
      if (!albumUrl.includes('vk.com') || !albumUrl.includes('album')) {
        setAlbumState('error');
        return;
      }
      const albumPart = albumUrl.split('album')[1];
      const userAlbumId = albumPart.split('%2F')[0];
      const albumId = userAlbumId.split('_')[1];
      const response = await ApiSevice.put('event', '', 'album', {
        uid_album: albumId,
        uid_event: event.id,
        type: 'add'
      });
      const { code } = response;
      if (code === 200) {
        addAlbum(albumId);
        setActiveModal('SUCCESS-MODAL');
      }
    } else {
      const imagesData = await VkApiService.sendImages(event.title, userToken, albumId);
      const response = await ApiSevice.postImageToAlbum('event/album/upload', imagesData.uploadUrl, usersImages);
      response.forEach(async (r) => {
        const saveResponse = await VkApiService.saveImages(userToken, imagesData.albumId, r.server, r.photos_list, r.hash);
        console.log(saveResponse);
      });
      if (!albumId) {
        const apiSaveResponse = await ApiSevice.put('event', '', 'album', {
          uid_album: String(imagesData.albumId),
          uid_event: event.id,
          type: 'add'
        });
        addAlbum(imagesData.albumId);
      }
      setActiveModal('SUCCESS-MODAL');
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
        header="???????????????????? ????????????????"
        subheader="???????????????????? ?? ?????????????? ??????????????, ?????????? ?????????????? ????????????????"
        actions={
          <ButtonGroup mode='vertical' stretched={true}>
            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => shareHandler(share.repost)}
            >
              ????????????
            </Button>
            {
              user.platform !== 'web' &&
              <Button
                size="m"
                mode="primary"
                stretched={true}
                onClick={() => shareHandler(share.share)}
              >
                ?????????????????? ?? ???????????? ??????????????????
              </Button>
            }

            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => shareHandler(share.story)}
            >
              ???????????????????????? ??????????????
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
        header="???? ???????????????????? ???? ??????????????!"
        subheader="?????????????????? ?? ??????, ?????????? ???????????? ???????????????? ?? ??????????????????????"
        actions={
          <ButtonGroup mode='vertical' stretched={true}>
            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => goToChat()}
            >
              ??????????????
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
        header="???????????????? ??????????????"
        subheader='???? ?????????????????????????? ???????????? ???????????????????? ???? ???????????????'
        actions={
          <ButtonGroup mode='vertical' stretched={true}>
            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => unsubscribe()}
            >
              ???????????????? ??????????????
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
        header="?????????????????? ???????????????????? ?? ??????????????????????"
        actions={
          <ButtonGroup mode='vertical' stretched={true} style={{ alignItems: 'center' }}>
            <FormItem top='?????????????? ???????????? ???? ????????????...' style={{ paddingTop: '0px', paddingBottom: '0px' }} status={albumState} bottom={albumState === 'error' && '???????????? ???????????? ???????? ???? ???????????? ??????????????????'}>
              <Input
                onFocus={() => setAlbumState('default')}
                type="text"
                value={albumUrl}
                onInput={(e) => setAlbumUrl(e.target.value)}
                maxLength={50}
                placeholder='????????????'
              />
            </FormItem>
            <Div style={{ paddingTop: '0px', paddingBottom: '0px' }}>
              <Text>??????...</Text>
            </Div>
            <FormItem style={{ paddingTop: '0px', paddingBottom: '0px' }}>
              <File before={<Icon24Camera role='presentation' />} size='m' accept='image/png, image/gif, image/jpeg' multiple onChange={changeImage}>
                ?????????????????? ????????
              </File>
            </FormItem>
            <Button
              size="m"
              mode="primary"
              stretched={true}
              disabled={!canUploadPhotos}
              onClick={() => sendImages()}
              className='event-upload__send'
            >
              ???????????????? ????????
              {Boolean(usersImages.length) &&
                <Counter style={{marginLeft: '5px'}} size="s" mode="prominent">
                  {usersImages.length}
                </Counter>
              }

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
        header="???????????????????? ??????????????????"
        actions={
          <ButtonGroup mode='vertical' stretched={true}>
            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => setActiveModal(null)}
            >
              ??????????????
            </Button>
          </ButtonGroup>
        }
      >
      </ModalCard>

      <ModalPage
        id='AUTHOR-MODAL'
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        onClose={() => setActiveModal(null)}
        settlingHeight={100}
        header={
          <ModalPageHeader
            before={
              <>
                {(platform === ANDROID || platform === VKCOM) && (
                  <PanelHeaderButton onClick={() => setActiveModal(null)}>
                    <Icon24Cancel />
                  </PanelHeaderButton>
                )}
              </>
            }
            after={
              <>
                {platform === IOS && (
                  <PanelHeaderButton onClick={() => setActiveModal(null)}><Icon24Cancel /></PanelHeaderButton>
                )}
              </>
            }
          >
            ?????????????????? {members?.length}
          </ModalPageHeader>
        }
      >
        <Group>
          {members.sort(m => m.id === user.id ? -1 : 0)?.map((u) => {
            return (
              <SimpleCell
                before={<Avatar src={u.photo_100} />}
                key={u.id}
                after={
                  u.id !== user.id &&
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

      <ModalCard
        id='SUGGEST-MODAL'
        onClose={() => setActiveModal(null)}
        icon={<Icon24PhotosStackOutline width={56} height={56} />}
        style={{ alignItems: 'center' }}
        header="?????????????? ????????????????????"
        subheader='?????????????? ?????????? ???????????????????????? ?????????? ???????????????????????? ??????????????????????????????'
        actions={
          <ButtonGroup mode='vertical' stretched={true}>
            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => groupSuggestAction()}
            >
              ??????????????
            </Button>
          </ButtonGroup>
        }
      >
      </ModalCard>

      <ModalCard
        id='REPORT-MODAL'
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto' }}
        onClose={() => setActiveModal(null)}
        header={
          <ModalPageHeader
            before={
              <>
                {(platform === ANDROID || platform === VKCOM) && (
                  <PanelHeaderButton onClick={() => setActiveModal(null)}>
                    <Icon24Cancel />
                  </PanelHeaderButton>
                )}
              </>
            }
            after={
              <>
                {platform === IOS && (
                  <PanelHeaderButton onClick={() => setActiveModal(null)}><Icon24Cancel /></PanelHeaderButton>
                )}
              </>
            }
          >
            ???????????? ???? {reportUserId ? '????????????????????????' : '??????????????'}
          </ModalPageHeader>
        }
      >
        <Group>
          <FormItem top='?????????????? ????????????'>
            <Textarea maxLength={300} value={reportReason} onChange={(e) => setReportReason(e.target.value)} />
          </FormItem>
          <ButtonGroup mode='vertical' stretched={true} style={{ alignItems: 'center', marginTop: '20px' }}>
            <Button onClick={(e) => sendReport()}>?????????????????? ????????????</Button>
          </ButtonGroup>
        </Group>
      </ModalCard>

      <ModalCard
        id='REPORT-SUCCESS-MODAL'
        onClose={() => setActiveModal(null)}
        icon={<Icon24ReportOutline width={56} height={56} />}
        style={{ alignItems: 'center' }}
        header="???????? ???????????? ???????? ????????????????????"
        actions={
          <ButtonGroup mode='vertical' stretched={true} style={{ alignItems: 'center' }}>
            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => setActiveModal(null)}
            >
              ??????????????
            </Button>
          </ButtonGroup>
        }
      >
      </ModalCard>

    </ModalRoot>
  )

  return (
    <SplitLayout modal={modal} />
  )
};
