import { useState } from "react";
import Button from "./Button";

function EnterCreditCardInfo({ initial_card, on_save, on_cancel }) {
  const [card_info, set_card_info] = useState({
    name_on_card: initial_card?.name_on_card || "",
    card_number: initial_card?.card_number || "",
    expiration_date: initial_card?.expiration_date || "",
    cvv: initial_card?.cvv || "",
    last_four: initial_card?.last_four || "",
  });

  const [errors, set_errors] = useState({});

  // regex validation
  const name_regex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
  const card_number_regex = /^\d{16}$/;
  const expiration_date_regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  const cvv_regex = /^\d{3}$/;

  function handle_input_change(field, value) {
    set_card_info((prev) => ({
      ...prev,
      [field]: value,
    }));

    set_errors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  function handle_save() {
    let new_errors = {};

    if (!name_regex.test(card_info.name_on_card)) {
      new_errors.name_on_card =
        "Invalid name. Only letters, spaces, apostrophes, and hyphens are allowed.";
    }
    if (!card_number_regex.test(card_info.card_number)) {
      new_errors.card_number = "Card number must be exactly 16 digits.";
    }
    if (!expiration_date_regex.test(card_info.expiration_date)) {
      new_errors.expiration_date = "Invalid expiration date format. Use MM/YY.";
    }
    if (!cvv_regex.test(card_info.cvv)) {
      new_errors.cvv = "CVV must be 3 or 4 digits.";
    }

    if (Object.keys(new_errors).length > 0) {
      set_errors(new_errors);
      return;
    }

    on_save({
      ...card_info,
      last_four: card_info.card_number.slice(-4),
    });
  }

  function handle_clear() {
    set_card_info({
      name_on_card: "",
      card_number: "",
      expiration_date: "",
      cvv: "",
      last_four: "",
    });
    set_errors({});
  }

  function handle_prefill() {
    set_card_info({
      name_on_card: "John Doe",
      card_number: "1234567812345678",
      expiration_date: "12/24",
      cvv: "123",
      last_four: "5678",
    });
    set_errors({});
  }

  return (
    <div className="credit_card_form">
      <div className="input_container">
        <label htmlFor="name_on_card">Name on Card</label>
        <input
          id="name_on_card"
          type="text"
          value={card_info.name_on_card}
          placeholder="Name on Card"
          onChange={(e) => handle_input_change("name_on_card", e.target.value)}
          className={errors.name_on_card ? "input_error" : ""}
        />
        {errors.name_on_card && (
          <div className="error_message">{errors.name_on_card}</div>
        )}
      </div>
      <div className="input_container">
        <label htmlFor="card_number">Card Number</label>
        <input
          id="card_number"
          type="text"
          value={card_info.card_number}
          placeholder="Card Number"
          onChange={(e) => handle_input_change("card_number", e.target.value)}
          className={errors.card_number ? "input_error" : ""}
        />
        {errors.card_number && (
          <div className="error_message">{errors.card_number}</div>
        )}
      </div>
      <div className="input_container">
        <label htmlFor="expiration_date">Expiration Date (MM/YY)</label>
        <input
          id="expiration_date"
          type="text"
          value={card_info.expiration_date}
          placeholder="Expiration Date (MM/YY)"
          onChange={(e) =>
            handle_input_change("expiration_date", e.target.value)
          }
          className={errors.expiration_date ? "input_error" : ""}
        />
        {errors.expiration_date && (
          <div className="error_message">{errors.expiration_date}</div>
        )}
      </div>
      <div className="input_container">
        <label htmlFor="cvv">CVV</label>
        <input
          id="cvv"
          type="text"
          value={card_info.cvv}
          placeholder="CVV"
          onChange={(e) => handle_input_change("cvv", e.target.value)}
          className={errors.cvv ? "input_error" : ""}
        />
        {errors.cvv && <div className="error_message">{errors.cvv}</div>}
      </div>
      <div className="form_buttons">
        <Button on_click={handle_save}>Save</Button>
        <Button on_click={on_cancel}>Cancel</Button>
        <Button on_click={handle_clear}>Clear</Button>
        <Button on_click={handle_prefill}>Prefill</Button>
      </div>
    </div>
  );
}

export default EnterCreditCardInfo;
