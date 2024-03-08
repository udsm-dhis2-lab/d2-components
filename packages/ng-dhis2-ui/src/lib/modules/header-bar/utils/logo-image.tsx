import { LogoIconWhite } from '@dhis2-ui/logo';
import { useDataQuery } from '@dhis2/app-runtime';
import React from 'react';
declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

const query = {
  customLogo: {
    resource: 'staticContent/logo_banner',
  },
};

const pathExists = (data: any) =>
  data &&
  data.customLogo &&
  data.customLogo.images &&
  data.customLogo.images.png;

export const LogoImage = () => {
  const { loading, error, data } = useDataQuery(query) as any;

  if (loading) {
    return null;
  }

  let Logo;
  if (!error && pathExists(data)) {
    Logo = <img alt="Headerbar Logo" src={data.customLogo.images.png} />;
  } else {
    Logo = <LogoIconWhite />;
  }

  return (
    <div className="header-bar-logo">
      {Logo}
      <style jsx>{`
        .header-bar-logo {
          min-width: 48px;
          max-width: 250px;
          height: 48px;
          display: flex;
          -webkit-box-pack: center;
          justify-content: center;
          -webkit-box-align: center;
          align-items: center;
          overflow: hidden;
        }

        .header-bar-logo svg {
          height: 25px;
          width: 27px;
        }

        .header-bar-logo img {
          max-height: 100%;
          min-height: auto;
          width: auto;
        }
      `}</style>
    </div>
  );
};
