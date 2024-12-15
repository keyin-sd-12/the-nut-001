import { useState } from "react";

function Loading({ loading_please_wait }) {
  return (
    <>
      <div className={loading_please_wait ? "loading" : "loading hidden"}>
        Loading, please, wait...
      </div>
    </>
  );
}

export default Loading;
