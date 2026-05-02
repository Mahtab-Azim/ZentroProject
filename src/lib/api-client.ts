import { MOCK_DATA, mockResponse } from './mock-data';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.NEXT_PUBLIC_USE_MOCK_API === '1';

type RequestOptions = {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    token?: string | null;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, token } = options;

    if (USE_MOCK_API) {
        console.log(`[MOCK API] ${method} ${endpoint}`);

        await new Promise(resolve => setTimeout(resolve, 600));

        // Mock Route Matching
        if (endpoint === '/token' || endpoint === '/users/register') {
            return MOCK_DATA.auth as any;
        }
        if (endpoint === '/users/me' || endpoint.startsWith('/users/')) {
            return MOCK_DATA.user as any;
        }
        if (endpoint === '/auth/forgot-password' && method === 'POST') {
            return { message: 'Password reset link sent to email' } as any;
        }
        if (endpoint === '/projects' && method === 'GET') {
            return MOCK_DATA.projects as any;
        }
        if (endpoint === '/projects' && method === 'POST') {
            return { id: Math.floor(Math.random() * 1000), ...body, status: 'active' } as any;
        }
        if (endpoint.match(/^\/projects\/\d+\/tasks$/)) {
            const projectId = endpoint.split('/')[2];
            return (MOCK_DATA.tasks as any)[projectId] || [] as any;
        }
        if (endpoint === '/projects/tasks' && method === 'POST') {
            return { id: Math.floor(Math.random() * 1000), ...body } as any;
        }
        if (endpoint.match(/^\/projects\/\d+\/sprints$/)) {
            const projectId = endpoint.split('/')[2];
            return (MOCK_DATA.sprints as any)[projectId] || [] as any;
        }
        if (endpoint === '/projects/sprints' && method === 'POST') {
            return { id: Math.floor(Math.random() * 1000), ...body } as any;
        }
        if (endpoint === '/agents/chats' && method === 'GET') {
            return MOCK_DATA.chats as any;
        }
        if (endpoint.match(/^\/agents\/chats\/.*?\/history$/)) {
            const chatId = endpoint.split('/')[3];
            return (MOCK_DATA.chatHistory as any)[chatId] || [] as any;
        }
        if (endpoint === '/agents/run' && method === 'POST') {
            return { content: `MOCK AI Response to: ${body?.message || ''}` } as any;
        }

        return {} as T;
    }

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
        forgotPassword: (data: any) => request<any>('/auth/forgot-password', { method: 'POST', body: data }),
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
