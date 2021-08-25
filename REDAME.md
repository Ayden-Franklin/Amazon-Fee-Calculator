# About Test Calc
1. create .env at /test/calc/.env


        PUPPETEER_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
        PIPELINES_API=http://localhost:3002
        PRODUCT_COUNTRY=us
        PRODUCT_ASIN=B08QRR73ZJ
        PUPPETEER_HEADLESS=false

2. draw char 

    [use AnyChart NodeJS module requires ImageMagick and librsvg](https://github.com/AnyChart/AnyChart-NodeJS#download-and-install)

3. run

        npm run test-calc