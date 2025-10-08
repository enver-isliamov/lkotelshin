import { createHmac } from 'crypto';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface ValidatedTelegramData {
  user: TelegramUser;
  auth_date: number;
  hash: string;
}

/**
 * Validates Telegram Web App init data according to official documentation
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramWebAppData(initData: string): ValidatedTelegramData | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return null;
  }

  try {
    // Parse init data
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      return null;
    }

    // Remove hash from params and sort alphabetically
    params.delete('hash');
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key using bot token
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Verify hash
    if (calculatedHash !== hash) {
      console.error('Telegram init data hash validation failed');
      return null;
    }

    // Check auth_date (data should be recent - within 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - authDate;
    
    // 24 hours = 86400 seconds
    if (timeDiff > 86400) {
      console.error('Telegram init data expired');
      return null;
    }

    // Parse user data
    const userParam = params.get('user');
    if (!userParam) {
      return null;
    }

    const user: TelegramUser = JSON.parse(userParam);

    return {
      user,
      auth_date: authDate,
      hash,
    };
  } catch (error) {
    console.error('Error validating Telegram init data:', error);
    return null;
  }
}

export function getTelegramUserIdFromRequest(req: any): string | null {
  const initData = req.headers['x-telegram-init-data'];
  
  if (!initData) {
    return null;
  }

  const validated = validateTelegramWebAppData(initData);
  
  if (!validated) {
    return null;
  }

  return validated.user.id.toString();
}

export function isAdmin(userId: string | null): boolean {
  if (!userId) {
    return false;
  }

  const adminChatId = process.env.ADMIN_CHAT_ID;
  return userId === adminChatId;
}
