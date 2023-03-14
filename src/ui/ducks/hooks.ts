import { useDispatch } from "react-redux";

import type { TypedDispatch } from "@src/ui/store/configureAppStore";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = (): TypedDispatch => useDispatch<TypedDispatch>();
