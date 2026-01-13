
import { supabase } from './supabaseClient';
import { ClientData, OrderHistory, MessageTemplate } from '../types';

// Helper to map DB columns (snake_case) to App types (Russian keys usually)
// Явное приведение к String гарантирует соответствие интерфейсу ClientData
const mapClientFromDB = (data: any): ClientData => ({
    'Chat ID': String(data.chat_id || ''),
    'Имя клиента': String(data.name || ''),
    'Телефон': String(data.phone || ''),
    'Номер Авто': String(data.car_number || ''),
    'Заказ - QR': String(data.qr_code || ''),
    'Бренд_Модель': String(data.brand_model || ''),
    'Цена за месяц': String(data.price_month || ''),
    'Кол-во шин': String(data.tire_count || ''),
    'Наличие дисков': String(data.has_disks || ''),
    'Начало': String(data.date_start || ''),
    'Срок': String(data.storage_period || ''),
    'Напомнить': String(data.remind_date || ''),
    'Окончание': String(data.date_end || ''),
    'Склад хранения': String(data.warehouse || ''),
    'Ячейка': String(data.cell || ''),
    'Общая сумма': String(data.total_amount || ''),
    'Долг': String(data.debt || ''),
    'Договор': String(data.contract_number || ''),
    'Адрес клиента': String(data.address || ''),
    'Статус сделки': String(data.status || ''),
    'Источник трафика': String(data.traffic_source || ''),
    'DOT CODE': String(data.dot_code || ''),
    'Размер шин': String(data.tire_size || ''),
    'Сезон': String(data.season || '')
});

const mapHistoryFromDB = (data: any): OrderHistory => ({
    'Chat ID': String(data.chat_id || ''),
    'Дата': String(data.date || ''),
    'Услуга': String(data.service || ''),
    'Сумма': String(data.amount || ''),
    'Статус': String(data.status || '')
});

const mapTemplateFromDB = (data: any): MessageTemplate => ({
    title: String(data.title || ''),
    text: String(data.text || '')
});

export const fetchAllClients = async (): Promise<ClientData[]> => {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw new Error(error.message);
    return (data || []).map(mapClientFromDB);
};

export const fetchClientByChatId = async (chatId: string): Promise<ClientData[]> => {
    const { data, error } = await supabase.from('clients').select('*').eq('chat_id', chatId);
    if (error) throw new Error(error.message);
    return (data || []).map(mapClientFromDB);
};

export const fetchAllHistory = async (): Promise<OrderHistory[]> => {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) throw new Error(error.message);
    return (data || []).map(mapHistoryFromDB);
};

export const fetchHistoryByChatId = async (chatId: string): Promise<OrderHistory[]> => {
    const { data, error } = await supabase.from('orders').select('*').eq('chat_id', chatId);
    if (error) throw new Error(error.message);
    return (data || []).map(mapHistoryFromDB);
};

export const fetchTemplates = async (): Promise<MessageTemplate[]> => {
     const { data, error } = await supabase.from('templates').select('*');
     if (error) throw new Error(error.message);
     return (data || []).map(mapTemplateFromDB);
}

export const addNewUser = async (chatId: string, phone: string): Promise<{result: string}> => {
    // Check if exists
    const { data: existing } = await supabase.from('clients').select('id').eq('chat_id', chatId).single();
    if (existing) {
        return { result: 'exists' };
    }

    const { error } = await supabase.from('clients').insert([{
        chat_id: chatId,
        phone: phone,
        name: 'Новый клиент',
        status: 'Ожидает обработки',
        traffic_source: 'Новая заявка'
    }]);

    if (error) throw new Error(error.message);
    return { result: 'success' };
};

export const fetchConfig = async (): Promise<{ [key: string]: any }> => {
    const { data, error } = await supabase.from('config').select('*');
    if (error) return {};
    
    const config: {[key: string]: any} = {};
    data?.forEach((row: any) => {
        config[row.key] = row.value;
    });
    return config;
};

export const updateConfig = async (key: string, value: any): Promise<{result: string}> => {
    const { error } = await supabase.from('config').upsert({ key, value });
    if (error) throw new Error(error.message);
    return { result: 'success' };
};

export const sendMessageFromBot = async (chatId: string, text: string): Promise<{result: string}> => {
    console.warn("Direct Telegram sending via Supabase requires Edge Functions. Feature disabled in this basic implementation.");
    return { result: 'success' }; 
}
