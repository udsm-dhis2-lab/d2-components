import { set } from 'lodash';
import { useEffect, useState, useRef } from 'react';

const generateClassName = (base: string) =>
  `${base}-${Math.random().toString(36).substr(2, 9)}`;

const convertStylesToCSS = (
  className: string,
  styles: any,
  parentSelector = ''
): string => {
  let cssString = '';
  let mainBlock = parentSelector ? `${parentSelector} {` : `.${className} {`;

  for (const key in styles) {
    const value = styles[key];

    if (typeof value === 'object') {
      if (key.startsWith('@media')) {
        // Handle media queries
        cssString += `${key} { ${convertStylesToCSS(
          className,
          value,
          `.${className}`
        )} }`;
      } else if (key.startsWith('&')) {
        // Handle pseudo-classes and nested selectors
        const selector = key.replace('&', `.${className}`);
        cssString += convertStylesToCSS(className, value, selector);
      } else {
        // Handle nested elements (e.g., '& > div')
        cssString += convertStylesToCSS(
          className,
          value,
          `.${className} ${key}`
        );
      }
    } else {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(
        /[A-Z]/g,
        (match) => `-${match.toLowerCase()}`
      );
      mainBlock += `${cssKey}: ${value}; `;
    }
  }

  mainBlock += '}';
  return mainBlock + ' ' + cssString;
};

// Custom hook for dynamic styles
export const useDynamicStyles = <T extends Record<string, any>>(
  stylesObj: T
) => {
  const [classNames, setClassNames] = useState<{ [K in keyof T]: string }>(
    {} as any
  );

  useEffect(() => {
    const styleElements: HTMLStyleElement[] = [];
    const generatedClassNames = Object.keys(stylesObj).reduce((acc, key) => {
      const className = generateClassName(key);
      const styleElement = document.createElement('style');
      styleElement.innerHTML = convertStylesToCSS(className, stylesObj[key]);
      document.head.appendChild(styleElement);
      styleElements.push(styleElement);
      acc[key as keyof T] = className;
      return acc;
    }, {} as { [K in keyof T]: string });

    setClassNames(generatedClassNames);

    return () => {
      styleElements.forEach((el) => document.head.removeChild(el));
    };
  }, [stylesObj]);

  return classNames;
};
