import { IStructure } from 'react-router-vkminiapps-updated';

export const ViewTypes = {
  MAIN: 'MAIN',
  ADDNEW: 'ADDNEW',
  PROFILE: 'PROFILE',
  EVENT: 'EVENT',
  GROUP: 'GROUP',
  CHATS: 'CHATS',
};

export const PanelTypes = {
  MAIN_HOME: 'MAIN_HOME',
  ADDNEW: 'ADDNEW',
  PROFILE: 'PROFILE',
  EVENT: 'EVENT',
  GROUP: 'GROUP',
  CHATS: 'CHATS',
};

export const structure = [
  {
    id: ViewTypes.MAIN,
    hash: '',
    panels: [
      {
        id: PanelTypes.MAIN_HOME,
        hash: 'events'
      }
    ]
  },
  {
    id: ViewTypes.ADDNEW,
    hash: '',
    panels: [
      {
        id: PanelTypes.ADDNEW,
        hash: 'newEvent'
      }
    ]
  },
  {
    id: ViewTypes.PROFILE,
    hash: '',
    panels: [
      {
        id: PanelTypes.PROFILE,
        hash: 'profile'
      }
    ]
  },
  {
    id: ViewTypes.EVENT,
    hash: '',
    panels: [
      {
        id: PanelTypes.EVENT,
        hash: 'event'
      }
    ]
  },
  {
    id: ViewTypes.GROUP,
    hash: '',
    panels: [
      {
        id: PanelTypes.GROUP,
        hash: 'group'
      }
    ]
  },
  {
    id: ViewTypes.CHATS,
    hash: '',
    panels: [
      {
        id: PanelTypes.CHATS,
        hash: 'chats'
      }
    ]
  },
];
