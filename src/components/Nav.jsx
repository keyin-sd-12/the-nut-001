import { NavLink } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { FaListAlt } from "react-icons/fa";
import { FaBagShopping } from "react-icons/fa6";
import { MdAccountCircle } from "react-icons/md";
import { MdAccountBox } from "react-icons/md";
import { RiLoginBoxFill } from "react-icons/ri";
import { BiSolidLogIn } from "react-icons/bi";
import { RiLoginCircleFill } from "react-icons/ri";
import { PiArrowsDownUpBold } from "react-icons/pi";

function Nav({ is_logged_in, cart_count, is_busy }) {
  return (
    <nav className="nav">
      {is_busy && (
        <div className="loading_up_down">
          <PiArrowsDownUpBold />
        </div>
      )}
      <div className="nav_container">
        <ul className="nav_list">
          <div className="nav_main_left">
            {/* Home Link */}
            <li className="nav_item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav_button active" : "nav_button"
                }
                end
              >
                <FaHome className="nav_icon home_icon" />
                <span className="nav_text">Welcome</span>
              </NavLink>
            </li>

            {/* Store Link */}
            <li className="nav_item">
              <NavLink
                to="/store"
                className={({ isActive }) =>
                  isActive ? "nav_button active" : "nav_button"
                }
              >
                <FaListAlt className="nav_icon store_icon" />
                <span className="nav_text">Store</span>
              </NavLink>
            </li>
          </div>
          <div className="nav_main_right">
            {/* Conditional Login/My Account Link */}
            <li className="nav_item">
              {is_logged_in ? (
                <NavLink
                  to="/account"
                  className={({ isActive }) =>
                    isActive ? "nav_button active" : "nav_button"
                  }
                >
                  <MdAccountCircle className="nav_icon account_icon" />
                  <span className="nav_text">Account</span>
                </NavLink>
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? "nav_button active" : "nav_button"
                  }
                >
                  {/* <RiLoginBoxFill className="nav_icon account_icon" /> */}
                  <RiLoginCircleFill className="nav_icon account_icon" />
                  <span className="nav_text">Login</span>
                </NavLink>
              )}
            </li>

            {/* Cart Link */}
            <li className="nav_item cart_item">
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive ? "nav_button active" : "nav_button"
                }
              >
                <div className="cart_icon_container">
                  <FaBagShopping className="nav_icon cart_icon" />
                  <span className="cart_counter">{cart_count}</span>
                </div>
                <span className="nav_text">Cart</span>
              </NavLink>
            </li>
          </div>
        </ul>
      </div>
    </nav>
  );
}

export default Nav;
