const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

type RequestOptions = {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    token?: string | null;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, token } = options;

    const defaultHeaders: Record<string, string> = {};

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    if (body && !(body instanceof URLSearchParams)) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
        method,
        headers: { ...defaultHeaders, ...headers },
        body: body instanceof URLSearchParams ? body : (body ? JSON.stringify(body) : undefined),
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorData = {};
        try {
            errorData = JSON.parse(errorText);
        } catch (e) {
            errorData = { message: errorText || 'Unknown error' };
        }
        throw { status: response.status, ...errorData };
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
}

export const api = {
    auth: {
        login: (data: URLSearchParams) => request<any>('/token', {
            method: 'POST',
            body: data,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }),
        register: (data: any) => request<any>('/users/register', { method: 'POST', body: data }),
        me: (token: string) => request<any>('/users/me', { token }),
        update: (userId: string | number | null | undefined, data: any, token: string) => {
            const target = (userId && userId !== 'undefined' && userId !== 'null') ? userId : 'me';
            return request<any>(`/users/${target}`, { method: 'PATCH', body: data, token });
        },
    },
    projects: {
        list: (token: string) => request<any[]>('/projects', { token }),
        create: (data: any, token: string) => request<any>('/projects', { method: 'POST', body: data, token }),
        getTasks: (projectId: number | string, token: string) => request<any[]>(`/projects/${projectId}/tasks`, { token }),
        getSprints: (projectId: number | string, token: string) => request<any[]>(`/projects/${projectId}/sprints`, { token }),
        addMember: (projectId: number | string, userId: string, role: string, token: string) =>
            request<any>(`/projects/${projectId}/users/${userId}?role=${role}`, { method: 'POST', token }),
        createSprint: (data: any, token: string) =>
            request<any>(`/projects/sprints`, { method: 'POST', body: data, token }),
        activateSprint: (projectId: number | string, sprintId: number | string, token: string) =>
            request<any>(`/projects/${projectId}/sprints/${sprintId}/activate`, { method: 'POST', token }),
        delete: (projectId: number | string, token: string) =>
            request<any>(`/projects/epics/${projectId}`, { method: 'DELETE', token }),
    },
    tasks: {
        create: (data: any, token: string) => request<any>('/projects/tasks', { method: 'POST', body: data, token }),
        update: (taskId: number | string, data: any, token: string) => request<any>(`/projects/tasks/${taskId}`, { method: 'PATCH', body: data, token }),
        delete: (taskId: number | string, token: string) => request<any>(`/projects/tasks/${taskId}`, { method: 'DELETE', token }),
    },
    users: {
        list: (token: string) => request<any[]>('/users', { token }),
    },
    agent: {
        getChats: (token: string) => request<any[]>('/agents/chats', { token }),
        getHistory: (threadId: string, token: string) => request<any[]>(`/agents/chats/${threadId}/history`, { token }),
        sendMessage: (data: any, token: string) => request<any>('/agents/run', { method: 'POST', body: data, token }),
        deleteChat: (chatId: number | string, token: string) => request<any>(`/agents/chats/${chatId}`, { method: 'DELETE', token }),
    }
};
