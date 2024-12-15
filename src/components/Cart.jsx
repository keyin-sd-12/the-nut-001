import "./Cart.css";
import { useNavigate } from "react-router-dom";

import Button from "./Button";

function Cart({
  store_data,
  shopping_cart,
  update_cart,
  cart_count,
  totals,
  group_and_sort_cart,
  login_state,
}) {
  // group and sort cart items by category
  const navigate = useNavigate();
  const grouped_cart = group_and_sort_cart(store_data, shopping_cart);

  if (!shopping_cart.items.length) {
    return <p>Your cart is empty</p>;
  }

  return (
    <>
      <div className="shopping_cart_container">
        <h1>Shopping Cart ({cart_count})</h1>
        <div className="cart_items_container">
          {grouped_cart.map((category) => (
            <div key={category.category_title} className="cart_items_wrapper">
              <h3 className="item_category">{category.category_title}</h3>
              <div className="cart_items">
                {category.items.map((item) => (
                  <div key={item.name} className="cart_item_combo">
                    <div className="item_line_1">
                      <div className="cart_item_name">{item.name}</div>
                      <div className="cart_item_price">
                        ${item.price.toFixed(2)}
                      </div>
                      <div className="cart_item_qty">{item.qty}</div>
                      <div className="cart_item_total">
                        ${item.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="item_line_2">
                      <div className="cart_item_remove_button">
                        <Button onClick={() => update_cart("remove", item)}>
                          X
                        </Button>
                      </div>
                      <div className="cart_item_plus_minus">
                        <div className="cart_item_minus">
                          <Button onClick={() => update_cart("minus", item)}>
                            -
                          </Button>
                        </div>
                        <div className="cart_item_plus">
                          <Button onClick={() => update_cart("plus", item)}>
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="cart_totals">
          <p>
            <strong>Subtotal:</strong> ${totals.subtotal.toFixed(2)}
          </p>
          <p>
            <strong>Shipping:</strong> ${totals.shipping.toFixed(2)}
          </p>
          <p>
            <strong>Order Total:</strong> $
            {(totals.subtotal + totals.shipping).toFixed(2)}
          </p>
        </div>

        <div className="lower_buttons">
          {/* <div className="back_button"> */}
          <Button onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => update_cart("empty", undefined)}>Empty</Button>
          {/* </div> */}
          {/* <div className="checkout_button"> */}
          <Button onClick={() => navigate("/checkout")}>
            {login_state.is_logged_in ? "Checkout" : "Guest Checkout"}
          </Button>
          {/* </div> */}
        </div>
      </div>
    </>
  );
}

export default Cart;
