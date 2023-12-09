import { useEffect, useMemo } from 'react'

export const useOnDocClick = (containerRef: any, hide: any) => {
    const onDocClick = useMemo(() => {
        return (evt: any) => {
            if (!containerRef.current) {
                return null
            }

            if (!containerRef.current.contains(evt.target)) {
                hide()
            }

            return null;
        }
    }, [containerRef, hide])

    useEffect(() => {
        document.addEventListener('click', onDocClick)

        return () => {
            document.removeEventListener('click', onDocClick)
        }
    }, [onDocClick])
}
