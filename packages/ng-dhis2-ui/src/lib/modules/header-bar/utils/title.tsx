import PropTypes from 'prop-types';
import React from 'react';
declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

export const Title = (params: any) => {
  const { app, instance } = params;
  return (
    <div className="headerbar-title" data-test="headerbar-title">
      {app ? `${instance} - ${app}` : `${instance}`}

      <style jsx>{`
        .headerbar-title {
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};
Title.propTypes = {
  app: PropTypes.string,
  instance: PropTypes.string,
};
