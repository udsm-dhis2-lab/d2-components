import {
    useDhis2ConnectionStatus,
    useOnlineStatusMessage,
} from '@dhis2/app-runtime'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '@dhis2/d2-i18n'
import { colors, spacers } from '@dhis2/ui-constants'
declare module 'react' {
    interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
      jsx?: boolean;
      global?: boolean;
    }
  }



/** A badge to display online/offline status in the header bar */
export function OnlineStatus(params: any) {
    const { dense } = params;
    const { isConnected: online } = useDhis2ConnectionStatus()
    const { onlineStatusMessage } = useOnlineStatusMessage()

    const displayStatus = online ? i18n.t('Online') : i18n.t('Offline')

    return (
        <div
            className={cx('container', dense ? 'bar' : 'badge')}
            data-test="headerbar-online-status"
        >
            {onlineStatusMessage && !dense && (
                <span className="info unselectable">{onlineStatusMessage}</span>
            )}
            <div className={cx('icon', online ? 'online' : 'offline')}></div>
            <span className="label unselectable">{displayStatus}</span>
            {onlineStatusMessage && dense && (
                <span className="info-dense unselectable">
                    {onlineStatusMessage}
                </span>
            )}
            <style jsx>{` .container {
        display: flex;
        align-items: center;
        justify-content: center; // new
        background-color: #104167;
        flex-shrink: 0; // ?
        color: ${colors.grey100};
    }

    .container.badge {
        margin-right: ${spacers.dp8};
        padding: ${spacers.dp8};
        border-radius: 5px;
        font-size: 14px;
    }

    .container.bar {
        display: none;
        padding: 0px ${spacers.dp4};
        min-height: 24px;
        font-size: 13px;
    }

    @media (max-width: 480px) {
        .container.badge {
            display: none;
        }

        .container.bar {
            display: flex;
        }
    }

    .unselectable {
        cursor: default;
        user-select: none;
    }

    .info {
        margin-right: ${spacers.dp16};
    }

    .info-dense {
        margin-left: ${spacers.dp12};
        font-size: 12px;
    }

    .icon {
        width: 8px;
        min-width: 8px;
        height: 8px;
        border-radius: 8px;
        margin-right: ${spacers.dp4};
    }

    .icon.online {
        background-color: ${colors.teal400};
    }

    .icon.offline {
        background-color: transparent;
        border: 1px solid ${colors.yellow300};
    }

    .icon.reconnecting {
        background: ${colors.grey300};
        -webkit-animation: fadeinout 2s linear infinite;
        animation: fadeinout 2s linear infinite;
        opacity: 0;
    }

    @-webkit-keyframes fadeinout {
        50% {
            opacity: 1;
        }
    }

    @keyframes fadeinout {
        50% {
            opacity: 1;
        }
    }

    .label {
        letter-spacing: 0.5px;
    }`}</style>
        </div>
    )
}
OnlineStatus.propTypes = {
    /** If true, displays as a sub-bar instead of a badge */
    dense: PropTypes.bool,
}
