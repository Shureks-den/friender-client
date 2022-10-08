class ApiService {
    constructor();

    #hostUrl = '37.139.33.76';

    async getAll(url, params) {
        let generatedUrl = url + '?';
        for (const key in params) {
            generatedUrl += `${key}=${params[key]}&`;
        }
        const finalUrl = generatedUrl.slice(0, -1);
        const response = await fetch(`${this.#hostUrl}/${finalUrl}}`, {
            method: 'GET',
        });
        return await response.json();
    }

    async get(url, id) {
        const response = await fetch(`${this.#hostUrl}/${url}/${id}`, {
            method: 'GET',
        });
        return await response.json();
    }

    async post(url, data) {
        const response = await fetch(`${this.#hostUrl}/${url}`, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(data),
        });
        return await response.json();
    }

    async delete(url, id) {
        const response = await fetch(`${this.#hostUrl}/${url}/${id}`, {
            method: 'DELETE',
        });
        return await response.json();
    }

    async put(url, data) {
        const response = await fetch(`${this.#hostUrl}/${url}`, {
            method: 'PUT',
            mode: 'cors',
            body: JSON.stringify(data),
        });
        return await response.json();
    }
}