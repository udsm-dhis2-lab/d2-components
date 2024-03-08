import { useConfig } from '@dhis2/app-runtime';
import React from 'react';
import { LogoImage } from './logo-image';
declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

interface LogoProp {
  baseUrl: string;
}

export const Logo = ({ baseUrl }: LogoProp) => {
  return (
    <div className="headerbar-logo" data-test="headerbar-logo">
      <a href={baseUrl}>
        <LogoImage />
      </a>

      <style jsx>{`
        .headerbar-logo {
          box-sizing: border-box;
          min-width: 49px;
          max-height: 48px;
          margin: 0 12px 0 0;
          border-right: 1px solid rgba(32, 32, 32, 0.15);
        }
        .headerbar-logo:hover {
          background-color: #1a557f;
        }

        .headerbar-logo a,
        .headerbar-logo a:hover,
        .headerbar-logo a:focus,
        .headerbar-logo a:active,
        .headerbar-logo a:visited {
          user-select: none;
        }
        .headerbar-logo a:focus {
          outline: 2px solid white;
          outline-offset: -2px;
        }
        .headerbar-logo a:focus:not(:focus-visible) {
          outline: none;
        }
      `}</style>
    </div>
  );
};
