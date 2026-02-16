# Руководство по деплою: Timeweb VPS

## 1. Подключение к вашему VPS
Используйте терминал (PowerShell или CMD):
```bash
ssh root@IP_ВАШЕГО_СЕРВЕРА
```

## 2. Установка системных зависимостей
Скопируйте и вставьте этот блок, чтобы установить Node.js, PM2 и **Nginx** (он обязателен для работы домена):
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 20 и Nginx
# Если вы на Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx

# Если вы на CentOS/AlmaLinux:
# sudo dnf install epel-release -y
# sudo dnf install nodejs nginx -y

# Установка PM2 (менеджер процессов)
sudo npm install pm2 -g
```

## 3. Отправка файлов через FileZilla (SFTP)
Поскольку папка `uploads` не находится в Git, её нужно загрузить вручную.

1. Откройте **FileZilla**.
2. Вверху выберите **Файл -> Менеджер сайтов**.
3. Нажмите **Новый сайт** и настройте:
   - **Протокол:** SFTP - SSH File Transfer Protocol
   - **Хост:** `IP_ВАШЕГО_СЕРВЕРА`
   - **Тип входа:** Запросить пароль (или файл ключа, если используете SSH-ключи)
   - **Пользователь:** `root`
4. Подключитесь.
5. В правой части (сервер) перейдите в `/root/ikurganskiy-portfolio/`.
6. Перетащите папку `uploads` из вашего компьютера (слева) в папку проекта на сервере (справа).
7. **Самое важное (База данных):** 
   - На вашем компьютере перейдите в `server/prisma/`.
   - Найдите файл **`dev.db`**.
   - Перетащите его в папку `/root/ikurganskiy-portfolio/server/prisma/` на сервере.
   - *Без этого файла сайт будет пустым, так как все проекты хранятся в нём.*

## 4. Клонирование и сборка проекта (на сервере)
```bash
# Клонирование репозитория
git clone https://github.com/ser6eevich/ikurganskiy-portfolio.git
cd ikurganskiy-portfolio

# Установка зависимостей и сборка фронтенда
npm install
npm run build

# Настройка бэкенда
cd server
npm install
```

## 5. Настройка окружения
Создайте файл `.env` в **корневой** папке проекта:
```bash
cd /root/ikurganskiy-portfolio
nano .env
```
Вставьте ваши переменные:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
TELEGRAM_BOT_TOKEN="ВАШ_ТОКЕН_БОТА"
TELEGRAM_CHAT_ID="ВАШ_CHAT_ID"
```
*(Нажмите Ctrl+O, Enter, Ctrl+X чтобы сохранить)*

## 6. Запуск через PM2
```bash
cd /root/ikurganskiy-portfolio/server
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 7. Подключение домена и SSL (Nginx)
*(Эти команды можно выполнять из любой папки на сервере, они системные)*

1. Сначала **обязательно** создайте папку для конфигурации (чтобы не было ошибки "No such file or directory"):
```bash
sudo mkdir -p /etc/nginx/conf.d/
```

2. Откройте редактор для создания файла:
```bash
sudo nano /etc/nginx/conf.d/portfolio.conf
```

2. Вставьте этот код (замените `ikurganskiy.ru` на ваш домен):
```nginx
server {
    listen 80;
    server_name ikurganskiy.ru www.ikurganskiy.ru;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Проверьте конфиг и перезапустите Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

4. **Установка SSL (HTTPS)**:
```bash
# Для Ubuntu/Debian:
sudo apt install certbot python3-certbot-nginx -y
# Для CentOS/RHEL:
# sudo yum install certbot python3-certbot-nginx -y

sudo certbot --nginx -d ikurganskiy.ru -d www.ikurganskiy.ru
```

### Сайт пустой или не грузятся проекты (localhost error)
Если вы зашли на сайт, а проектов нет — значит фронтенд использует старую сборку с `localhost:5000`. 
Нужно пересобрать проект и перезапустить сервер:

1. Выполните в терминале сервера:
```bash
cd /root/ikurganskiy-portfolio
# Пересборка фронтенда (самое важное!)
npm run build 

# Перезапуск бэкенда через PM2
cd server
pm2 restart all
```

### Проекты появились, но медиа (видео/картинки) не грузятся
Это происходит из-за того, что в вашей базе данных пути к файлам прописаны как `http://localhost:5000/...`. На сервере это не работает.

Я создал специальный скрипт для исправления всех путей в базе. Выполните его на сервере:

1. Перейдите в папку сервера и запустите скрипт:
```bash
cd /root/ikurganskiy-portfolio/server
node fix_db_paths.js
```
2. После этого перезапустите приложение:
```bash
pm2 restart all
```

## 9. Оптимизация и производительность

### Медленная загрузка (3D модель)
В папке `public/models` есть очень тяжелые файлы (например, `keyboard.glb` весит 40МБ). 
1. Я добавил **Loader** (индикатор загрузки), чтобы пользователь видел прогресс.
2. Для ускорения рекомендуется сжать модели через [gltf.report](https://gltf.report/) или заменить их на более легкие.

### Лаги при скролле
Я переделал блок `Portfolio`. Теперь видео не грузятся все сразу, а подгружаются **только при наведении** на карточку. Это убирает тормоза при прокрутке.

## 10. Диагностика домена

Если `ping ikurganskiy.ru` работает, но сайт не открывается:
1. **Проверьте порты**:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw reload
   ```
2. **Проверьте конфиг Nginx**:
   ```bash
   sudo nginx -T | grep server_name
   ```
   Убедитесь, что там прописан ваш домен.
3. **Логи ошибок**:
   ```bash
   sudo tail -n 20 /var/log/nginx/error.log
   ```

## 11. Оптимизация медиа (Уменьшение веса сайта)

Если сайт тормозит из-за тяжелых видео или картинок, их можно сжать прямо на сервере одной командой.

### 1. Установка инструментов
```bash
sudo apt install ffmpeg imagemagick -y
```

### 2. Сжатие всех видео (в папке uploads)
Эта команда уменьшит размер видео (например, с 50МБ до 5-10МБ) без сильной потери качества:
```bash
cd /root/ikurganskiy-portfolio/uploads
# Создаем временную папку
mkdir -p compressed
# Сжимаем все mp4
for f in *.mp4; do ffmpeg -i "$f" -vcodec libx264 -crf 28 "compressed/$f"; done
# Заменяем старые файлы на сжатые
mv compressed/* . && rm -rf compressed
```

### 3. Сжатие всех картинок
Команда уменьшит вес всех JPG/PNG до 80% качества:
```bash
find . -name "*.jpg" -o -name "*.png" | xargs mogrify -resize 1920x1080\> -quality 80
```

### 4. Оптимизация 3D моделей (.glb)
Самый большой файл — клавиатура (40МБ). Для 3D моделей лучше использовать онлайн-сервис:
1. Скачайте модель с сервера через FileZilla.
2. Загрузите на [gltf.report](https://gltf.report/).
3. В меню выберите **Compress -> Draco** или **Simplify**.
4. Замените файл на сервере.

---
**После любых изменений кода** (например, моего исправления `Portfolio.jsx`):
1. `git pull`
2. `npm run build`
3. `pm2 restart all`
