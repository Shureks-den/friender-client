import { IStructure } from 'react-router-vkminiapps-updated';

export const ViewTypes = {
  MAIN: 'MAIN',
  ADDNEW: 'ADDNEW',
  PROFILE: 'PROFILE',
  EVENT: 'EVENT'
};

export const PanelTypes = {
  MAIN_HOME: 'MAIN_HOME',
  ADDNEW: 'ADDNEW',
  PROFILE: 'PROFILE',
  EVENT: 'EVENT'
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
  }
];
