import {getClient, HttpVerb, Body, ResponseType} from "@tauri-apps/api/http";
import {message} from "@tauri-apps/api/dialog";

type Res<T> = {code: number, data: T, msg: string}

class Request{
    baseURL: String;

    constructor(params: {baseURL:string}) {
        this.baseURL = params.baseURL;
    }

    async request<T>(params: {url : string, method: HttpVerb, query?: Record<string, any>, data?: Record<string, any>, headers?: Record<string, any>}){
        const url = params.url || '';
        const method = params.method || 'GET';
        const query = params.query || {};
        const data = params.data || {};
        const headers = params.headers || {};

        const token = localStorage.getItem("token");

        if (token) {
            headers.token = token;
        }

        const withBaseURL = url.indexOf("http") == 0;

        const requestURL = withBaseURL ? url : this.baseURL + url;

        const client = await getClient();

        const response = await client.request<Res<T>>({
            method,
            url: requestURL,
            query,
            body: Body.json(data),
            headers,
            responseType: ResponseType.JSON
        });

        const {code, msg} = response.data;
        if (code == 401) {
            localStorage.removeItem("token");
        } else if (code == 500) {
            await message(msg || "Bad Request", {title: "Tip", type: "error"})
        }

        return response.data;
    }
}

const request = new Request({
    baseURL: import.meta.env.VITE_APP_BASE_URL
})

export default request