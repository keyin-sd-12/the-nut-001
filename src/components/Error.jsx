import { useState } from "react";

function Error({ error_message }) {
  return (
    <div
      className={
        error_message.length > 0 ? "error_message" : "error_message hidden"
      }
    >
      {error_message.map((message, index) => (
        <div key={index} className="single_error_message">
          {message}
        </div>
      ))}
    </div>
  );
}

export default Error;
