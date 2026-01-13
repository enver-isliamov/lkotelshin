
import * as googleService from './googleSheetService';
import * as supabaseService from './supabaseService';
import { ClientData, OrderHistory, MessageTemplate } from '../types';

const STORAGE_KEY = 'admin_data_source_pref';

/**
 * Определяет текущий источник данных.
 * Приоритет:
 * 1. Сохраненная настройка в LocalStorage (если выбрана админом).
 * 2. Переменная окружения REACT_APP_DATA_SOURCE.
 * 3. По умолчанию 'google'.
 */
export const getCurrentDataSource = (): 'google' | 'supabase' => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'supabase' || stored === 'google') {
        return stored;
    }
    return process.env.REACT_APP_DATA_SOURCE === 'supabase' ? 'supabase' : 'google';
};

/**
 * Переключает источник данных и перезагружает страницу для применения изменений.
 */
export const setDataSource = (source: 'google' | 'supabase') => {
    localStorage.setItem(STORAGE_KEY, source);
    window.location.reload();
};

export const fetchAllClients = async (adminChatId: string): Promise<ClientData[]> => {
    if (getCurrentDataSource() === 'supabase') {
        return supabaseService.fetchAllClients();
    }
    return googleService.fetchAllSheetData<ClientData>('WebBase', adminChatId);
};

export const fetchClientByChatId = async (chatId: string): Promise<ClientData[]> => {
    if (getCurrentDataSource() === 'supabase') {
        return supabaseService.fetchClientByChatId(chatId);
    }
    return googleService.fetchSheetDataByChatId<ClientData>('WebBase', chatId);
};

export const fetchAllHistory = async (adminChatId: string): Promise<OrderHistory[]> => {
    if (getCurrentDataSource() === 'supabase') {
        return supabaseService.fetchAllHistory();
    }
    return googleService.fetchAllSheetData<OrderHistory>('Archive', adminChatId);
};

export const fetchHistoryByChatId = async (chatId: string): Promise<OrderHistory[]> => {
     if (getCurrentDataSource() === 'supabase') {
        return supabaseService.fetchHistoryByChatId(chatId);
    }
    return googleService.fetchSheetDataByChatId<OrderHistory>('Archive', chatId);
};

export const fetchTemplates = async (adminChatId: string): Promise<MessageTemplate[]> => {
    if (getCurrentDataSource() === 'supabase') {
        return supabaseService.fetchTemplates();
    }
    return googleService.fetchAllSheetData<MessageTemplate>('Шаблоны сообщений', adminChatId);
};

export const addNewUser = async (chatId: string, phone: string): Promise<{result: string}> => {
    if (getCurrentDataSource() === 'supabase') {
        return supabaseService.addNewUser(chatId, phone);
    }
    return googleService.addNewUser(chatId, phone);
};

export const fetchConfig = async (): Promise<{ [key: string]: any }> => {
    if (getCurrentDataSource() === 'supabase') {
        return supabaseService.fetchConfig();
    }
    return googleService.fetchConfig();
};

export const updateConfig = async (key: string, value: any): Promise<{result: string}> => {
     if (getCurrentDataSource() === 'supabase') {
        return supabaseService.updateConfig(key, value);
    }
    return googleService.updateConfig(key, value);
};

export const sendMessage = async (chatId: string, text: string): Promise<{result: string}> => {
     if (getCurrentDataSource() === 'supabase') {
        return supabaseService.sendMessageFromBot(chatId, text);
    }
    return googleService.sendMessageFromBot(chatId, text);
};
