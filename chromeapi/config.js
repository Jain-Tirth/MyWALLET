const API_CONFIG = {
    BASE_URL: 'http://localhost:5000',
    ENDPOINTS: {
        AUTH: {
            REGISTER: '/api/auth/register',
            LOGIN: '/api/auth/login'
        },
        TOKENS: {
            CREATE: '/api/tokens',
            LIST: '/api/tokens'
        },
        ACCOUNTS: {
            CREATE: '/api/accounts',
            LIST: '/api/accounts'
        }
    }
};

module.exports = API_CONFIG; 