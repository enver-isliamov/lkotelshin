import WebApp from '@twa-dev/sdk';

export const telegram = WebApp;

export function initTelegramApp() {
  telegram.ready();
  telegram.expand();
  
  // Set theme based on Telegram color scheme
  if (telegram.colorScheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function getTelegramUser() {
  return telegram.initDataUnsafe?.user;
}

export function getTelegramChatId(): string | null {
  const user = getTelegramUser();
  return user?.id?.toString() || null;
}

export function closeTelegramApp() {
  telegram.close();
}

export function showTelegramAlert(message: string) {
  telegram.showAlert(message);
}

export function showTelegramConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    telegram.showConfirm(message, resolve);
  });
}
