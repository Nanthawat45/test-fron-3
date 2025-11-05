import React from "react";

const Label = ({ className = "", children, ...props }) => {
  return (
    <label className={["text-sm font-medium leading-none mb-1 block", className].join(" ")} {...props}>
      {children}
    </label>
  );
};

export default Label;
