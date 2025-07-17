# POS

## describe
this is backend server for POS website porject

## API Endpoints
Method | Endpoint | Description | Request Fields
---- | ---- | ---- | ---- |
POST | /user/ | create user | username, password |
POST | /user/login | log in | username, password |
POST | /user/logout | log out | None |
GET | /user/manager | test role acess | None |
POST | /category/create | create category | name |
POST | /product/create | create product | name, author, price, barcode, quantity, category |