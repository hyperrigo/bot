
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Инициализируем бота
const token = process.env.BOT_TOKEN;
const correctPassword = process.env.BOT_PASSWORD;

const bot = new TelegramBot(token, { polling: true });

// Хранилище для пользователей, которые начали ввод
const waitingForPassword = {};

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Сообщаем, что нужно ввести пароль
    bot.sendMessage(chatId, "Введите пароль:");
    waitingForPassword[chatId] = true;
});

// Обработка текстовых сообщений (ввод пароля)
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (!waitingForPassword[chatId]) return; // Если не ждём пароль — игнорируем

    const userPassword = msg.text.trim(); // Убираем лишние пробелы

    if (userPassword === correctPassword) {
        bot.sendMessage(chatId, "✅ Доступ разрешён. Заявки будут приходить вам.");

        // Отправляем chat_id в Google Sheets
        fetch(process.env.SHEET_URL_SAVE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'save_chat_id', chat_id: chatId })
        });

        delete waitingForPassword[chatId]; // Больше не ожидаем пароль
    } else {
        bot.sendMessage(chatId, "❌ Неверный пароль. Попробуйте снова.");
    }
});
