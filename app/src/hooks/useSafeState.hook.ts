'use client';
import { Dispatch, SetStateAction, useState, useCallback, useRef, useEffect } from 'react';

export function useSafeState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
export function useSafeState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>]
export function useSafeState(initialState?: unknown) {
    const unmountedRef = useComponentIsUnmounted();
    const [state, setState] = useState(initialState);

    const setCurrentState = useCallback(
        (currentState: unknown) => {
            if (unmountedRef.current) return;

            setState(currentState);
        },
        [unmountedRef]
    );

    return [state, setCurrentState] as const;
}

export const useComponentIsUnmounted = () => {
    const ref = useRef(false);

    useEffect(
        () => {
            ref.current = false;

            return () => {
                ref.current = true;
            };
        },
        []
    );

    return ref;
};
