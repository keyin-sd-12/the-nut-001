// I looked up the ...rest operator to pass the rest of the props to the button element.
// this way I can add other attributes to the button element without modifying Button() component.
function Button({ children, on_click, class_name, disabled, ...rest }) {
  const style = {
    cursor: disabled ? "not-allowed" : "pointer",
  };
  return (
    <button
      className={class_name}
      onClick={on_click}
      disabled={disabled}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
}
export default Button;
