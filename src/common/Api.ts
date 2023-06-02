import request from './Request'

export const login = (params: Record<string, any>) => {
    return request.request<string>({
        url:'/login',
        method: 'POST',
        data: params,
    })
}

export const getUserInfo = <T>() => {
    return request.request<T>({
        url: '/getUserInfo',
        method: 'GET',
    })
}

export const getUserList = () => {
    return request.request<Record<string, any>[]>({
        url: '/getUserList',
        method: 'GET',
    })
}

