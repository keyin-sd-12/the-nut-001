import "./ProductDetails.css";
import { useParams, Link, useLocation } from "react-router-dom";
import Button from "./Button";

function ProductDetails({ product_quantities, update_cart }) {
  const { prod_url } = useParams();
  const { product, category_url } = useLocation().state;

  if (!product) {
    return <h2>Product not found</h2>;
  }

  //we need quantity here for live updates, too
  const product_quantity_data = product_quantities.find(
    (item) => item.product_id === product.product_id
  );

  const quantity = product_quantity_data
    ? parseInt(product_quantity_data.quantity_avail, 10)
    : 0;

  return (
    <div className="product_details_container">
      <h1>{product.prod_name}</h1>
      <div className="product_details_wrapper">
        <img
          className="product_image"
          src={`/${product.product_id}.webp`}
          alt={product.prod_name}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150";
          }}
        />

        <div className="product_info">
          <div className="prod_desc">{product.prod_description}</div>
          <p>
            <strong>Price:</strong> ${product.price_per_can.toFixed(2)}
          </p>
          <p>
            <strong>Net weight:</strong> {product.can_weight_gr}g
          </p>
          <p>
            <strong>Price:</strong> ${product.price_per_can.toFixed(2)}
          </p>
          <p>
            <strong>Available:</strong>{" "}
            {quantity > 0 ? quantity : "Out of Stock"}
          </p>
        </div>
      </div>
      <div className="product_details_buttons_wrapper">
        <div className="button_back_to_category">
          <Link to={`/store/${category_url}`}>
            <Button>Back</Button>
          </Link>
        </div>
        <div className="button_back_to_categories">
          <Link to={`/store`}>
            <Button>Storefront</Button>
          </Link>
        </div>
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
  );
}

export default ProductDetails;
