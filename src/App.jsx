import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  fetch_categories,
  fetch_products,
  fetch_product_qty,
  fetch_account_by_id,
  update_all_prod_qty,
  add_order,
} from "./lib/jsonbin_interface.js";

import Header from "./components/Header";
import Nav from "./components/Nav";
// import Loading from "./components/Loading";
import Error from "./components/Error";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Store from "./components/Store";
import Category from "./components/Category";
import ProductDetails from "./components/ProductDetails";
import Account from "./components/Account";
import Login from "./components/Login";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderProcessing from "./components/OrderProcessing";

const MAX_CART_ITEMS = 99;
const FREE_SHIPPING_THRESHOLD = 200.0;
const FLAT_SHIPPING_RATE = 20.0;

function App() {
  const [is_order_processing_allowed, set_is_order_processing_allowed] =
    useState(false);
  const [is_busy, set_is_busy] = useState(false);
  const [store_was_fetched, set_store_was_fetched] = useState(false);
  const [login_state, set_logged_in] = useState({
    is_logged_in: false,
    address_entered: false,
    customer_id: "-1",
    customer_login: "",
    login_time: "",
  });
  const [user_data, set_user_data] = useState({});
  const [cart_count, set_cart_count] = useState(0);
  const [initiate_store_fetch, set_initiate_store_fetch] = useState(false);

  const [shopping_cart, set_shopping_cart] = useState({
    time_last_updated: "",
    items: [],
  });

  const [cart_updated_during_fetch, set_cart_updated_during_fetch] =
    useState(undefined);

  const [cart_validated, set_cart_validated] = useState(false);

  const [destination_province, set_destination_province] = useState("");

  const [totals, set_totals] = useState({
    subtotal: 0.0,
    tax: 0.0,
    subtotal_plus_tax: 0.0,
    shipping: 0.0,
    order_total: 0.0,
  });

  const [error_message, set_error_message] = useState([]);
  const [store_data, set_store_data] = useState({
    categories: [],
    products: [],
    product_quantities: [],
  });

  useEffect(() => {
    console.log("is_busy state change:", is_busy);
  }, [is_busy]);

  function add_error_message(error_message) {
    set_error_message((prev_messages) => {
      const updated_messages = [...prev_messages, error_message];

      // set timeout to remove 1st message after 10 seconds
      setTimeout(() => {
        set_error_message((current_messages) => current_messages.slice(1));
      }, 10000);

      return updated_messages;
    });
  }

  function calculate_total_cart_quantity(cart) {
    return cart.items.reduce(
      (total, item) => total + parseInt(item.quantity, 10),
      0
    );
  }

  function calculate_totals(shopping_cart, destination_province) {
    const provinces = [
      { province: "AB", tax_percent: 5.0 }, // Alberta (GST)
      { province: "BC", tax_percent: 12.0 }, // British Columbia (GST + PST)
      { province: "MB", tax_percent: 12.0 }, // Manitoba (GST + PST)
      { province: "NB", tax_percent: 15.0 }, // New Brunswick (HST)
      { province: "NL", tax_percent: 15.0 }, // Newfoundland and Labrador (HST)
      { province: "NS", tax_percent: 15.0 }, // Nova Scotia (HST)
      { province: "ON", tax_percent: 13.0 }, // Ontario (HST)
      { province: "PE", tax_percent: 15.0 }, // Prince Edward Island (HST)
      { province: "QC", tax_percent: 14.975 }, // Quebec (GST + QST)
      { province: "SK", tax_percent: 11.0 }, // Saskatchewan (GST + PST)
      { province: "NT", tax_percent: 5.0 }, // Northwest Territories (GST)
      { province: "NU", tax_percent: 5.0 }, // Nunavut (GST)
      { province: "YT", tax_percent: 5.0 }, // Yukon (GST)
    ];

    // use 0.0 tax rate if destination_province is empty (hasn't been set yet)
    const tax_rate = destination_province
      ? provinces.find(
          (prov) => prov.province === destination_province.toUpperCase()
        )?.tax_percent || 0.0
      : 0.0;

    const subtotal = shopping_cart.items.reduce((sum, cart_item) => {
      return sum + cart_item.quantity * cart_item.price;
    }, 0);

    const tax = parseFloat(((subtotal * tax_rate) / 100).toFixed(2));
    const subtotal_plus_tax = parseFloat((subtotal + tax).toFixed(2));
    const shipping =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
    const order_total = parseFloat((subtotal + tax + shipping).toFixed(2));

    return {
      subtotal,
      tax,
      subtotal_plus_tax,
      shipping,
      order_total,
    };
  }

  useEffect(() => {
    console.log("/////shopping cart state change:", shopping_cart);
    const total_cart_quantity = calculate_total_cart_quantity(shopping_cart);
    set_cart_count(total_cart_quantity);
    if (store_was_fetched) {
      sessionStorage.setItem("shopping_cart", JSON.stringify(shopping_cart));
      console.log(
        "Cart Saved to Session Storage, Cart count updated to: ",
        total_cart_quantity
      );
      console.log(sessionStorage.getItem("shopping_cart"));
    }
    const updated_totals = calculate_totals(
      shopping_cart,
      destination_province
    );
    set_totals(updated_totals);
  }, [shopping_cart]);

  useEffect(() => {
    console.log("-LOGIN state change:", login_state);

    if (login_state.is_logged_in) {
      console.log(
        "-LOGIN state User just logged in: ",
        user_data.account_login
      );
      sessionStorage.setItem("logged_in", JSON.stringify(true));
      sessionStorage.setItem(
        "customer_id",
        JSON.stringify(user_data.account_id)
      );

      console.log("CHECK USER DATA ***User data shipping added: ", user_data);
      // check here
      if (user_data.shipping_added === "true") {
        console.log("Shipping flag for address in user data is 'true'");
        sessionStorage.setItem(
          "saved_address",
          JSON.stringify(user_data.account_address)
        );
      }
      return; // exit early if the user is logged in
    }

    // restoration from sessionStorage
    let saved_customer_id = sessionStorage.getItem("customer_id");
    saved_customer_id = saved_customer_id && JSON.parse(saved_customer_id);

    if (!saved_customer_id || saved_customer_id === "-1") {
      console.log("Guest user detected. Skipping account restoration.");
      sessionStorage.setItem("customer_id", "-1");
      sessionStorage.setItem("logged_in", JSON.stringify(false));
      sessionStorage.setItem(
        "saved_address",
        JSON.stringify({
          first_name: "",
          last_name: "",
          address_line_1: "",
          address_line_2: "",
          city_name: "",
          province_name: "",
          postal_code: "",
          telephone_number: "",
          email: "",
        })
      );
      set_logged_in({
        is_logged_in: false,
        address_entered: false,
        customer_id: "-1",
        customer_login: "",
        login_time: "",
      });
      // exit here to prevent fetching for "-1"
      return;
    }

    // console.log("Restoring login state for customer ID:", saved_customer_id);

    // fetch account details only if customer_id is valid and not "-1"
    const restore_user_data = async () => {
      set_is_busy(true);
      try {
        const account = await fetch_account_by_id(saved_customer_id);
        console.log("Restored account data:", account);

        set_logged_in({
          is_logged_in: true,
          address_entered: account.shipping_added === "true",
          customer_id: account.account_id,
          customer_login: account.account_login,
          login_time: new Date().toISOString(),
        });
        set_user_data(account);
        set_is_busy(false);
      } catch (error) {
        set_is_busy(false);
        console.error("Error restoring account data:", error);
        sessionStorage.setItem("customer_id", "-1");
        sessionStorage.setItem("logged_in", JSON.stringify(false));
      }
    };

    // if not -1 (guest account)
    if (JSON.stringify(saved_customer_id) !== "-1") {
      console.log("Restoring account data... for ID ", saved_customer_id);
      restore_user_data();
    }
  }, [login_state]);

  useEffect(() => {
    if (login_state.is_logged_in) {
      console.log(
        "LOGGED USER address state change, saving new address to session storage: ",
        user_data.account_address
      );
      if (user_data.shipping_added === "true") {
        sessionStorage.setItem(
          "saved_address",
          JSON.stringify(user_data.account_address)
        );
      }
    }
  }, [user_data.account_address]);

  useEffect(() => {
    console.log("error_message_state_variable: ", error_message);
  }, [error_message]);

  function update_cart(action, product) {
    let old_cart_snapshot = {};

    // modify_cart function, if store quantities have changed
    function modify_cart(prev_cart, action, product) {
      console.log("old_cart (in cart): ", prev_cart);
      old_cart_snapshot = JSON.parse(JSON.stringify(prev_cart)); // copy

      if (action === "empty") {
        return {
          ...prev_cart,
          time_last_updated: new Date().toISOString(),
          items: [],
        };
      }

      const total_cart_quantity = calculate_total_cart_quantity(prev_cart);
      console.log(
        "total_cart_quantity before add/decrease (in cart): ",
        total_cart_quantity
      );

      // check if the item we are adding or changing already exists in the cart
      const existing_item_index = prev_cart.items.findIndex(
        (item) => item.product_id === product.product_id
      );

      const updated_items = [...prev_cart.items];

      // find current available quantity of the product
      const product_quantity = store_data.product_quantities.find(
        (qty) => qty.product_id === product.product_id
      );
      const available_quantity_int = product_quantity
        ? parseInt(product_quantity.quantity_avail, 10)
        : 0;

      switch (action) {
        case "plus": {
          const max_addable_int = Math.min(
            available_quantity_int,
            MAX_CART_ITEMS - total_cart_quantity
          );

          if (existing_item_index !== -1) {
            const current_quantity =
              updated_items[existing_item_index].quantity;
            if (max_addable_int > 0)
              updated_items[existing_item_index].quantity =
                current_quantity + 1;
          } else {
            if (max_addable_int > 0) {
              updated_items.push({
                product_id: product.product_id,
                category_id: product.category_id,
                quantity: 1,
                price: product.price_per_can,
              });
            }
          }
          break;
        }

        case "minus": {
          if (existing_item_index !== -1) {
            const current_quantity =
              updated_items[existing_item_index].quantity;
            updated_items[existing_item_index].quantity = Math.max(
              1,
              current_quantity - 1
            );
          }
          break;
        }

        case "remove": {
          if (existing_item_index !== -1) {
            updated_items.splice(existing_item_index, 1);
          }
          break;
        }

        default:
          break;
      }

      return {
        ...prev_cart,
        time_last_updated: new Date().toISOString(),
        items: updated_items,
      };
    }

    // update shopping_cart
    set_shopping_cart((prev_cart) => {
      const updated_cart = modify_cart(prev_cart, action, product);

      // update store_data based on updated_cart
      set_store_data((prev_store_data) => {
        const updated_product_quantities =
          prev_store_data.product_quantities.map((product_quantity) => {
            const product_id = product_quantity.product_id;

            // find old cart quantity for the product_id
            const old_cart_item = old_cart_snapshot.items.find(
              (item) => item.product_id === product_id
            );
            const old_cart_quantity = old_cart_item
              ? old_cart_item.quantity
              : 0;

            // find updated cart quantity
            const new_cart_item = updated_cart.items.find(
              (item) => item.product_id === product_id
            );
            const new_cart_quantity = new_cart_item
              ? new_cart_item.quantity
              : 0;

            // update the available quantity
            const updated_quantity_avail =
              parseInt(product_quantity.quantity_avail, 10) +
              old_cart_quantity -
              new_cart_quantity;

            // ensure >=0
            return {
              ...product_quantity,
              quantity_avail: Math.max(0, updated_quantity_avail),
            };
          });

        return {
          ...prev_store_data,
          product_quantities: updated_product_quantities,
        };
      });
      // this is updated cart
      return updated_cart;
    });
  }

  async function fetch_store() {
    // initialize state variables
    set_cart_validated(false);
    set_cart_updated_during_fetch(undefined);
    set_store_was_fetched(false);
    set_is_busy(true);

    let categories = [];
    let products = [];
    let product_quantities = [];

    try {
      // categories
      try {
        categories = await fetch_categories();
      } catch (error) {
        const error_message = `ERROR: ${error.message || "Unknown error"}`;
        console.error(error_message);
        add_error_message(error_message);
      }

      // products
      try {
        products = await fetch_products();
      } catch (error) {
        const error_message = `ERROR: ${error.message || "Unknown error"}`;
        console.error(error_message);
        add_error_message(error_message);
      }

      // product quantities
      try {
        product_quantities = await fetch_product_qty();
      } catch (error) {
        const error_message = `ERROR: ${error.message || "Unknown error"}`;
        console.error(error_message);
        add_error_message(error_message);
      }

      // update store data if successful
      if (categories.length && products.length && product_quantities.length) {
        set_store_data({ categories, products, product_quantities });
        set_store_was_fetched(true);
        set_is_busy(false);
        return true;
      } else {
        console.error("Incomplete store data fetched.");
        add_error_message("Error: Incomplete store data fetched.");
        return false;
      }
    } catch (error) {
      console.error("Unexpected error in update_store:", error.message);
      add_error_message(`Unexpected error: ${error.message}`);
    } finally {
      set_is_busy(false);
    }
  }

  useEffect(() => {
    fetch_store();
  }, []);

  useEffect(() => {
    if (initiate_store_fetch) {
      set_initiate_store_fetch(false);
      fetch_store();
    }
  }, [initiate_store_fetch]);

  useEffect(() => {
    console.log("Store loaded from JSONbin: ", store_was_fetched);

    if (!store_was_fetched) {
      // set_is_busy(false);
      return;
    }

    // set_is_busy(true);
    console.log("*************Validating cart after store load...");
    let cart_changed = false;

    // check the cart in session storage
    const saved_cart = JSON.parse(sessionStorage.getItem("shopping_cart"));
    // console.warn(
    //   "Saved cart from session storage: ",
    //   JSON.stringify(saved_cart)
    // );

    if (saved_cart) {
      set_is_busy(true);
      const validated_items = saved_cart.items.filter((cart_item) => {
        const product = store_data.products.find(
          (prod) => prod.product_id === cart_item.product_id
        );
        const product_quantity = store_data.product_quantities.find(
          (qty) => qty.product_id === cart_item.product_id
        );

        if (
          !product ||
          !product_quantity ||
          product_quantity.quantity_avail <= 0
        ) {
          // remove invalid products
          cart_changed = true;
          return false;
        }

        // if cart quantity exceeds store availability
        if (
          parseInt(cart_item.quantity, 10) >
          parseInt(product_quantity.quantity_avail, 10)
        ) {
          cart_item.quantity = parseInt(product_quantity.quantity_avail, 10);
          cart_changed = true;
        }

        // update price
        cart_item.price = product.price_per_can;

        return true;
      });

      // adjust store data quantities
      const adjusted_product_quantities = store_data.product_quantities.map(
        (item) => {
          const cart_item = validated_items.find(
            (cart_prod) => cart_prod.product_id === item.product_id
          );
          if (cart_item) {
            return {
              ...item,
              quantity_avail: Math.max(
                0,
                parseInt(item.quantity_avail, 10) -
                  parseInt(cart_item.quantity, 10)
              ),
            };
          }
          return item;
        }
      );

      // update shopping cart state
      set_shopping_cart({
        time_last_updated: new Date().toISOString(),
        items: validated_items,
      });

      // update store data with adjusted quantities
      set_store_data((prev_store_data) => ({
        ...prev_store_data,
        product_quantities: adjusted_product_quantities,
      }));

      set_cart_updated_during_fetch(cart_changed);
      if (sessionStorage.getItem("order_started") === "true") {
        console.log(
          "<<<<< from validation setting cart changed to: ",
          cart_changed
        );
        sessionStorage.setItem("cart_changed", JSON.stringify(cart_changed));
        console.log("we set it!!!:", sessionStorage.getItem("cart_changed"));
      }

      console.log("Cart validated and quantities adjusted:", validated_items);
      set_cart_validated(true);
      set_is_busy(false);
    }
  }, [store_was_fetched]);

  function group_and_sort_cart(store_data, shopping_cart) {
    const grouped_cart = [];

    store_data.categories.forEach((category) => {
      const items_in_category = shopping_cart.items
        .filter((cart_item) => {
          const product = store_data.products.find(
            (prod) => prod.product_id === cart_item.product_id
          );
          return product && product.category_id === category.cat_id;
        })
        .map((cart_item) => {
          const product = store_data.products.find(
            (prod) => prod.product_id === cart_item.product_id
          );

          const total_price = parseFloat(cart_item.quantity * cart_item.price);

          return {
            product_id: cart_item.product_id,
            category_id: product.category_id,
            name: product.prod_short_name,
            price: parseFloat(cart_item.price.toFixed(2)),
            qty: cart_item.quantity,
            total: parseFloat(total_price.toFixed(2)),
          };
        });

      if (items_in_category.length > 0) {
        grouped_cart.push({
          category_title: category.cat_short_name,
          description: category.cat_short_description,
          items: items_in_category,
        });
      }
    });

    return grouped_cart;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function wait_if_cart_changed(timeout = 20000, interval = 100) {
    const start_time = Date.now();
    while (true) {
      const cart_update_status = sessionStorage.getItem("cart_changed");
      console.log(
        ")000))- LOOP reading from session stro cart_update_status: ",
        cart_update_status
      );
      if (cart_update_status !== null) {
        console.log(
          "Cart update status found in sessionStorage:",
          cart_update_status
        );
        return JSON.parse(cart_update_status);
      }
      if (Date.now() - start_time > timeout) {
        throw new Error("Cart update status check timed out.");
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  function normalize_quantities_to_strings(quantities) {
    return quantities.map((item) => ({
      ...item,
      quantity_avail: String(item.quantity_avail),
    }));
  }

  function normalize_quantities_to_numbers(product_quantities) {
    return product_quantities.map((product) => ({
      ...product,
      quantity_avail: parseInt(product.quantity_avail, 10),
    }));
  }

  function generate_order_id() {
    const random_digit = Math.floor(1 + Math.random() * 9);
    let date_part = Date.now().toString();

    while (date_part.length < 13) {
      date_part += Math.floor(1 + Math.random() * 9);
    }

    return `${random_digit}-${date_part}`;
  }

  async function place_order(address, credit_card) {
    const place_order_status = {
      status: "success",
      order_id: "",
      order_date: "",
      customer_address: "",
      order_details: [],
      order_totals: {},
    };

    set_is_busy(true);
    console.log("Setting local storage order_started to true");
    // sessionStorage.setItem("order_started", "true");
    // sessionStorage.removeItem("cart_changed");

    try {
      console.log("Starting order processing...");
      console.log("CHECKOUT - Waiting for store data to renew...");
      const store_fetch_success = await fetch_store();
      console.log("WAIT ENDED CHECKOUT - Store data fetched successfully.");

      if (!store_fetch_success) {
        console.error(
          "CHECKOUT - Error fetching store data. Redirecting to cart."
        );
        place_order_status.status = "process_error";
        return place_order_status;
      }

      set_is_busy(true);
      console.log(" -()---- STARTING WAITING FOR CART VALIDATION");
      const cart_change_status = await wait_if_cart_changed();
      console.log(" -()---- Cart validation complete", cart_change_status);

      sessionStorage.removeItem("order_started");
      sessionStorage.removeItem("cart_changed");

      if (cart_change_status) {
        console.error(
          "CHECKOUT - Cart quantities changed during checkout. Redirecting..."
        );
        place_order_status.status = "qty_error";
        console.log("returning qty_error");
        return place_order_status;
      }
      console.log("Uploading updated product quantities to JSONBin...");
      console.log(
        "store_data.product_quantities: ",
        store_data.product_quantities
      );
      const grouped_cart = group_and_sort_cart(store_data, shopping_cart);
      const order_totals = calculate_totals(
        shopping_cart,
        destination_province
      );
      // const grouped_cart_snapshot = JSON.stringify(grouped_cart);
      // const order_totals_snapshot = JSON.stringify(order_totals);
      // const cart_count_copy = cart_count;
      const order_id = generate_order_id();
      const order_date = new Date().toISOString();
      const customer_id =
        JSON.parse(sessionStorage.getItem("customer_id")) || "-1";
      console.log("<<<>>>> Customer ID from sessionStorage: ", customer_id);

      const sanitized_credit_card = {
        name_on_card: credit_card.name_on_card,
        last_four: credit_card.card_number.slice(-4),
        expiration_date: credit_card.expiration_date,
      };

      set_is_busy(true);
      const new_order = {
        order_id,
        account_id: customer_id,
        order_items: grouped_cart,
        customer_address: address,
        order_items_count: parseInt(cart_count, 10),
        order_subtotal: parseFloat(order_totals.subtotal.toFixed(2)),
        order_tax: parseFloat(order_totals.tax.toFixed(2)),
        order_ship_charge: parseFloat(order_totals.shipping.toFixed(2)),
        order_total: parseFloat(order_totals.order_total.toFixed(2)),
        order_payment: sanitized_credit_card,
        order_created: order_date,
      };

      console.log("New Order Object: ", new_order);

      const normalized_qtys = normalize_quantities_to_numbers(
        store_data.product_quantities
      );
      try {
        await update_all_prod_qty(normalized_qtys);
        console.log("Product quantities successfully updated in JSONBin.");
      } catch (error) {
        console.error("Failed to update product quantities in JSONBin:", error);
        place_order_status.status = "qty_update_error";
        return place_order_status;
      }

      try {
        await add_order(new_order);
        console.log("Order successfully added to JSONBin.");
        console.log("PLACE ORDER: ", new_order);
      } catch (error) {
        console.error("Failed to add order to JSONBin:", error);
        place_order_status.status = "order_save_error";
        return place_order_status;
      }

      const order_date_local = new Date(
        new_order.order_created
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });

      place_order_status.order_id = new_order.order_id;
      place_order_status.order_date = order_date_local;
      place_order_status.customer_address = new_order.customer_address;
      place_order_status.order_details = new_order.order_items;
      place_order_status.order_items_count = new_order.order_items_count;
      place_order_status.order_totals = {
        subtotal: new_order.order_subtotal.toFixed(2),
        tax: new_order.order_tax.toFixed(2),
        shipping: new_order.order_ship_charge.toFixed(2),
        total: new_order.order_total.toFixed(2),
      };
      place_order_status.order_payment = new_order.order_payment;
    } catch (error) {
      console.error("Error placing order:", error);
      place_order_status.status = "process_error";
    } finally {
      set_is_busy(false);
      return place_order_status;
    }
  }

  useEffect(() => {
    console.log("+++++++ CART VALIDATED: ", cart_validated);
  }, [cart_validated]);

  useEffect(() => {
    console.log(
      "+++++++ CART UPDATED_DURING_FETCH ",
      cart_updated_during_fetch
    );
  }, [cart_updated_during_fetch]);

  return (
    <Router>
      <Header />
      <Nav
        is_logged_in={login_state.is_logged_in}
        cart_count={cart_count}
        is_busy={is_busy}
      />
      <main>
        {/* <Loading loading_please_wait={is_busy} /> */}
        <Error error_message={error_message} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/store"
            element={
              <Store store_data={store_data} fetch_store={fetch_store} />
            }
          />
          <Route
            path="/store/:cat_url"
            element={
              <Category store_data={store_data} update_cart={update_cart} />
            }
          />
          <Route
            path="/product/:prod_url"
            element={
              <ProductDetails
                product_quantities={store_data.product_quantities}
                update_cart={update_cart}
              />
            }
          />
          <Route
            path="/account"
            element={
              login_state.is_logged_in ? (
                <Account
                  login_state={login_state}
                  set_logged_in={set_logged_in}
                  set_is_busy={set_is_busy}
                  user_data={user_data}
                  set_user_data={set_user_data}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={
              login_state.is_logged_in ? (
                <Navigate to="/account" />
              ) : (
                <Login
                  set_logged_in={set_logged_in}
                  set_is_busy={set_is_busy}
                  set_user_data={set_user_data}
                />
              )
            }
          />

          <Route
            path="/cart"
            element={
              <Cart
                store_data={store_data}
                shopping_cart={shopping_cart}
                update_cart={update_cart}
                cart_count={cart_count}
                totals={totals}
                group_and_sort_cart={group_and_sort_cart}
                login_state={login_state}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <Checkout
                totals={totals}
                cart_count={cart_count}
                destination_province={destination_province}
                set_destination_province={set_destination_province}
                set_is_order_processing_allowed={
                  set_is_order_processing_allowed
                }
                login_state={login_state}
              />
            }
          />

          <Route
            path="/order_processing"
            element={
              is_order_processing_allowed ? (
                <OrderProcessing
                  place_order={place_order}
                  set_initiate_store_fetch={set_initiate_store_fetch}
                  update_cart={update_cart}
                  login_state={login_state}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
