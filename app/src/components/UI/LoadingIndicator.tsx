'use client'
import { useEffect, useRef } from 'react'
import { useLinkStatus } from 'next/link'
import Box from '@mui/material/Box'
import { useSafeState } from '@/hooks/useSafeState.hook'

export const LoadingIndicator = ({ delay = 100 }: { delay?: number }) => {
    const { pending } = useLinkStatus()
    const [visible, setVisible] = useSafeState(false)
    const prevPendingRef = useRef<boolean>(false)

    useEffect(
        () => {
            let showTimer: ReturnType<typeof setTimeout> | null = null
            let hideTimer: ReturnType<typeof setTimeout> | null = null

            if (pending) {
                showTimer = setTimeout(() => setVisible(true), delay)
            } else if (prevPendingRef.current) {
                // only hide when we were previously pending
                hideTimer = setTimeout(() => setVisible(false), 0)
            }

            prevPendingRef.current = pending

            return () => {
                if (showTimer) clearTimeout(showTimer)
                if (hideTimer) clearTimeout(hideTimer)
            }
        },
        [pending, delay, setVisible]
    )

    return (
        <Box
            component="span"
            aria-hidden
            sx={{
                ml: 1,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'text.primary',
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1)' : 'scale(0.8)',
                transition: 'opacity 140ms ease, transform 140ms ease',
                display: 'inline-block',
            }}
        />
    )
}

export default LoadingIndicator