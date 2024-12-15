import "./Product.css";

import { Link } from "react-router-dom";
import Button from "./Button";

function Product({ product, quantity, cat_id, category_url, update_cart }) {
  return (
    <div id={product.product_id} className="product_wrapper">
      <h2>{product.prod_name}</h2>
      <div className="product_image">
        <img
          src={`/${product.product_id}W.webp`}
          alt={product.prod_name}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150";
          }}
        />
      </div>
      <div className="product_info_wrapper">
        <div className="product_description">
          <p>{product.prod_short_description}</p>
        </div>
        <div className="product_info">
          <div className="product_price">
            <strong>Price:</strong> ${product.price_per_can.toFixed(2)}
          </div>
          <div className="product_quantity">
            <strong>Available:</strong>{" "}
            {quantity > 0 ? quantity : "Out of Stock"}
          </div>
          <div className="product_button_goto_details">
            <Link
              to={`/product/${product.show_in_url}`}
              state={{ product, category_url }}
            >
              <Button>Details</Button>
            </Link>
          </div>
          <div className="product_button_add_to_cart">
            <Button
              className={`add_to_cart_button ${
                quantity > 0 ? "" : "disabled_button"
              }`}
              disabled={quantity <= 0}
              onClick={() => update_cart("plus", product)}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
