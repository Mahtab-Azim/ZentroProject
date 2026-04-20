export const MOCK_DATA = {
    auth: {
        access_token: 'mock_access_token_12345',
        refresh_token: 'mock_refresh_token_67890',
        token_type: 'bearer'
    },
    user: {
        id: '1',
        email: 'user@example.com',
        username: 'Demo User',
        full_name: 'Demo Account',
        role: 'user',
        is_active: true
    },
    projects: [
        {
            id: 1,
            title: 'Project Alpha',
            description: 'A cutting-edge web application for monitoring.',
            owner_id: '1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: 'owner'
        },
        {
            id: 2,
            title: 'Mobile App Beta',
            description: 'Redesigning the mobile experience for customers.',
            owner_id: '2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: 'editor'
        }
    ],
    tasks: {
        1: [ // Tasks for Project 1
            {
                id: 101,
                title: 'Design Dashboard',
                description: 'Create high-fidelity mockups for main dashboard.',
                status: 'in_progress',
                priority: 'high',
                assignee_id: '1',
                sprint_id: 201
            },
            {
                id: 102,
                title: 'Implement Auth',
                description: 'Setup JWT authentication flow.',
                status: 'done',
                priority: 'critical',
                assignee_id: '1',
                sprint_id: 201
            },
            {
                id: 103,
                title: 'User Testing',
                description: 'Conduct interviews with 5 users.',
                status: 'todo',
                priority: 'medium',
                assignee_id: null,
                sprint_id: null
            }
        ],
        2: [ // Tasks for Project 2
            {
                id: 201,
                title: 'Setup React Native',
                description: 'Initialize project repo.',
                status: 'done',
                priority: 'high',
                assignee_id: '1',
                sprint_id: 202
            }
        ]
    },
    sprints: {
        1: [ // Sprints for Project 1
            {
                id: 201,
                name: 'Sprint 1',
                description: 'Foundation work',
                start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active'
            },
            {
                id: 202,
                name: 'Sprint 2',
                description: 'Feature implementation',
                start_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'planned'
            }
        ],
        2: []
    },
    chats: [
        {
            id: 'c1',
            title: 'Project Ideas',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ],
    chatHistory: {
        'c1': [
            { role: 'user', content: 'Help me plan a marketing strategy.' },
            { role: 'assistant', content: 'Sure! lets start by defining your target audience.' }
        ]
    }
};

export const mockResponse = async <T>(data: T, delay = 500): Promise<T> => {
    return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};
