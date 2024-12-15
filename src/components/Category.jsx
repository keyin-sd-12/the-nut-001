import "./Category.css";

import { useParams, Link } from "react-router-dom";
import Button from "./Button";
import Product from "./Product";

function Category({ store_data, update_cart }) {
  const { cat_url } = useParams();
  console.log("cat_url: ", cat_url);

  // find the category using the URL
  const category = store_data.categories.find(
    (cat) => cat.show_in_url === cat_url
  );

  if (!store_data.categories.length) {
    return <p>Loading category data...</p>;
  }

  if (!category) {
    return <h2>Category not found</h2>;
  }

  // filter products in the selected category
  const products_in_category = store_data.products.filter(
    (product) => product.category_id === category.cat_id
  );

  // mapping of product quantities
  const productQuantities = store_data.product_quantities.reduce(
    (acc, item) => {
      acc[item.product_id] = parseInt(item.quantity_avail, 10);
      return acc;
    },
    {}
  );

  console.log("products_in_category: ", products_in_category);

  return (
    <div className="category_details_container">
      <h1>{category.cat_long_name}</h1>
      {/* <img
        className="category_image"
        src={`../../public/${category.cat_id}W.webp`}
        alt={category.cat_long_name}
      /> */}
      {/* <p>{category.cat_long_description}</p> */}

      <div className="products_wrapper">
        {products_in_category.map((product) => {
          const quantity = productQuantities[product.product_id] || 0;
          return (
            <Product
              key={product.product_id}
              product={product}
              quantity={quantity}
              category={category.cat_id}
              category_url={category.show_in_url}
              update_cart={update_cart}
            />
          );
        })}
      </div>
      <div className="button_from_category_to_storefront">
        <Link to={`/store`}>
          <Button>Storefront</Button>
        </Link>
      </div>
    </div>
  );
}

export default Category;
