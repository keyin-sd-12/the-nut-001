import Button from "./Button";
import { useState, useEffect } from "react";

function EditAddress({ initial_address, on_save, on_cancel, show_email }) {
  // load saved address from sessionStorage or use initial_address as the default
  const [address, set_address] = useState(() => {
    const saved_address = sessionStorage.getItem("saved_address");
    const initial_data = saved_address
      ? JSON.parse(saved_address)
      : { ...initial_address };

    // all fields are initialized with defaults
    return {
      first_name: initial_data.first_name || "",
      last_name: initial_data.last_name || "",
      address_line_1: initial_data.address_line_1 || "",
      address_line_2: initial_data.address_line_2 || "",
      city_name: initial_data.city_name || "",
      province_name: initial_data.province_name || "",
      postal_code: initial_data.postal_code || "",
      telephone_number: initial_data.telephone_number || "",
      email: initial_data.email || "",
    };
  });

  const [errors, set_errors] = useState({});

  // some very simple regex for validation
  const name_regex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
  const address_regex = /^[A-Za-z0-9À-ÖØ-öø-ÿ'.,# -]+$/;
  const city_regex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9' .-]+$/;
  const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const province_regex = /^(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)$/i;
  const postal_code_regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  const phone_regex = /^\d{3}[- ]?\d{3}[- ]?\d{4}$/;

  //   useEffect(() => {
  //     sessionStorage.setItem("saved_address", JSON.stringify(address));
  //   }, [address]);

  function handle_input_change(field, value) {
    set_address((prev) => ({
      ...prev,
      [field]: value,
    }));

    set_errors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  function handle_prefill() {
    const default_address = {
      first_name: "John",
      last_name: "Doe",
      address_line_1: "123 Beacon St.",
      address_line_2: "Apt 4B",
      city_name: "Toronto",
      province_name: "ON",
      postal_code: "A1A 1A1",
      telephone_number: "123-456-7890",
      email: show_email ? "johndoe@example.com" : address.email,
    };
    set_address(default_address);
    set_errors({});
  }

  function handle_clear() {
    const cleared_address = {
      first_name: "",
      last_name: "",
      address_line_1: "",
      address_line_2: "",
      city_name: "",
      province_name: "",
      postal_code: "",
      telephone_number: "",
      email: show_email ? "" : address.email,
    };
    set_address(cleared_address);
    set_errors({});
    sessionStorage.removeItem("saved_address");
  }

  function handle_save() {
    let new_errors = {};

    if (show_email && !email_regex.test(address.email)) {
      new_errors.email = "Invalid email address format";
    }
    if (!name_regex.test(address.first_name)) {
      new_errors.first_name = "Invalid first name";
    }
    if (!name_regex.test(address.last_name)) {
      new_errors.last_name = "Invalid last name";
    }
    if (!address_regex.test(address.address_line_1)) {
      new_errors.address_line_1 = "Invalid address";
    }
    if (address.address_line_2 && !address_regex.test(address.address_line_2)) {
      new_errors.address_line_2 = "Invalid address";
    }
    if (!city_regex.test(address.city_name)) {
      new_errors.city_name = "Invalid city name";
    }
    if (!province_regex.test(address.province_name)) {
      new_errors.province_name = "Invalid province (2 letters)";
    }
    if (!postal_code_regex.test(address.postal_code)) {
      new_errors.postal_code = "Invalid postal (e.g., A1A 1A1)";
    }
    if (!phone_regex.test(address.telephone_number)) {
      new_errors.telephone_number = "Invalid phone number";
    }

    if (Object.keys(new_errors).length > 0) {
      set_errors(new_errors);
      return;
    }
    on_save(address);
  }

  console.log("EDIT ADDRESS COMPONENT", show_email);

  return (
    <div className="address_edit_form">
      <div className="input_container">
        <label htmlFor="first_name">First Name</label>
        <input
          id="first_name"
          type="text"
          value={address.first_name}
          placeholder="First Name"
          onChange={(e) => handle_input_change("first_name", e.target.value)}
          className={errors.first_name ? "input_error" : ""}
        />
        {errors.first_name && (
          <div className="error_message">{errors.first_name}</div>
        )}
      </div>
      <div className="input_container">
        <label htmlFor="last_name">Last Name</label>
        <input
          id="last_name"
          type="text"
          value={address.last_name}
          placeholder="Last Name"
          onChange={(e) => handle_input_change("last_name", e.target.value)}
          className={errors.last_name ? "input_error" : ""}
        />
        {errors.last_name && (
          <div className="error_message">{errors.last_name}</div>
        )}
      </div>
      <div className="input_container">
        <label htmlFor="address_line_1">Address Line 1</label>
        <input
          id="address_line_1"
          type="text"
          value={address.address_line_1}
          placeholder="Address Line 1"
          onChange={(e) =>
            handle_input_change("address_line_1", e.target.value)
          }
          className={errors.address_line_1 ? "input_error" : ""}
        />
        {errors.address_line_1 && (
          <div className="error_message">{errors.address_line_1}</div>
        )}
      </div>
      <div className="input_container">
        <label htmlFor="address_line_2">Address Line 2 (optional)</label>
        <input
          id="address_line_2"
          type="text"
          value={address.address_line_2}
          placeholder="Address Line 2 (optional)"
          onChange={(e) =>
            handle_input_change("address_line_2", e.target.value)
          }
        />
      </div>
      <div className="input_container">
        <label htmlFor="city_name">City</label>
        <input
          id="city_name"
          type="text"
          value={address.city_name}
          placeholder="City"
          onChange={(e) => handle_input_change("city_name", e.target.value)}
          className={errors.city_name ? "input_error" : ""}
        />
        {errors.city_name && (
          <div className="error_message">{errors.city_name}</div>
        )}
      </div>
      <div className="input_container">
        <label htmlFor="province_name">Province (e.g., ON)</label>
        <input
          id="province_name"
          type="text"
          value={address.province_name}
          placeholder="Province (e.g., ON)"
          onChange={(e) => handle_input_change("province_name", e.target.value)}
          className={errors.province_name ? "input_error" : ""}
        />
        {errors.province_name && (
          <div className="error_message">{errors.province_name}</div>
        )}
      </div>
      <div className="input_container">
        <label htmlFor="postal_code">Postal Code (e.g., A1A 1A1)</label>
        <input
          id="postal_code"
          type="text"
          value={address.postal_code}
          placeholder="Postal Code (e.g., A1A 1A1)"
          onChange={(e) => handle_input_change("postal_code", e.target.value)}
          className={errors.postal_code ? "input_error" : ""}
        />
        {errors.postal_code && (
          <div className="error_message">{errors.postal_code}</div>
        )}
      </div>
      <div className="input_container">
        <label htmlFor="telephone_number">Telephone Number (10 digits)</label>
        <input
          id="telephone_number"
          type="text"
          value={address.telephone_number}
          placeholder="Telephone Number (10 digits)"
          onChange={(e) =>
            handle_input_change("telephone_number", e.target.value)
          }
          className={errors.telephone_number ? "input_error" : ""}
        />
        {errors.telephone_number && (
          <div className="error_message">{errors.telephone_number}</div>
        )}
      </div>
      {show_email && (
        <div className="input_container">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="text"
            value={address.email}
            placeholder="Email Address"
            onChange={(e) => handle_input_change("email", e.target.value)}
            className={errors.email ? "input_error" : ""}
          />
          {errors.email && <div className="error_message">{errors.email}</div>}
        </div>
      )}
      <div className="form_buttons">
        <Button on_click={handle_save}>Save</Button>
        <Button on_click={on_cancel}>Cancel</Button>
        <Button on_click={handle_clear}>Clear</Button>
        <Button on_click={handle_prefill}>Prefill</Button>
      </div>
    </div>
  );
}

export default EditAddress;
