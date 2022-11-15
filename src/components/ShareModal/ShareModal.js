
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Icon56ShareOutline, Icon56MessagesOutline } from '@vkontakte/icons';
import { Icon56ArrowUturnLeftOutline } from '@vkontakte/icons';

import { ModalCard, Button, ModalRoot, SplitLayout, ButtonGroup } from '@vkontakte/vkui';

export const ShareModal = ({ activeModal, setActiveModal, share, goToChat, unsubscribe }) => {
  const user = useSelector(state => state.user.value);

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
    </ModalRoot>
  )

  return (
    <SplitLayout modal={modal} />
  )
};
