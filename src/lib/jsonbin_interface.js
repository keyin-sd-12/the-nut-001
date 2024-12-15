// functions to interface with JSONbin.io
const X_ACCESS_API_KEY =
  "$2a$10$lCF9Tkt8IirfyGjM5MYuEegORbNt2IzoKOQltKgMH8nCSrFpQVAM6";
const BASE_URL = "https://api.jsonbin.io/v3/b";

const ACCOUNTS_BIN_ID = "6755b89aad19ca34f8d7ad78";
const ACCOUNTS_BIN_DATA_NAME = "nut_accounts";
const ACCOUNTS_BIN_URL = `${BASE_URL}/${ACCOUNTS_BIN_ID}`;
const CATEGORIES_BIN_ID = "6755006aad19ca34f8d762a7";
const CATEGORIES_BIN_DATA_NAME = "nut_store";
const CATEGORIES_BIN_URL = `${BASE_URL}/${CATEGORIES_BIN_ID}`;
const PRODUCTS_BIN_ID = "6754ff3cad19ca34f8d7623a";
const PRODUCTS_BIN_DATA_NAME = "nut_store_products";
const PRODUCTS_BIN_URL = `${BASE_URL}/${PRODUCTS_BIN_ID}`;
const PRODUCT_QTY_BIN_ID = "67550806e41b4d34e461aa21";
const PRODUCT_QTY_BIN_DATA_NAME = "nut_store_prod_qty";
const PRODUCT_QTY_BIN_URL = `${BASE_URL}/${PRODUCT_QTY_BIN_ID}`;
const ORDERS_BIN_ID = "67550977ad19ca34f8d7659c";
const ORDERS_BIN_DATA_NAME = "nut_orders";
const ORDERS_BIN_URL = `${BASE_URL}/${ORDERS_BIN_ID}`;

const ACCOUNT_ALREADY_EXISTS = "Account already exists";
const ACCOUNTS_NOT_LOADED = "Accounts not loaded";
const ACCOUNT_NOT_FOUND = "Account not found";
const ACCOUNT_NOT_ADDED = "Account not saved";
const ACCOUNT_NOT_UPDATED = "Account not udpated";
const ORDERS_NOT_LOADED = "Orders not loaded";
const ORDER_NOT_ADDED = "Order not saved";
const PRODUCT_QTY_CANNOT_BE_LOADED = "Product quantities cannot be loaded";
const PRODUCT_QTY_NOT_UPDATED = "New product quantity not saved";
const CATEGORIES_CANNOT_BE_LOADED = "Store categories cannot be loaded";
const PRODUCTS_CANNOT_BE_LOADED = "Store products cannot be loaded";
const PRODUCT_NOT_FOUND = "Product not found";

// add a timeout to fetch requests, so in case of an error, website doesn't "think" forever
async function fetch_with_timeout(url, options, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Request timed out")),
      timeout
    );
    fetch(url, options)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

// fetch JSONBin with timeout
async function fetch_json(
  json_url,
  json_object_name,
  custom_error_message,
  timeout = 5000
) {
  try {
    const response = await fetch_with_timeout(
      `${json_url}/latest`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Access-Key": X_ACCESS_API_KEY,
        },
      },
      timeout
    );

    if (!response.ok) {
      // console.error(response.statusText);
      // throw new Error(`${custom_error_message}: ${response.statusText}`);
      throw new Error(`${custom_error_message}`);
    }

    const data = await response.json();
    return data.record[json_object_name] || [];
  } catch (error) {
    console.error(custom_error_message, error);
    throw error;
  }
}

async function update_json(
  json_url,
  json_object_name,
  updated_data,
  custom_error_message,
  timeout = 5000
) {
  try {
    const response = await fetch_with_timeout(
      `${json_url}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Access-Key": X_ACCESS_API_KEY,
        },
        // theoretically, we could update only the changed data, but JSONBin doesn't support partial updates, we "PUT" the whole object
        body: JSON.stringify({ [json_object_name]: updated_data }),
      },
      timeout
    );

    if (!response.ok) {
      throw new Error(`${custom_error_message}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// fetch existing accounts from JSONBin
async function fetch_accounts(timeout = 5000) {
  return await fetch_json(
    ACCOUNTS_BIN_URL,
    ACCOUNTS_BIN_DATA_NAME,
    ACCOUNTS_NOT_LOADED,
    timeout
  );
}

async function fetch_account(account_login, timeout = 5000) {
  try {
    const accounts = await fetch_accounts(timeout);

    // find the account with the given login
    const account = accounts.find((acc) => acc.account_login === account_login);
    if (!account) {
      throw new Error(ACCOUNT_NOT_FOUND);
    }

    // return the found account
    return account;
  } catch (error) {
    console.error(`${ACCOUNT_NOT_FOUND}: ${account_login}`, error.message);
    throw error;
  }
}

async function fetch_account_by_id(account_id, timeout = 5000) {
  try {
    const accounts = await fetch_accounts(timeout);

    // find the account with the given login
    const account = accounts.find((acc) => acc.account_id === account_id);
    if (!account) {
      throw new Error(ACCOUNT_NOT_FOUND);
    }

    // return the found account
    return account;
  } catch (error) {
    console.error(`${ACCOUNT_NOT_FOUND}: ${account_id}`, error.message);
    throw error;
  }
}

// fetch categories from JSONBin
async function fetch_categories(timeout = 5000) {
  return await fetch_json(
    CATEGORIES_BIN_URL,
    CATEGORIES_BIN_DATA_NAME,
    CATEGORIES_CANNOT_BE_LOADED,
    timeout
  );
}

// fetch products from JSONBin
async function fetch_products(timeout = 5000) {
  return await fetch_json(
    PRODUCTS_BIN_URL,
    PRODUCTS_BIN_DATA_NAME,
    PRODUCTS_CANNOT_BE_LOADED,
    timeout
  );
}

// fetch product quantities from JSONBin
async function fetch_product_qty(timeout = 5000) {
  return await fetch_json(
    PRODUCT_QTY_BIN_URL,
    PRODUCT_QTY_BIN_DATA_NAME,
    PRODUCT_QTY_CANNOT_BE_LOADED,
    timeout
  );
}

// fetch orders from JSONBin
async function fetch_orders(timeout = 5000) {
  return await fetch_json(
    ORDERS_BIN_URL,
    ORDERS_BIN_DATA_NAME,
    ORDERS_NOT_LOADED,
    timeout
  );
}

// add a new account to JSONBin with timeout
async function add_account(account, timeout = 5000) {
  try {
    // fetch the existing accounts
    const existing_accounts = await fetch_accounts(timeout);

    // check if the email already exists
    if (
      existing_accounts.some(
        (acc) => acc.account_login === account.account_login
      )
    ) {
      throw new Error(ACCOUNT_ALREADY_EXISTS);
    }

    // add the new account
    const updated_accounts = [...existing_accounts, account];

    // update the bin with the new account list
    return await update_json(
      ACCOUNTS_BIN_URL,
      ACCOUNTS_BIN_DATA_NAME,
      updated_accounts,
      ACCOUNT_NOT_ADDED,
      timeout
    );
  } catch (error) {
    console.error(ACCOUNT_NOT_ADDED, error);
    throw error;
  }
}

async function update_account(account_login, updated_data, timeout = 5000) {
  try {
    // fetch the existing accounts
    const existing_accounts = await fetch_accounts(timeout);

    // find the account to update
    const account_index = existing_accounts.findIndex(
      (acc) => acc.account_login === account_login
    );
    if (account_index === -1) {
      throw new Error(ACCOUNT_NOT_FOUND);
    }

    // update the account with the new data
    const updated_accounts = [...existing_accounts];
    updated_accounts[account_index] = {
      ...existing_accounts[account_index],
      ...updated_data,
      account_last_updated: new Date().toISOString(),
    };

    // update the bin with the new account list
    return await update_json(
      ACCOUNTS_BIN_URL,
      ACCOUNTS_BIN_DATA_NAME,
      updated_accounts,
      ACCOUNT_NOT_UPDATED,
      timeout
    );
  } catch (error) {
    console.error(ACCOUNT_NOT_UPDATED, error.message);
    throw error;
  }
}

async function update_account_by_id(account_id, updated_data, timeout = 5000) {
  try {
    // fetch the existing accounts
    const existing_accounts = await fetch_accounts(timeout);

    // find the account to update
    const account_index = existing_accounts.findIndex(
      (acc) => acc.account_id === account_id
    );
    if (account_index === -1) {
      throw new Error(ACCOUNT_NOT_FOUND);
    }

    // update the account with the new data
    const updated_accounts = [...existing_accounts];
    updated_accounts[account_index] = {
      ...existing_accounts[account_index],
      ...updated_data,
      account_last_updated: new Date().toISOString(),
    };

    // update the bin with the new account list
    return await update_json(
      ACCOUNTS_BIN_URL,
      ACCOUNTS_BIN_DATA_NAME,
      updated_accounts,
      ACCOUNT_NOT_UPDATED,
      timeout
    );
  } catch (error) {
    console.error(ACCOUNT_NOT_UPDATED, error.message);
    throw error;
  }
}

// add new order to JSONBin with timeout
async function add_order(order, timeout = 5000) {
  try {
    // fetch the existing orders
    const existing_orders = await fetch_orders(timeout);

    // add new order
    const updated_orders = [...existing_orders, order];

    // update the bin with the new order list
    return await update_json(
      ORDERS_BIN_URL,
      ORDERS_BIN_DATA_NAME,
      updated_orders,
      ORDER_NOT_ADDED,
      timeout
    );
  } catch (error) {
    console.error(ORDER_NOT_ADDED, error);
    throw error;
  }
}

// update product quantities in JSONBin
async function update_prod_qty(product_id, new_qty, timeout = 5000) {
  try {
    // fetch the existing product quantities
    const existing_product_qty = await fetch_product_qty(timeout);

    // find the product to update
    const product_index = existing_product_qty.findIndex(
      (prod) => prod.product_id === product_id
    );
    if (product_index === -1) {
      throw new Error(PRODUCT_NOT_FOUND);
    }

    // update the product quantity
    const updated_product_qty = [...existing_product_qty];
    updated_product_qty[product_index] = {
      ...existing_product_qty[product_index],
      quantity: new_qty,
    };

    // update the bin with the new product quantities
    return await update_json(
      PRODUCT_QTY_BIN_URL,
      PRODUCT_QTY_BIN_DATA_NAME,
      updated_product_qty,
      PRODUCT_QTY_NOT_UPDATED,
      timeout
    );
  } catch (error) {
    console.error(PRODUCT_QTY_NOT_UPDATED, error);
    throw error;
  }
}

async function update_all_prod_qty(new_qtys, timeout = 5000) {
  try {
    console.log("Updating all product quantities in JSONBin...");
    // use update_json to overwrite the entire bin with the new quantities
    return await update_json(
      PRODUCT_QTY_BIN_URL,
      PRODUCT_QTY_BIN_DATA_NAME,
      new_qtys,
      PRODUCT_QTY_NOT_UPDATED,
      timeout
    );
  } catch (error) {
    console.error(PRODUCT_QTY_NOT_UPDATED, error);
    throw error;
  }
}

export {
  fetch_accounts,
  fetch_account,
  fetch_account_by_id,
  add_account,
  update_account,
  update_account_by_id,
  fetch_orders,
  add_order,
  fetch_categories,
  fetch_products,
  fetch_product_qty,
  update_prod_qty,
  update_all_prod_qty,
};
