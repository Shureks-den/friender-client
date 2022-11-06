
import React, { useEffect, useState, useRef } from 'react';
import { Icon56ShareOutline } from '@vkontakte/icons';

import { ModalCard, Button, ModalRoot, SplitLayout, ButtonGroup } from '@vkontakte/vkui';

export const ShareModal = ({ activeModal, setActiveModal, share }) => {
  useEffect(() => console.log(share), [share])
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
            <Button
              size="m"
              mode="primary"
              stretched={true}
              onClick={() => share.share()}
            >
              Отправить в личном сообщении
            </Button>
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
    </ModalRoot>
  )

  return (
    <SplitLayout modal={modal} />
  )
};
