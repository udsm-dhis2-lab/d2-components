import { UserAvatar } from '@dhis2-ui/user-avatar'
import { useConfig } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React from 'react'
import { joinPath } from '../join-path'
import i18n from '@dhis2/d2-i18n'
declare module 'react' {
    interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
      jsx?: boolean;
      global?: boolean;
    }
  }

const ProfileName = (params: any) => {
    const { children } = params;
    return  (
    <div className="headerbar-profile-username" data-test="headerbar-profile-username">
        {children}

        <style jsx>{`
            .headerbar-profile-username {
                margin-bottom: 3px;
                font-size: 16px;
                line-height: 19px;
            }
        `}</style>
    </div>
) }
ProfileName.propTypes = {
    children: PropTypes.string,
}

const ProfileEmail = (params: any) => {
    const { children } = params;
    return (
        <div className="headerbar-profile-user-email" data-test="headerbar-profile-user-email">
            {children}
    
            <style jsx>{`
                .headerbar-profile-user-email {
                    margin-bottom: 6px;
                    font-size: 14px;
                    line-height: 16px;
                }
            `}</style>
        </div>
    )
}
ProfileEmail.propTypes = {
    children: PropTypes.string,
}

const ProfileEdit = (params: any) => {
    const { children } = params;
    const { baseUrl } = useConfig()

    return (
        <a
            className="headerbar-profile-edit-profile-link"
            href={joinPath(baseUrl, 'dhis-web-user-profile/#/profile')}
            data-test="headerbar-profile-edit-profile-link"
        >
            {children}

            <style jsx>{`
                .headerbar-profile-edit-profile-link {
                    color: rgba(0, 0, 0, 0.87);
                    font-size: 12px;
                    line-height: 14px;
                    text-decoration: underline !important;
                    cursor: pointer;
                }
            `}</style>
        </a>
    )
}

ProfileEdit.propTypes = {
    children: PropTypes.string,
}

const ProfileDetails = (params: any) => {
    const { name, email } = params;
    return (
        <div className="headerbar-profile-details">
            <ProfileName>{name}</ProfileName>
            <ProfileEmail>{email}</ProfileEmail>
            <ProfileEdit>{i18n.t('Edit profile')}</ProfileEdit>
    
            <style jsx>{`
                .headerbar-profile-details {
                    display: flex;
                    flex-direction: column;
                    margin-left: 20px;
                    color: #000;
                    font-size: 14px;
                    font-weight: 400;
                }
            `}</style>
        </div>
    )
}

ProfileDetails.propTypes = {
    email: PropTypes.string,
    name: PropTypes.string,
}

export const ProfileHeader = (params: any) => {
    const { name, email, avatarId } = params;
    return (<div className="headerbar-profile-header">
        <UserAvatar
            avatarId={avatarId}
            name={name}
            dataTest="headerbar-profile-menu-icon"
            large
        />
        <ProfileDetails name={name} email={email} />

        <style jsx>{`
            .headerbar-profile-header {
                display: flex;
                flex-direction: row;
                margin-left: 24px;
                padding-top: 20px;
            }
        `}</style>
    </div>
) }

ProfileHeader.propTypes = {
    avatarId: PropTypes.string,
    email: PropTypes.string,
    name: PropTypes.string,
}
