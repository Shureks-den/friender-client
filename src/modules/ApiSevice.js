class ApiService {
  constructor() { };

  #hostUrl = 'https://vkevents.tk'
  
  #userId = '';

  async getAll(url, params) {
    let generatedUrl = url + '?';
    for (const key in params) {
      generatedUrl += `${key}=${params[key]}&`;
    }
    const finalUrl = generatedUrl.slice(0, -1);
    const response = await fetch(`${this.#hostUrl}/${finalUrl}`, {
      method: 'GET',
      headers: {
        'X-User-ID': this.#userId,
      },
    });

    const data = await response.json();
    return data;
  }

  async get(url, id) {
    const response = await fetch(`${this.#hostUrl}/${url}/${id}`, {
      method: 'GET',
      headers: {
        'X-User-ID': this.#userId,
      },
    });
    return await response.json();
  }

  async post(url, data) {
    const response = await fetch(`${this.#hostUrl}/${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': this.#userId,
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }

  async delete(url, id) {
    const response = await fetch(`${this.#hostUrl}/${url}/${id}`, {
      method: 'DELETE',
      headers: {
        'X-User-ID': this.#userId,
      },
    });
    return await response.json();
  }

  async put(url, data) {
    const response = await fetch(`${this.#hostUrl}/${url}`, {
      method: 'PUT',
      headers: {
        'X-User-ID': this.#userId,
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  async postImage(url, id, formData) {
    const response = await fetch(`${this.#hostUrl}/${url}/${id}`, {
      method: 'POST',
      headers: {
        'X-User-ID': this.#userId,
      },
      body: formData
    });
    return await response.json();
  }

  setHeaderId(id) {
    this.#userId = id;
  }
}

export default new ApiService();
