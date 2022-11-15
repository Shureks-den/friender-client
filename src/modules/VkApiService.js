import bridge from '@vkontakte/vk-bridge';
import ApiSevice from './ApiSevice';

class VkApiService {
  constructor() { }

  async fetchUserData(id = 0) {
    const user = await bridge.send('VKWebAppGetUserInfo', id ? { user_id: id } : {});
    const { platform } = await bridge.send('VKWebAppGetClientVersion');
    user.platform = platform;
    return user;
  }

  async getSessionInfo() {
    const response = await bridge.send('VKWebAppGetLaunchParams');
    console.log(response);
    return response;
  }

  async getUserToken(scope = '') {
    const { access_token } = await bridge.send('VKWebAppGetAuthToken', {
      app_id: 51441556,
      scope: scope,
    });
    return access_token;
  }

  async fetchGroupData(id) {
    return await bridge.send('VKWebAppGetGroupInfo', {
      group_id: id,
    });
  }

  scrollToTop() {
    return bridge.send("VKWebAppScroll", { "top": 1, "speed": 600 });
  }

  async setNewLocation(location) {
    const response = await bridge.send('VKWebAppSetLocation', { location });
    return response;
  }

  async repost(eventId, eventTitle, eventAvatar) {
    const response = await bridge.send('VKWebAppShowWallPostBox', {
      message: `Ищу компанию для ${eventTitle}, присоединяйтесь!`,
      attachments:
        `photo${eventAvatar},
        https://vk.com/app51441556#event?id=${eventId}`
    });
    return response;
  }

  async share(eventId) {
    const response = await bridge.send('VKWebAppShare', {
      link: `https://vk.com/app51441556#event?id=${eventId}`
    });
    return response;
  }

  async getPlatform() {
    return (await bridge.send("VKWebAppGetClientVersion")).platform;
  }

  updateConfigWatcher(callback) {
    bridge.subscribe(({ detail: { type, data } }) => {
      if (type === 'VKWebAppUpdateConfig') {
        callback(data.scheme);
      }
    });
  }

  async addToGroup(userId) {
    const { group_id } = await bridge.send("VKWebAppAddToCommunity");
    await ApiSevice.post('group/create', {
      group_id: Number(group_id),
      user_id: userId,
    });
    return group_id;
  }

  async getUsersInfo(ids, token) {
    const { response } = await bridge.send('VKWebAppCallAPIMethod', {
      method: 'users.get',
      params: {
        user_ids: ids,
        fields: 'photo_200, photo_100',
        v: '5.131',
        access_token: token
      }
    });
    return response;
  }

  async getGroupsInfo(ids, token) {
    if (!ids) return [];
    const { response } = await bridge.send('VKWebAppCallAPIMethod', {
      method: 'groups.getById',
      params: {
        group_ids: ids,
        fields: 'photo_200, photo_100',
        v: '5.131',
        access_token: token
      }
    });
    return response;
  }

  async sendImages(images, title, token) {
    const {response} = await bridge.send('VKWebAppCallAPIMethod', {
      method: 'photos.createAlbum',
      params: {
        title: title,
        v: '5.131',
        access_token: token
      }
    });
    console.log(response);
    const url = await this.getPhotoUploadServer(response.id, token);
    const formData = new FormData();
    images.forEach((img, idx) => {
      formData.append(`photo${idx + 1}`, img);
    });
    console.log(url);
    const uploadResponse = await ApiSevice.postImageVK(url, formData);
    console.log(uploadResponse);
    return url;
  }

  async getPhotoUploadServer(albumId, token) {
    const {response} = await bridge.send('VKWebAppCallAPIMethod', {
      method: 'photos.getUploadServer',
      params: {
        album_id: Number(albumId),
        v: '5.131',
        access_token: token
      }
    });
    const {upload_url} = response
    return upload_url;
  }

  async checkPermissions() {
    const response = await bridge.send('VKWebAppGetGrantedPermissions');
    return response;
  }


  async postStory(eventId, eventTitle, eventAvatar) {
    const platform = await this.getPlatform();

    const background = {
      "background_type": "image",
      "url": platform !== 'web' ?
        eventAvatar :
        'https://images.unsplash.com/photo-1585314062604-1a357de8b000?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=4142&q=80',
    };

    await bridge.send("VKWebAppShowStoryBox", {
      ...background,
      "attachment": {
        "text": "open",
        "type": "url",
        "url": `https://vk.com/app51441556#event?id=${eventId}`
      },
      "stickers": [
        {
          "sticker_type": "native",
          "sticker": {
            "can_delete": 0,
            "transform": {
              "gravity": "center_bottom",
              "translation_y": -0.2,
            },
            "action_type": "text",
            "action": {
              "text": `Ищу компанию для "${eventTitle}"`
            }
          }
        },
        {
          "sticker_type": "native",
          "sticker": {
            "can_delete": 0,
            "transform": {
              "gravity": "center_top",
              "translation_y": 0.1,
            },
            "action_type": "text",
            "action": {
              "text": "#Friender"
            }
          }
        }
      ],
    });
  }
}

export default new VkApiService();
