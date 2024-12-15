import sequence_scroll_img from "../../images/nut_sequence_scroll.jpg";

const ALT_TEXT = "THE NUT SPOT Scrolling Image";

function Header() {
  return (
    <header>
      <div className="sequence_scroll_div">
        <div className="inner_scroll_div">
          {Array.from({ length: 3 }).map((element, index) => (
            <img
              key={index}
              src={sequence_scroll_img}
              alt={ALT_TEXT}
              className="scrolling_image"
            />
          ))}
        </div>
      </div>
      {/* <div className="header_nut_angle_overlay_0"></div> */}
      <div className="header_text_overlay">
        <h1 className="header_text">The Nut Spot</h1>
      </div>
      <div className="header_nut_overlay"></div>
      <div className="header_nut_angle_overlay_1"></div>
      <div className="header_nut_angle_overlay_2"></div>
    </header>
  );
}

export default Header;
