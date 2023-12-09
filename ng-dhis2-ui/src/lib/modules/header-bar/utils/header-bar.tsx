import i18n from '@dhis2/d2-i18n';
import { colors } from '@dhis2/ui-constants';
import PropTypes from 'prop-types';
import React from 'react';
import { HeaderBarData } from '../models';
import Apps from './apps';
import { Logo } from './logo';
import { Notifications } from './notifications';
import { OnlineStatus } from './online-status';
import Profile from './profile';
import { Title } from './title';

interface HeaderBarProp {
  appName: string;
  data: HeaderBarData;
  className?: string;
}

export const HeaderBar = ({ appName, data, className }: HeaderBarProp) => {
  const loading = false;
  const error = null;

  // See https://jira.dhis2.org/browse/LIBS-180
  if (!loading && !error) {
    // TODO: This will run every render which is probably wrong!
    // Also, setting the global locale shouldn't be done in the headerbar
    const locale = (data.user['settings'] as any)['keyUiLocale'] || 'en';
    i18n.setDefaultNamespace('default');
    i18n.changeLanguage(locale);
  }

  return (
    <header className={className}>
      <div className="main">
        {!loading && !error && (
          <>
            <Logo baseUrl="../../../" />

            <Title
              app={appName}
              instance={(data.title as any)['applicationTitle']}
            />

            <div className="right-control-spacer" />

            {/*TODO: Find better approach to handle PWA */}
            {/* {'pwaEnabled' && <OnlineStatus />} */}

            <Notifications
              interpretations={data.notifications.unreadInterpretations}
              messages={data.notifications.unreadMessageConversations}
              userAuthorities={data.user['authorities'] as any}
            />
            <Apps apps={data.apps} />

            <Profile
              name={data.user['name'] as string}
              email={data.user['email'] as string}
              avatarId={((data.user['avatar'] || {}) as any)['id']}
              helpUrl={data.help.helpPageLink}
            />
          </>
        )}
      </div>

      {/* {'pwaEnabled' && !loading && !error && <OnlineStatus dense />} */}

      <style jsx>{`
        .main {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          background-color: #2c6693;
          color: ${colors.white};
          height: 48px;
        }
        .right-control-spacer {
          margin-left: auto;
        }
      `}</style>
    </header>
  );
};

HeaderBar.propTypes = {
  appName: PropTypes.string,
  data: HeaderBarData,
  className: PropTypes.string,
  updateAvailable: PropTypes.bool,
  onApplyAvailableUpdate: PropTypes.func,
};
