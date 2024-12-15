import "./Store.css";

import { Link } from "react-router-dom";
import Button from "./Button";
import { useEffect } from "react";

function Store({ store_data, fetch_store }) {
  const categories = store_data.categories;

  // I could fetch store everytime the store component is rendered
  // also everytime shopping cart is updated, but it's too much traffic
  // so for now store is only updated when the app is loaded (or manually reload the page)
  // and when user checks out, before checking out, store is fetched to see
  // if the items are still available (if not, user is informed and the cart is updated

  // useEffect(() => {
  //   fetch_store();
  // }, []);

  return (
    <>
      {/* <h1 className="store_categories">Store</h1> */}
      <div className="category_container">
        {categories.map((category) => (
          <div
            key={category.cat_id}
            id={category.cat_id}
            className="category_wrapper"
          >
            <div className="category_long_name">{category.cat_long_name}</div>
            {/* Wide Image */}
            <img
              className="category_image"
              src={`/${category.cat_id}W.webp`}
              alt={`${category.cat_long_name} Wide`}
            />
            <div className="category_info">
              <div className="category_long_description">
                {category.cat_long_description}
              </div>
              <div className="category_button_wrapper">
                <Link to={`/store/${category.show_in_url}`}>
                  <Button>Browse selection</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Store;
