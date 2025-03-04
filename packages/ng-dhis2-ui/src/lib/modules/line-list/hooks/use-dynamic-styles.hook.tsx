import { set } from "lodash";
import { useEffect, useState, useRef } from "react";

// Helper function to generate a unique class name
const generateClassName = (base: string) =>
  `${base}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to convert camelCased properties to hyphenated CSS properties
const convertStylesToCSS = (
  className: string,
  styles: React.CSSProperties | any
) => {
  let cssString = `.${className} {`;
  for (const key in styles) {
    if (typeof styles[key] === "object" && key.startsWith("@media")) {
      const mediaStyles = convertStylesToCSS(className, styles[key]);
      cssString += `${key} { ${mediaStyles} }`;
    } else if (key.startsWith("&:")) {
      const pseudoClass = key.replace("&", "");
      cssString += `${pseudoClass} { ${convertStylesToCSS("", styles[key])} }`;
    } else {
      const cssKey = key.replace(
        /[A-Z]/g,
        (match) => `-${match.toLowerCase()}`
      );
      cssString += `${cssKey}: ${styles[key]}; `;
    }
  }
  cssString += "}";
  return cssString;
};

// Custom hook for dynamic styles with generics

export const useDynamicStyles = <
  T extends Record<string, React.CSSProperties | any>
>(
  stylesObj: T
) => {
  const [classNames, setClassNames] = useState<{ [K in keyof T]: string }>(
    {} as { [K in keyof T]: string }
  );
  useEffect(() => {
    const convertedStyles = Object.keys(stylesObj).map((key) => {
      const className = generateClassName(key);
      const styleElement = document.createElement("style");
      styleElement.innerHTML = convertStylesToCSS(className, stylesObj[key]);
      document.head.appendChild(styleElement);

      return {
        key,
        className,
        styleElement,
      };
    });

    setClassNames(
      convertedStyles.reduce((classNameEntity, convertedStyle) => {
        return {
          ...classNameEntity,
          [convertedStyle.key]: convertedStyle.className,
        };
      }, {} as { [K in keyof T]: string })
    );

    return () => {
      convertedStyles.forEach((convertedStyle) => {
        document.head.removeChild(convertedStyle.styleElement);
      });
    };
  }, []);

  return classNames;
};
