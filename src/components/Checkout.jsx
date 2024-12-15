import "./Checkout.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EditAddress from "./EditAddress";
import EnterCreditCardInfo from "./EnterCreditCardInfo";
import Button from "./Button";

function Checkout({
  totals,
  cart_count,
  destination_province,
  set_destination_province,
  set_is_order_processing_allowed,
  login_state,
}) {
  const [order_is_processing, set_is_processing] = useState(false);
  const [is_editing_address, set_is_editing_address] = useState(false);
  const [is_editing_card, set_is_editing_card] = useState(false);
  const [address, set_address] = useState(() => {
    const saved_address = sessionStorage.getItem("saved_address");
    return saved_address ? JSON.parse(saved_address) : {};
  });
  const [credit_card, set_credit_card] = useState(null);

  sessionStorage.removeItem("cart_changed");

  useEffect(() => {
    // save the address to sessionStorage whenever it changes
    if (Object.keys(address).length > 0) {
      sessionStorage.setItem("saved_address", JSON.stringify(address));
    }
    console.log("====setting destination province", address.province_name);
    set_destination_province(address.province_name);
  }, [address]);

  function handle_save_address(new_address) {
    set_address(new_address);
    set_is_editing_address(false);
  }

  function handle_save_card(new_card) {
    set_credit_card(new_card);
    set_is_editing_card(false);
  }

  function handle_place_order() {
    set_is_processing(true);
    set_is_order_processing_allowed(true);
    console.log("Navigating to OrderProcessing...");
    navigate("/order_processing", {
      state: { address, credit_card },
    });
  }

  const navigate = useNavigate();

  useEffect(() => {
    if (cart_count === 0) {
      navigate("/cart");
    }
  }, [cart_count, navigate]);

  return (
    <div className="guest_checkout_container">
      <h1>{login_state.is_logged_in ? "Checkout" : "Guest Checkout"}</h1>

      <div className="cart_summary">
        <p>
          <strong>Items Ordered:</strong> {cart_count}
        </p>
        <p>
          <strong>Subtotal (before tax):</strong> ${totals.subtotal.toFixed(2)}
        </p>
        {destination_province && (
          <p>
            <strong>Tax:</strong> ${totals.tax.toFixed(2)}
          </p>
        )}

        <p>
          <strong>Shipping:</strong> ${totals.shipping.toFixed(2)}
        </p>
        {destination_province && (
          <p>
            <strong>Order total:</strong> ${totals.order_total.toFixed(2)}
          </p>
        )}
      </div>

      <div className="address_section">
        <h2>Shipping Address</h2>
        {is_editing_address ? (
          <EditAddress
            initial_address={address}
            on_save={handle_save_address}
            on_cancel={() => set_is_editing_address(false)}
            show_email={!login_state.is_logged_in}
          />
        ) : (
          <div className="address_display">
            {address.first_name ? (
              <>
                <p>{`${address.first_name} ${address.last_name}`}</p>
                <p>{address.address_line_1}</p>
                {address.address_line_2 && <p>{address.address_line_2}</p>}
                <p>{`${address.city_name}, ${address.province_name} ${address.postal_code}`}</p>
                <p>{address.telephone_number}</p>
                {/* <p>{address.email}</p> */}
                <p>
                  {login_state.is_logged_in
                    ? login_state.customer_login
                    : address.email}
                </p>
                <Button on_click={() => set_is_editing_address(true)}>
                  Edit Address
                </Button>
              </>
            ) : (
              <Button on_click={() => set_is_editing_address(true)}>
                Enter Address
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="payment_section">
        <h2>Payment Information</h2>
        {is_editing_card ? (
          <EnterCreditCardInfo
            initial_card={credit_card}
            on_save={handle_save_card}
            on_cancel={() => set_is_editing_card(false)}
          />
        ) : (
          <div className="card_display">
            {credit_card ? (
              <>
                <p>Card ending in: **** {credit_card.last_four}</p>
                <Button on_click={() => set_is_editing_card(true)}>
                  Edit Credit Card
                </Button>
              </>
            ) : (
              <Button on_click={() => set_is_editing_card(true)}>
                Enter Credit Card
              </Button>
            )}
          </div>
        )}
      </div>

      {/* {address.first_name && credit_card && (
        <Button className="place_order_button">Place Order</Button>
      )} */}
      <Button
        className="place_order_button"
        disabled={!address.first_name || !credit_card || order_is_processing}
        onClick={handle_place_order}
      >
        Place Order
      </Button>
      <Button onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
}

export default Checkout;
