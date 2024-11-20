FROM python:3.9-slim

RUN apt-get update && \
    apt-get install -y \
    chromium \
    chromium-driver \ 
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libgbm1 \
    libnss3 \
    libxss1 \
    xdg-utils \
    libgconf-2-4 \
    libx11-xcb1 \
    libxi6 \
    libatk1.0-0 \
    libgtk-3-0 \
    libxrandr2 \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/chromium \
CHROME_DRIVER=/usr/bin/chromedriver
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "-u", "cookiemonster.py"]