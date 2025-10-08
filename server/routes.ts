import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getSheetData } from "./google-sheets";
import { cache } from "./cache";
import { getTelegramUserIdFromRequest, isAdmin } from "./telegram-auth";
import { Client, ArchiveOrder, fieldVisibilitySchema } from "@shared/schema";

function parseSheetRow(row: string[]): any {
  return {
    chatId: row[0] || '',
    name: row[1] || '',
    phone: row[2] || '',
    carNumber: row[3] || '',
    orderQr: row[4] || '',
    pricePerMonth: row[5] || '',
    tireCount: row[6] || '',
    hasRims: row[7] || '',
    startDate: row[8] || '',
    duration: row[9] || '',
    reminder: row[10] || '',
    endDate: row[11] || '',
    storageLocation: row[12] || '',
    cell: row[13] || '',
    totalAmount: row[14] || '',
    debt: row[15] || '',
    contract: row[16] || '',
    clientAddress: row[17] || '',
    dealStatus: row[18] || '',
    trafficSource: row[19] || '',
    dotCode: row[20] || '',
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/client', async (req, res) => {
    try {
      const telegramUserId = getTelegramUserIdFromRequest(req);
      
      if (!telegramUserId) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing Telegram authentication' });
      }

      const cacheKey = `client:${telegramUserId}`;
      const cached = cache.get<Client>(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const rows = await getSheetData('WebBase');
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No data found' });
      }

      const clientRow = rows.slice(1).find(row => row[0] === telegramUserId);
      
      if (!clientRow) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const client = parseSheetRow(clientRow);
      cache.set(cacheKey, client);
      
      res.json(client);
    } catch (error) {
      console.error('Error fetching client data:', error);
      res.status(500).json({ error: 'Failed to fetch client data' });
    }
  });

  app.get('/api/archive', async (req, res) => {
    try {
      const telegramUserId = getTelegramUserIdFromRequest(req);
      
      if (!telegramUserId) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing Telegram authentication' });
      }

      const cacheKey = `archive:${telegramUserId}`;
      const cached = cache.get<ArchiveOrder[]>(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const rows = await getSheetData('Archive');
      
      if (rows.length === 0) {
        return res.json([]);
      }

      const archiveOrders = rows
        .slice(1)
        .filter(row => row[0] === telegramUserId)
        .map(row => parseSheetRow(row));
      
      cache.set(cacheKey, archiveOrders);
      
      res.json(archiveOrders);
    } catch (error) {
      console.error('Error fetching archive data:', error);
      res.status(500).json({ error: 'Failed to fetch archive data' });
    }
  });

  app.get('/api/field-visibility', async (req, res) => {
    try {
      const fieldVisibility = await storage.getFieldVisibility();
      res.json(fieldVisibility);
    } catch (error) {
      console.error('Error fetching field visibility:', error);
      res.status(500).json({ error: 'Failed to fetch field visibility settings' });
    }
  });

  app.post('/api/field-visibility', async (req, res) => {
    try {
      const telegramUserId = getTelegramUserIdFromRequest(req);
      
      if (!telegramUserId) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing Telegram authentication' });
      }

      if (!isAdmin(telegramUserId)) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      const result = fieldVisibilitySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid field visibility data', details: result.error });
      }

      const updatedSettings = await storage.updateFieldVisibility(result.data);
      
      cache.clear();
      
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating field visibility:', error);
      res.status(500).json({ error: 'Failed to update field visibility settings' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
