# POS

## describe

this is backend server for POS website porject

## API Endpoints

### users

| Method | Endpoint      | Description                             | Request Fields     |
| ------ | ------------- | --------------------------------------- | ------------------ |
| POST   | /user/        | create user                             | username, password |
| POST   | /user/login   | log in                                  | username, password |
| POST   | /user/logout  | log out                                 | None               |
| POST   | /user/refresh | get new access token from refresh token | None               |
| GET    | /user/manager | test role access                        | None               |

### product

| Method | Endpoint                 | Description                                                                                    | Request Fields                                               |
| ------ | ------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| POST   | /product/create          | create product                                                                                 | name, author, price, barcode, quantity, category             |
| GET    | /product/getproducts?    | limit = how many product in one page, sort = order by and sortOrder = asc(1to100) desc(100to1) | query ?page=<number>&limit=<number> optional sort, sortOrder |
| GET    | /product/get/:barcode    | get product from barcode using for sale page                                                   | None                                                         |
| GET    | /product/information/:id | get product information by id use in product information                                       | None                                                         |

### category

| Method | Endpoint         | Description     | Request Fields |
| ------ | ---------------- | --------------- | -------------- |
| POST   | /category/create | create category | name           |

### stock

| Method | Endpoint      | Description       | Request Fields                                                |
| ------ | ------------- | ----------------- | ------------------------------------------------------------- |
| POST   | /stock/create | create stock      | product, transactionType, quantity <br> optional: costPerUnit |
| GET    | /stock/get    | get stock history | page, limit, <br> search,date                                 |

### promotion

| Method | Endpoint          | Description      | Request Fields                                                                               |
| ------ | ----------------- | ---------------- | -------------------------------------------------------------------------------------------- |
| POST   | /promotion/create | create promotion | startDate, endDate, discountType, discountValue, product <br> optional: remainingQuota, name |
| GET    | /promotion/get    | get promotion    | None                                                                                         |

### order

| Method | Endpoint      | Description                    | Request Fields                                           |
| ------ | ------------- | ------------------------------ | -------------------------------------------------------- |
| POST   | /order/create | create oder using in sale page | orderLists: [{ productId, price, quantity}], total_price |
| GET    | /order/get    | get order lists                | limit, page optional: search, date                       |
