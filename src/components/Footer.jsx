import facebook_svg from "../../icons/facebook.svg";
import instagram_svg from "../../icons/instagram.svg";

const Footer = ({ children }) => {
  return (
    <>
      {/* <footer>
      <img src={react_svg} alt="React logo" />
      <h3>{children}</h3>
      <img src={vite_svg} alt="Vite logo" />
    </footer> */}

      <footer>
        <div className="footer_container footer_left_container">
          <div className="footer_sub_container beacon_1">1-888-NUT-SPOT</div>
          <div className="footer_sub_container beacon_2">
            The Nut Spot <br />
            123 Old Oak Street <br />
            New Heights, NL 4A1 2B3
          </div>
        </div>
        <div className="footer_container footer_right_container">
          <div className="footer_sub_container face_1">Follow us</div>
          <div className="footer_sub_container face_2">
            <a href="https://www.facebook.com" target="_blank">
              <img src={facebook_svg} alt="Facebook" />{" "}
            </a>
            &nbsp;
            <a href="https://www.instagram.com" target="_blank">
              <img src={instagram_svg} alt="Instagram" />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
