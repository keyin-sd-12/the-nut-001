import { fetch_accounts, add_account } from "../lib/jsonbin_interface.js";
import { useState, useEffect } from "react";
import Button from "./Button";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { v4 as uuidv4 } from "uuid";

function Login({ set_logged_in, set_is_busy, set_user_data }) {
  const [user_name, set_user_name] = useState("");
  const [password, set_password] = useState("");
  const [confirm_password, set_confirm_password] = useState("");

  const [is_creating_account, set_is_creating_account] = useState(false);
  const [show_password, set_show_password] = useState(false);
  const [local_form_errors, set_local_form_errors] = useState({});
  const [login_error_message, set_login_error_message] = useState("");

  const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const password_regex = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/;

  // useEffect(() => {
  //   sessionStorage.setItem("user_name", JSON.stringify(user_name));
  // }, [user_name]);

  useEffect(() => {
    set_user_name("");
    set_password("");
    set_confirm_password("");
  }, []);

  async function handle_login(e) {
    e.preventDefault();
    if (!user_name || !password) {
      set_local_form_errors({
        user_name: !user_name ? "Username is required" : "",
        password: !password ? "Password is required" : "",
      });
      return;
    }

    set_is_busy(true);
    try {
      const accounts = await fetch_accounts(5000);
      const account = accounts.find(
        (acc) =>
          acc.account_login === user_name && acc.account_password === password
      );
      if (account) {
        set_user_data(account);
        set_logged_in((prevState) => ({
          ...prevState,
          is_logged_in: true,
          customer_id: account.account_id,
          customer_login: account.account_login,
          login_time: new Date().toISOString(),
        }));

        console.log("LOGIN COMPONENT Logged in as", account.account_login);
      } else {
        set_login_error_message("Invalid username or password");
        setTimeout(() => set_login_error_message(""), 5000);
      }
    } catch (error) {
      set_login_error_message("Failed to login. Please try again.");
      setTimeout(() => set_login_error_message(""), 5000);
    } finally {
      set_is_busy(false);
    }
  }

  async function handle_create_account(e) {
    e.preventDefault();
    const new_account_id = uuidv4();
    const edit_errors = {};

    if (!email_regex.test(user_name)) {
      edit_errors.user_name = "Invalid email format";
    }
    if (!password_regex.test(password)) {
      edit_errors.password =
        "Password must be at least 8 characters long and contain at least one number and one letter, no special characters";
    }
    if (password !== confirm_password) {
      edit_errors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(edit_errors).length > 0) {
      set_local_form_errors(edit_errors);
      return;
    }

    set_is_busy(true);
    try {
      const new_user_data = {
        account_id: new_account_id,
        account_login: user_name,
        account_password: password,
        shipping_added: "false",
        account_address: {
          first_name: "",
          last_name: "",
          address_line_1: "",
          address_line_2: "",
          city_name: "",
          province_name: "",
          postal_code: "",
          telephone_number: "",
          email: user_name,
        },
        account_created: new Date().toISOString(),
        account_last_updated: new Date().toISOString(),
        password_last_changed: new Date().toISOString(),
      };

      await add_account(new_user_data, 5000);
      set_user_data(new_user_data);
      console.log("LOGIN COMPONENT Created account for", new_user_data);
      set_logged_in((prevState) => ({
        ...prevState,
        is_logged_in: true,
        address_entered: false,
        customer_id: new_account_id,
        customer_login: user_name,
        login_time: new Date().toISOString(),
      }));
      sessionStorage.setItem("logged_in", "true");
      sessionStorage.setItem("customer_id", JSON.stringify(new_account_id));
      sessionStorage.setItem(
        "saved_address",
        JSON.stringify(new_user_data.account_address)
      );
      e.target.reset();
    } catch (error) {
      if (error.message === "ACCOUNT_ALREADY_EXISTS") {
        set_login_error_message("Account already exists with this email.");
      } else {
        set_login_error_message("Failed to create account. Please try again.");
      }
      setTimeout(() => set_login_error_message(""), 5000);
    } finally {
      set_is_busy(false);
    }
  }

  function handle_show_password(e) {
    e.preventDefault();
    set_show_password(!show_password);
  }

  return (
    <div className="login_container">
      <h2>{is_creating_account ? "Create Account" : "Login"}</h2>
      <form
        className="login_form"
        onSubmit={is_creating_account ? handle_create_account : handle_login}
        autoComplete="off"
      >
        <div className="input_container">
          <label htmlFor="user_name">Username (Email)</label>
          <input
            id="user_name"
            type="text"
            value={user_name}
            onChange={(e) => {
              set_user_name(e.target.value);
              set_local_form_errors((prev) => ({ ...prev, user_name: "" }));
            }}
            className={local_form_errors.user_name ? "input_error" : ""}
            placeholder="Username (Email)"
          />
          {local_form_errors.user_name && (
            <div className="error_message">{local_form_errors.user_name}</div>
          )}
        </div>
        <div className="input_container">
          <label htmlFor="password">Password</label>
          <div className="password_container">
            <input
              id="password"
              type={show_password ? "text" : "password"}
              value={password}
              onChange={(e) => {
                set_password(e.target.value);
                set_local_form_errors((prev) => ({ ...prev, password: "" }));
              }}
              className={local_form_errors.password ? "input_error" : ""}
              placeholder="Password"
            />
          </div>
          {local_form_errors.password && (
            <div className="error_message">{local_form_errors.password}</div>
          )}
        </div>
        {is_creating_account && (
          <div className="input_container">
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
              id="confirm_password"
              type={show_password ? "text" : "password"}
              value={confirm_password}
              onChange={(e) => {
                set_confirm_password(e.target.value);
                set_local_form_errors((prev) => ({
                  ...prev,
                  confirm_password: "",
                }));
              }}
              className={
                local_form_errors.confirm_password ? "input_error" : ""
              }
              placeholder="Confirm Password"
            />
            {local_form_errors.confirm_password && (
              <div className="error_message">
                {local_form_errors.confirm_password}
              </div>
            )}
          </div>
        )}
        <div className="creating_account_check">
          <input
            type="checkbox"
            checked={is_creating_account}
            onChange={(e) => set_is_creating_account(e.target.checked)}
          />
          <label>Create an account</label>
          <Button
            type="button"
            on_click={handle_show_password}
            class_name="show_password_button"
          >
            {show_password ? <FaEyeSlash /> : <FaEye />}
          </Button>
        </div>
        <div className="form_buttons">
          <Button type="submit" class_name="login_button">
            {is_creating_account ? "Create Account" : "Login"}
          </Button>
        </div>
        {login_error_message && (
          <div className="error_message">{login_error_message}</div>
        )}
      </form>
    </div>
  );
}

export default Login;
