// Centralized API calls for frontend
const BASE_URL = '/api';

export const api = {
    // Products
    getProducts: async () => {
        const res = await fetch(`${BASE_URL}/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
    },

    // User
    getUser: async () => {
        const res = await fetch(`${BASE_URL}/user`);
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
    },
    updateUser: async (userData) => {
        const res = await fetch(`${BASE_URL}/user`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!res.ok) throw new Error('Failed to update user');
        return res.json();
    },

    // Favorites
    getFavorites: async () => {
        const res = await fetch(`${BASE_URL}/favorites`);
        if (!res.ok) throw new Error('Failed to fetch favorites');
        return res.json();
    },
    createFavorite: async (title, image, product_ids = []) => {
        const res = await fetch(`${BASE_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, image, product_ids }),
        });
        if (!res.ok) throw new Error('Failed to create favorite');
        return res.json();
    },
    addFavoriteItem: async (favoriteId, productId) => {
        const res = await fetch(`${BASE_URL}/favorites/${favoriteId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId }),
        });
        if (!res.ok) throw new Error('Failed to add favorite item');
        return res.json();
    },
    removeFavoriteItem: async (favoriteId, productId) => {
        const res = await fetch(`${BASE_URL}/favorites/${favoriteId}/items/${productId}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to remove favorite item');
        return res.json();
    },
    deleteFavorite: async (favoriteId) => {
        const res = await fetch(`${BASE_URL}/favorites/${favoriteId}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete favorite');
        return res.json();
    },

    // Chat
    getChatHistory: async () => {
        const res = await fetch(`${BASE_URL}/chat`);
        if (!res.ok) throw new Error('Failed to fetch chat history');
        return res.json();
    },
    sendChatMessage: async (messageData) => {
        const res = await fetch(`${BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData),
        });
        if (!res.ok) throw new Error('Failed to send chat message');
        return res.json();
    }
};
