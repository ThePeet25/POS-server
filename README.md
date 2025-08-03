# POS

## describe
this is backend server for POS website porject

## API Endpoints
### users
Method | Endpoint | Description | Request Fields
---- | ---- | ---- | ---- |
POST | /user/ | create user | username, password |
POST | /user/login | log in | username, password |
POST | /user/logout | log out | None |
GET | /user/manager | test role acess | None |
### product
Method | Endpoint | Description | Request Fields
---- | ---- | ---- | ---- |
POST | /product/create | create product | name, author, price, barcode, quantity, category |
GET | /product/getprodcuts? | limit = how many prodcut in one page, sort = order by and sortOrder = asc(1to100) desc(100to1)  | query ?page=<number>&limit=<number> optional sort, sortOrder |
POST | /category/create | create category | name |
### category
Method | Endpoint | Description | Request Fields
---- | ---- | ---- | ---- |
POST | /category/create | create category | name |
### stock 
Method | Endpoint | Description | Request Fields
---- | ---- | ---- | ---- |
POST | /stock/create | create stock | product, transactionType, quantity <br> optional: costPerUnit |
### promotion
Method | Endpoint | Description | Request Fields
---- | ---- | ---- | ---- |
POST | /promotion/create | create promotion | startDate, endDate, discountType, discountValue, product <br> optional: remainingQuota, name |