import { UserAvatar } from '@dhis2-ui/user-avatar';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { DebugInfoModal } from './debug-info/debug-info-modal';
import { ProfileMenu } from './profile-menu';
import { useOnDocClick } from './profile/use-on-doc-click';
declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

const Profile = (params: any) => {
  const { name, email, avatarId, helpUrl } = params;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDebugInfoModal, setShowDebugInfoModal] = useState(false);
  const hideProfileMenu = useCallback(
    () => setShowProfileMenu(false),
    [setShowProfileMenu]
  );
  const toggleProfileMenu = useCallback(
    () => setShowProfileMenu((show) => !show),
    [setShowProfileMenu]
  ) as any;
  const containerRef = useRef(null);

  useOnDocClick(containerRef, hideProfileMenu);

  return (
    <div
      ref={containerRef}
      data-test="headerbar-profile"
      className="headerbar-profile"
    >
      <button className="headerbar-profile-btn" onClick={toggleProfileMenu}>
        <UserAvatar
          avatarId={avatarId}
          name={name}
          dataTest="headerbar-profile-icon"
          medium
        />
      </button>

      {showProfileMenu && (
        <ProfileMenu
          avatarId={avatarId}
          name={name}
          email={email}
          helpUrl={helpUrl}
          hideProfileMenu={hideProfileMenu}
          showDebugInfoModal={() => {
            setShowDebugInfoModal(true);
          }}
        />
      )}
      {showDebugInfoModal && (
        <DebugInfoModal
          onClose={() => {
            setShowDebugInfoModal(false);
          }}
        />
      )}

      <style jsx>{`
        .headerbar-profile {
          position: relative;
          height: 100%;
        }

        .headerbar-profile-btn {
          background: transparent;
          padding: 6px;
          border: 0;
          cursor: pointer;
        }
        .headerbar-profile-btn:focus {
          outline: 2px solid white;
          outline-offset: -2px;
        }
        .headerbar-profile-btn:focus:not(:focus-visible) {
          outline: none;
        }
        .headerbar-profile-btn:hover {
          background: #1a557f;
        }
        .headerbar-profile-btn:active {
          background: #104067;
        }
      `}</style>
    </div>
  );
};

Profile.propTypes = {
  name: PropTypes.string.isRequired,
  avatarId: PropTypes.string,
  email: PropTypes.string,
  helpUrl: PropTypes.string,
};

export default Profile;
