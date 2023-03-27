import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import type { RootState, TypedDispatch } from "@src/ui/store/configureAppStore";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = (): TypedDispatch => useDispatch<TypedDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
