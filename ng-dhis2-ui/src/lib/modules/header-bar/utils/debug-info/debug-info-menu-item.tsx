import { MenuItem } from '@dhis2-ui/menu';
import { colors } from '@dhis2/ui-constants';
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@dhis2/d2-i18n';
import { useDebugInfo } from './use-debug-info';
declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

export const DebugInfoMenuItem = (params: any) => {
  const { hideProfileMenu, showDebugInfoModal } = params;
  const debugInfo = useDebugInfo();

  const openDebugModal = () => {
    hideProfileMenu();
    showDebugInfoModal();
  };

  const debugInfoLabel = (
    <div className="root">
      <div
        className="instance-info version"
        data-test="dhis2-ui-headerbar-instanceinfo"
      >
        {debugInfo.dhis2_version
          ? i18n.t('DHIS2 {{dhis2Version}}', {
              dhis2Version: debugInfo.dhis2_version,
            })
          : i18n.t('DHIS2 version unknown')}
      </div>
      <div className="version" data-test="dhis2-ui-headerbar-appinfo">
        {debugInfo.app_name
          ? debugInfo.app_version
            ? `${debugInfo.app_name} ${debugInfo.app_version}`
            : i18n.t('{{appName}} version unknown', {
                appName: debugInfo.app_name,
              })
          : debugInfo.app_version
          ? i18n.t('App {{appVersion}}', {
              appVersion: debugInfo.app_version,
            })
          : i18n.t('App version unknown')}
        {}
      </div>
      <style jsx>{`
                .root {
                    color: ${colors.grey700};
                    font-style: italic;
                    font-size: 14px;
                    line-height: 17px;
                }
                .instance-info {
                    margin-bottom: 4px;
                }
                .version {
                    white-space: no-wrap;
                }
            `}</style>
    </div>
  );

  return (
    <MenuItem
      dense
      onClick={openDebugModal}
      label={debugInfoLabel}
      dataTest="dhis2-ui-headerbar-debuginfo"
    />
  );
};

DebugInfoMenuItem.propTypes = {
  hideProfileMenu: PropTypes.func.isRequired,
  showDebugInfoModal: PropTypes.func.isRequired,
};
