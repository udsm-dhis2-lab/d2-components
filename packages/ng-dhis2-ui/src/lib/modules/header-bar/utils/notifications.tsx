import { useConfig } from '@dhis2/app-runtime';
import PropTypes from 'prop-types';
import React from 'react';
import { joinPath } from './join-path';
import { NotificationIcon } from './notification-icon';
declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

/*
 AUTHORITIES:
 - ALL: superuser
 - M_dhis-web-interpretation: access to interpretations app
 - M_dhis-web-messaging: access to messaging app
 */

const hasAuthority = (userAuthorities: any, authId: string) =>
  Array.isArray(userAuthorities) &&
  userAuthorities.some(
    (userAuthId) => userAuthId === 'ALL' || userAuthId === authId
  );

export const Notifications = (params: any) => {
  const { interpretations, messages, userAuthorities } = params;
  const { baseUrl } = useConfig();

  return (
    <div
      className="headerbar-notifications"
      data-test="headerbar-notifications"
    >
      {hasAuthority(userAuthorities, 'M_dhis-web-interpretation') && (
        <NotificationIcon
          count={interpretations}
          href={joinPath(baseUrl, 'dhis-web-interpretation')}
          kind="message"
          dataTestId="headerbar-interpretations"
        />
      )}

      {hasAuthority(userAuthorities, 'M_dhis-web-messaging') && (
        <NotificationIcon
          message="email"
          count={messages}
          href={joinPath(baseUrl, 'dhis-web-messaging')}
          kind="interpretation"
          dataTestId="headerbar-messages"
        />
      )}

      <style jsx>{`
        .headerbar-notifications {
          user-select: none;
          display: flex;
          flex-direction: row;
          align-items: center;
          height: 100%;
        }
      `}</style>
    </div>
  );
};

Notifications.propTypes = {
  interpretations: PropTypes.number,
  messages: PropTypes.number,
  userAuthorities: PropTypes.arrayOf(PropTypes.string),
};
