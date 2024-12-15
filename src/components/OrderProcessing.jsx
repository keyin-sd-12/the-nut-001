import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function OrderProcessing({
  place_order,
  set_initiate_store_fetch,
  update_cart,
  login_state,
}) {
  const location = useLocation();
  const { address, credit_card } = location.state || {};

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const navigate = useNavigate();
  const [processing_status, set_processing_status] = useState("processing");
  const [order_result, set_order_result] = useState(null);

  //   sessionStorage.removeItem("cart_changed");
  sessionStorage.setItem("order_started", JSON.stringify(true));

  useEffect(() => {
    (async () => {
      try {
        const result = await place_order(address, credit_card);
        set_processing_status(result.status);

        if (result.status === "success") {
          set_order_result(result);
          sessionStorage.removeItem("cart_changed");
          sessionStorage.removeItem("order_started");
          update_cart("empty");
          console.log("PROCESSING Order placed successfully:", result);
          if (!login_state.is_logged_in) {
            sessionStorage.removeItem("saved_address");
          }
          set_initiate_store_fetch(true);
        }
      } catch (error) {
        console.error("Error placing order:", error);
        set_processing_status("process_error");
      }
    })();
  }, []);

  return (
    <div className="order_process_wrapper">
      {processing_status === "processing" && (
        <div>
          <h1>Processing Your Order</h1>
          <p>Please wait while we process your order...</p>
          <p>{address.first_name}</p>
        </div>
      )}

      {processing_status === "success" && order_result && (
        <div>
          <h1>Order Placed Successfully!</h1>

          {/* order info */}
          <div>
            <p>
              <strong>Order Number:</strong> {order_result.order_id}
            </p>
            <p>
              <strong>Order Date:</strong> {order_result.order_date}
            </p>
          </div>

          {/* cust. info */}
          <div>
            <h2>Customer Information</h2>
            <p>{`${order_result.customer_address.first_name} ${order_result.customer_address.last_name}`}</p>
            <p>{order_result.customer_address.address_line_1}</p>
            {order_result.customer_address.address_line_2 && (
              <p>{order_result.customer_address.address_line_2}</p>
            )}
            <p>{`${order_result.customer_address.city_name}, ${order_result.customer_address.province_name} ${order_result.customer_address.postal_code}`}</p>
            <p>{order_result.customer_address.telephone_number}</p>
            <p>{order_result.customer_address.email}</p>
          </div>

          {/* items in order */}
          <div>
            <h2>Order Items</h2>
            {order_result.order_details.map((category, index) => (
              <div key={index}>
                <h3>{category.category_title}</h3>
                <p>{category.description}</p>
                <ul>
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      {item.qty}x {item.name} - ${item.price.toFixed(2)} each,
                      Total: ${item.total.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* totals */}
          <div>
            <h2>Order Summary</h2>
            <p>
              <strong>Total Items:</strong> {order_result.order_items_count}
            </p>
            <p>
              <strong>Subtotal:</strong> ${order_result.order_totals.subtotal}
            </p>
            <p>
              <strong>Tax:</strong> ${order_result.order_totals.tax}
            </p>
            <p>
              <strong>Shipping:</strong> ${order_result.order_totals.shipping}
            </p>
            <p>
              <strong>Total:</strong> ${order_result.order_totals.total}
            </p>
            <p>
              <strong>Payment:</strong> Credit card ending in{" "}
              {order_result.order_payment.last_four}
            </p>
          </div>

          <p>Thank you for your order!</p>
          <button onClick={() => navigate("/store")}>OK</button>
        </div>
      )}

      {processing_status === "qty_error" && (
        <div>
          <h1>Quantities Changed Error</h1>
          {/* <p>{error_message}</p> */}
          <button onClick={() => navigate("/cart")}>Go Back to Cart</button>
        </div>
      )}

      {processing_status === "update_qty_error" && (
        <div>
          <h1>available stock update error, please, try again</h1>
          {/* <p>{error_message}</p> */}
          <button onClick={() => navigate("/cart")}>Go Back to Cart</button>
        </div>
      )}

      {processing_status === "process_error" && (
        <div>
          <h1>Process Error</h1>
          {/* <p>{error_message}</p> */}
          <button onClick={() => navigate("/cart")}>Go Back to Cart</button>
        </div>
      )}
    </div>
  );
}

export default OrderProcessing;
