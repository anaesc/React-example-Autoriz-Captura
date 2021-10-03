import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ loading, children, ...props }) => {
  return (
    <button
      className={`
        btn
        ${loading ? "btn--loading" : ""}
        ${props.className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <div className="spinner"></div> : children}
    </button>
  );
};

export default Button;
