import produce, {
  Draft,
  nothing,
  freeze,
  createDraft,
  finishDraft,
  isDraftable,
} from "immer";
import { useState, useReducer, useCallback, useMemo, Dispatch } from "react";

export type Reducer<S = any, A = any> = (
  draftState: Draft<S>,
  action: A
) => void | (S extends undefined ? typeof nothing : S);
export type DraftFunction<S> = (draft: Draft<S>) => void;
export type Updater<S> = (arg: S | DraftFunction<S>) => void;
export type ImmerHook<S> = [S, Updater<S>];
export function useImmer<S = any>(initialValue: S | (() => S)): ImmerHook<S>;

export function useImmer(initialValue: any) {
  const [val, updateValue] = useState(() =>
    freeze(
      typeof initialValue === "function" ? initialValue() : initialValue,
      true
    )
  );
  return [
    val,
    useCallback((updater) => {
      if (typeof updater === "function") updateValue(produce(updater));
      else updateValue(freeze(updater));
    }, []),
  ];
}

export function useImmerReducer<S = any, A = any>(
  reducer: Reducer<S, A>,
  initialState: S,
  initialAction?: (initial: any) => S
): [S, Dispatch<A>];
export function useImmerReducer(
  reducer: any,
  initialState: any,
  initialAction: any
) {
  const cachedReducer = useMemo(() => produce(reducer), [reducer]);
  return useReducer(cachedReducer, initialState as any, initialAction);
}

export function useImmerDraft<S = any, A = any>(
  initialValue: S | (() => S)
): [Draft<S>, (newState?: S) => void];
export function useImmerDraft(initialValue: any) {
  const [val, updateValue] = useState(() =>
    freeze(
      typeof initialValue === "function" ? initialValue() : initialValue,
      true
    )
  );

  const draft = useMemo(
    () => (isDraftable(val) ? createDraft(val) : val),
    [val]
  );
  return [
    draft,
    (...args: any[]) =>
      updateValue(args.length ? freeze(args[0]) : finishDraft(draft)),
  ];
}
