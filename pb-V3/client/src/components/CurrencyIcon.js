import React, { memo } from "react";
import { capitalize } from "@material-ui/core";

// Get icons from
// https://github.com/spothq/cryptocurrency-icons/tree/master/svg/color

const CurrencyIcon = (props) => {
  const { currency, color, variant, size = "small", ...other } = props;
  const lowerCasedCurrency = currency ? currency.toLowerCase() : "";

  let svg = null;
  switch (lowerCasedCurrency) {
    case "btc":
      svg = (
        <svg
          {...other}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className={`MuiSvgIcon-root MuiSvgIcon-fontSize${capitalize(size)}`}
        >
          <g fill="none" fillRule="evenodd">
            <circle
              cx="16"
              cy="16"
              r="16"
              fill={variant === "transparent" ? "transparent" : "#1A3B49"}
            />
            <path
              fill={color || "#FFF"}
              fillRule="nonzero"
              d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
            />
          </g>
        </svg>
      );
      break;
    case "eth":
      svg = (
        <svg
          {...other}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className={`MuiSvgIcon-root MuiSvgIcon-fontSize${capitalize(size)}`}
        >
          <g fill="none" fillRule="evenodd">
            <circle
              cx="16"
              cy="16"
              r="16"
              fill={variant === "transparent" ? "transparent" : "#1A3B49"}
            />
            <g fill={color || "#FFF"} fillRule="nonzero">
              <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
              <path d="M16.498 4L9 16.22l7.498-3.35z" />
              <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
              <path d="M16.498 27.995v-6.028L9 17.616z" />
              <path
                fillOpacity=".2"
                d="M16.498 20.573l7.497-4.353-7.497-3.348z"
              />
              <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
            </g>
          </g>
        </svg>
      );
      break;
    case "usdt":
      svg = (
        <svg
          {...other}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className={`MuiSvgIcon-root MuiSvgIcon-fontSize${capitalize(size)}`}
        >
          <g fill="none" fillRule="evenodd">
            <circle
              cx="16"
              cy="16"
              r="16"
              fill={variant === "transparent" ? "transparent" : "#26A17B"}
            />
            <path
              fill={color || "#FFF"}
              fillRule="nonzero"
              d="M17.922 17.383v-.002c-.11.007-.677.042-1.942.042-1.01 0-1.724-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.808-.05 1.925-.06v-2.643c3.88.163 6.775.86 6.775 1.658 0 .81-2.795 1.479-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.043 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.113 0-1.043-3.301-1.914-7.694-2.117"
            />
          </g>
        </svg>
      );
      break;
    case "usd":
      svg = (
        <svg
          {...props}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className={`MuiSvgIcon-root MuiSvgIcon-iconSize${capitalize(size)}`}
        >
          <g fill="none" fillRule="evenodd">
            <circle cx="16" cy="16" r="16" />
            <path
              d="M22.5 19.154c0 2.57-2.086 4.276-5.166 4.533V26h-2.11v-2.336A11.495 11.495 0 019.5 21.35l1.552-2.126c1.383 1.075 2.692 1.776 4.269 2.01v-4.58c-3.541-.888-5.19-2.173-5.19-4.813 0-2.523 2.061-4.252 5.093-4.486V6h2.11v1.402a9.49 9.49 0 014.56 1.776l-1.359 2.196c-1.067-.771-2.158-1.262-3.298-1.495v4.439c3.687.888 5.263 2.313 5.263 4.836zm-7.18-5.327V9.715c-1.527.117-2.327.935-2.327 1.963 0 .98.46 1.612 2.328 2.15zm4.318 5.49c0-1.05-.51-1.681-2.401-2.219v4.23c1.528-.118 2.401-.889 2.401-2.01z"
              fill={color || "currentColor"}
            />
          </g>
        </svg>
      );
      break;
    default:
      break;
  }
  return svg;
};

export default memo(CurrencyIcon);
