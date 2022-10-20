import bridge from '@vkontakte/vk-bridge';

class VkApiService {
  constructor() { }

  async fetchUserData(id = 0) {
    const user = await bridge.send('VKWebAppGetUserInfo', id ? { user_id: id } : {});
    return user;
  }

  async setNewLocation(location) {
    const response = await bridge.send('VKWebAppSetLocation', { location });
    return response;
  }

  async repost(eventId, eventTitle, eventAvatar) {
    console.log(eventAvatar)
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

  async postStory(eventId, eventTitle, eventAvatar) {
    console.log(eventAvatar, eventId, eventTitle)
    await bridge.send("VKWebAppShowStoryBox", {
      "background_type": "image",
      "url": eventAvatar,
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
                "gravity": "center_bottom"
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
                "gravity": "center_top"
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
