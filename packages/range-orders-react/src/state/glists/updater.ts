import { useAllLists } from "./hooks";
import { useCallback, useEffect } from "react";
import { useFetchListCallback } from "../../hooks/useFetchListCallback";
import useInterval from "../../hooks/useInterval";
import useIsWindowVisible from "../../hooks/useIsWindowVisible";
import { useWeb3 } from "../../web3";
import {
  DEFAULT_LIST_OF_LISTS_BSC,
  DEFAULT_LIST_OF_LISTS_MAINNET,
  DEFAULT_LIST_OF_LISTS_MATIC,
  DEFAULT_LIST_OF_LISTS_AVALANCHE,
} from "../../constants/lists";
import { useDispatch } from "react-redux";
import { AppDispatch } from "..";
import { addList, removeList } from "./actions";

export default function Updater(): null {
  const { library, chainId } = useWeb3();

  const isWindowVisible = useIsWindowVisible();

  const dispatch = useDispatch<AppDispatch>();

  // get all loaded lists, and the active urls
  const lists = useAllLists();

  const fetchList = useFetchListCallback();
  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return;
    if (!library) return;
    Object.keys(lists).forEach((url) =>
      fetchList(library, url).catch((error) =>
        console.debug("interval list fetching error", error)
      )
    );
  }, [fetchList, isWindowVisible, lists, library]);

  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, library ? 1000 * 60 * 10 : null);

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl];
      if (!list.current && !list.loadingRequestId && !list.error) {
        if (!library) return;
        fetchList(library, listUrl).catch((error) =>
          console.debug("list added fetching error", error)
        );
      }
    });
  }, [fetchList, library, lists]);

  useEffect(() => {
    if (!chainId || !library || Object.keys(lists).length) return;

    const urlList =
      chainId === 56
        ? DEFAULT_LIST_OF_LISTS_BSC
        : chainId === 137
        ? DEFAULT_LIST_OF_LISTS_MATIC
        : chainId === 43114
        ? DEFAULT_LIST_OF_LISTS_AVALANCHE
        : DEFAULT_LIST_OF_LISTS_MAINNET;

    urlList.forEach((listURL: string) => {
      fetchList(library, listURL)
        .then(() => {
          dispatch(addList(listURL));
        })
        .catch(() => {
          dispatch(removeList(listURL));
        });
    });
  }, [chainId, dispatch, fetchList, library, lists]);

  useEffect(() => {
    if (!chainId || !library) return;

    if (Object.keys(lists).length) {
      if (
        chainId === 56 &&
        !Object.keys(lists).includes(
          DEFAULT_LIST_OF_LISTS_BSC[DEFAULT_LIST_OF_LISTS_BSC.length - 1]
        )
      ) {
        DEFAULT_LIST_OF_LISTS_BSC.forEach((listURL: string) => {
          fetchList(library, listURL)
            .then(() => {
              dispatch(addList(listURL));
            })
            .catch(() => {
              dispatch(removeList(listURL));
            });
        });
      } else if (
        chainId === 137 &&
        !Object.keys(lists).includes(
          DEFAULT_LIST_OF_LISTS_MATIC[DEFAULT_LIST_OF_LISTS_MATIC.length - 1]
        )
      ) {
        DEFAULT_LIST_OF_LISTS_MATIC.forEach((listURL: string) => {
          fetchList(library, listURL)
            .then(() => {
              dispatch(addList(listURL));
            })
            .catch(() => {
              dispatch(removeList(listURL));
            });
        });
      } else if (
        chainId === 43114 &&
        !Object.keys(lists).includes(
          DEFAULT_LIST_OF_LISTS_AVALANCHE[
            DEFAULT_LIST_OF_LISTS_AVALANCHE.length - 1
          ]
        )
      ) {
        DEFAULT_LIST_OF_LISTS_AVALANCHE.forEach((listURL: string) => {
          fetchList(library, listURL)
            .then(() => {
              dispatch(addList(listURL));
            })
            .catch(() => {
              dispatch(removeList(listURL));
            });
        });
      } else if (
        chainId === 1 &&
        !Object.keys(lists).includes(
          DEFAULT_LIST_OF_LISTS_MAINNET[
            DEFAULT_LIST_OF_LISTS_MAINNET.length - 1
          ]
        )
      ) {
        DEFAULT_LIST_OF_LISTS_MAINNET.forEach((listURL: string) => {
          fetchList(library, listURL)
            .then(() => {
              dispatch(addList(listURL));
            })
            .catch(() => {
              dispatch(removeList(listURL));
            });
        });
      } else return;
    }
  }, [chainId, dispatch, fetchList, library, lists]);

  return null;
}
