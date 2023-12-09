import PropTypes from 'prop-types'
import React, { createContext, useContext } from 'react'

const headerBarContext = createContext({
    updateAvailable: false,
    onApplyAvailableUpdate: () => {},
})

export const HeaderBarContextProvider = (params: any) => {
    const {
        updateAvailable,
        onApplyAvailableUpdate,
        children,
    } = params;
    return (
        <headerBarContext.Provider
            value={{ updateAvailable, onApplyAvailableUpdate }}
        >
            {children}
        </headerBarContext.Provider>
    )
}
HeaderBarContextProvider.propTypes = {
    children: PropTypes.node,
    updateAvailable: PropTypes.bool,
    onApplyAvailableUpdate: PropTypes.func,
}

export const useHeaderBarContext = () => useContext(headerBarContext)
