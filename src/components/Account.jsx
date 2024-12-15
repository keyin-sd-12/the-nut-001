import {
  fetch_account_by_id,
  update_account_by_id,
  fetch_orders,
} from "../lib/jsonbin_interface.js";
import { useState, useEffect } from "react";
import Button from "./Button";
import EditAddress from "./EditAddress";
import { IoReloadCircle } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

function Account({
  login_state,
  set_logged_in,
  set_is_busy,
  user_data,
  set_user_data,
}) {
  const [is_editing_address, set_is_editing_address] = useState(false);
  const [is_editing_password, set_is_editing_password] = useState(false);
  const [order_history, set_order_history] = useState([]);
  const [show_order_history, set_show_order_history] = useState(false);
  const [account_error_message, set_account_error_message] = useState("");
  const [local_form_errors, set_local_form_errors] = useState({});
  const [show_password, set_show_password] = useState(false);
  const [password_form, set_password_form] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const password_regex = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/;

  async function refresh_user() {
    set_is_busy(true);
    console.log("ACCOUNT COMPONENT REFRESH user", login_state);
    try {
      const updated_user = await fetch_account_by_id(login_state.customer_id);

      const all_orders = await fetch_orders();
      const user_orders = all_orders.filter(
        (order) => order.account_id === login_state.customer_id
      );

      set_user_data(updated_user);
      set_order_history(user_orders);
    } catch (error) {
      set_account_error_message("Failed to fetch account or orders.");
      setTimeout(() => set_account_error_message(""), 5000);
    } finally {
      set_is_busy(false);
    }
  }

  useEffect(() => {
    refresh_user();
  }, []);

  function handle_logout() {
    set_logged_in({
      is_logged_in: false,
      address_entered: false,
      customer_id: "-1",
      customer_login: "",
      login_time: "",
    });
    sessionStorage.setItem("logged_in", "false");
    sessionStorage.setItem("customer_id", "-1");
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
  }

  async function handle_address_save(updated_address) {
    set_is_busy(true);
    try {
      const updated_user = {
        ...user_data,
        account_address: updated_address,
        shipping_added: "true",
        account_last_updated: new Date().toISOString(),
      };
      await update_account_by_id(user_data.account_id, updated_user);
      set_user_data(updated_user);
      set_is_editing_address(false);
    } catch (error) {
      set_account_error_message("Error saving address.");
      setTimeout(() => set_account_error_message(""), 5000);
    } finally {
      set_is_busy(false);
    }
  }

  async function handle_password_save(e) {
    e.preventDefault();
    const { old_password, new_password, confirm_password } = password_form;
    const errors = {};

    if (old_password !== user_data.account_password) {
      errors.old_password = "Old password is incorrect.";
    }
    if (!password_regex.test(new_password)) {
      errors.new_password =
        "Password must be at least 8 characters long and contain at least one number and one letter.";
    }
    if (new_password !== confirm_password) {
      errors.confirm_password = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      set_local_form_errors(errors);
      return;
    }

    set_is_busy(true);
    try {
      const updated_user = {
        ...user_data,
        account_password: new_password,
        password_last_changed: new Date().toISOString(),
      };
      await update_account_by_id(user_data.account_id, updated_user);
      set_user_data(updated_user);
      set_is_editing_password(false);
    } catch (error) {
      set_account_error_message("Error updating password.");
      setTimeout(() => set_account_error_message(""), 5000);
    } finally {
      set_is_busy(false);
    }
  }

  return (
    <div className="account_container">
      <h2>
        <span className="h2_title">Account</span>
        <Button className="h2_button" on_click={refresh_user}>
          <IoReloadCircle /> Refresh
        </Button>
      </h2>

      {account_error_message && (
        <div className="error_message">{account_error_message}</div>
      )}

      {/* Address Section */}
      <div className="address_edit_container">
        <h3>
          Default address
          {user_data.account_address.first_name ? "" : ": not set"}
        </h3>
        {is_editing_address ? (
          <EditAddress
            initial_address={user_data.account_address}
            on_save={handle_address_save}
            on_cancel={() => set_is_editing_address(false)}
            show_email={false}
          />
        ) : (
          <div className="address_display">
            {user_data.account_address.first_name ? (
              <>
                <p>{`${user_data.account_address.first_name} ${user_data.account_address.last_name}`}</p>
                <p>{user_data.account_address.address_line_1}</p>
                {user_data.account_address.address_line_2 && (
                  <p>{user_data.account_address.address_line_2}</p>
                )}
                <p>{`${user_data.account_address.city_name}, ${user_data.account_address.province_name} ${user_data.account_address.postal_code}`}</p>
                <p>{user_data.account_address.telephone_number}</p>
                <p>{user_data.account_address.email}</p>
                <Button on_click={() => set_is_editing_address(true)}>
                  Edit Address
                </Button>
              </>
            ) : (
              <>
                <p>{user_data.account_address.email}</p>
                <Button on_click={() => set_is_editing_address(true)}>
                  Enter Address
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Order History */}
      <div className="order_history_container">
        <Button on_click={() => set_show_order_history(!show_order_history)}>
          {show_order_history ? "Hide Order History" : "Show Order History"}
        </Button>
        {show_order_history && (
          <ul>
            {order_history.map((order) => (
              <li key={order.order_id}>
                Order #{order.order_id} -{" "}
                {new Date(order.order_created).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}{" "}
                - ${order.order_total.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Password Change */}
      {is_editing_password ? (
        <form
          className="password_edit_container"
          onSubmit={handle_password_save}
        >
          <label htmlFor="old_password">Old Password</label>
          <input
            id="old_password"
            type={show_password ? "text" : "password"}
            value={password_form.old_password}
            onChange={(e) => {
              set_password_form((prev) => ({
                ...prev,
                old_password: e.target.value,
              }));
              set_local_form_errors((prev) => ({
                ...prev,
                old_password: "",
              }));
            }}
            className={local_form_errors.old_password ? "input_error" : ""}
            placeholder="Old Password"
          />
          {local_form_errors.old_password && (
            <div className="error_message">
              {local_form_errors.old_password}
            </div>
          )}

          <label htmlFor="new_password">New Password</label>
          <input
            id="new_password"
            type={show_password ? "text" : "password"}
            value={password_form.new_password}
            onChange={(e) => {
              set_password_form((prev) => ({
                ...prev,
                new_password: e.target.value,
              }));
              set_local_form_errors((prev) => ({
                ...prev,
                new_password: "",
              }));
            }}
            className={local_form_errors.new_password ? "input_error" : ""}
            placeholder="New Password"
          />
          {local_form_errors.new_password && (
            <div className="error_message">
              {local_form_errors.new_password}
            </div>
          )}

          <label htmlFor="confirm_password">Confirm Password</label>
          <input
            id="confirm_password"
            type={show_password ? "text" : "password"}
            value={password_form.confirm_password}
            onChange={(e) => {
              set_password_form((prev) => ({
                ...prev,
                confirm_password: e.target.value,
              }));
              set_local_form_errors((prev) => ({
                ...prev,
                confirm_password: "",
              }));
            }}
            className={local_form_errors.confirm_password ? "input_error" : ""}
            placeholder="Confirm Password"
          />
          {local_form_errors.confirm_password && (
            <div className="error_message">
              {local_form_errors.confirm_password}
            </div>
          )}

          <Button
            type="button"
            on_click={() => set_show_password(!show_password)}
          >
            {show_password ? <FaEyeSlash /> : <FaEye />}
          </Button>

          <Button type="submit">Save Password</Button>
          <Button on_click={() => set_is_editing_password(false)}>
            Cancel
          </Button>
        </form>
      ) : (
        <Button on_click={() => set_is_editing_password(true)}>
          Change Password
        </Button>
      )}

      {/* Logout */}
      <div className="buttons_container">
        <Button on_click={handle_logout}>Logout</Button>
      </div>
    </div>
  );
}

export default Account;
