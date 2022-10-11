class ApiService {
  constructor () {};

  #hostUrl = 'https://vkevents.tk'

  async getAll (url, params) {
    let generatedUrl = url + '?'
    for (const key in params) {
      generatedUrl += `${key}=${params[key]}&`
    }
    const finalUrl = generatedUrl.slice(0, -1)
    const response = await fetch(`${this.#hostUrl}/${finalUrl}`, {
      method: 'GET'
    })

    const data = await response.json()
    return data
  }

  async get (url, id) {
    const response = await fetch(`${this.#hostUrl}/${url}/${id}`, {
      method: 'GET'
    })
    return await response.json()
  }

  async post (url, data) {
    const response = await fetch(`${this.#hostUrl}/${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return await response.json()
  }

  async delete (url, id) {
    const response = await fetch(`${this.#hostUrl}/${url}/${id}`, {
      method: 'DELETE'
    })
    return await response.json()
  }

  async put (url, data) {
    const response = await fetch(`${this.#hostUrl}/${url}`, {
      method: 'PUT',

      body: JSON.stringify(data)
    })
    return await response.json()
  }

  async postImage (url, id, formData) {
    const response = await fetch(`${this.#hostUrl}/${url}/${id}`, {
      method: 'POST',
      body: formData
    })
    return await response.json()
  }
}

export default new ApiService()
