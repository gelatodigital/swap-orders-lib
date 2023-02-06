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
  DEFAULT_LIST_OF_LISTS_CRO,
  DEFAULT_ACTIVE_LIST_URLS,
} from "../../constants/lists";
import { useDispatch } from "react-redux";
import { AppDispatch } from "..";
import { addList, removeList, enableList } from "./actions";

let ERRORS = 0;
export default function Updater({
  includeTokenLists,
}: {
  includeTokenLists: string[];
}): null {
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

  // includeTokenLists
  useEffect(() => {
    if (!library || !includeTokenLists.length) return;
    includeTokenLists.forEach((listURL: string) => {
      fetchList(library, listURL)
        .then(() => {
          dispatch(addList(listURL));
          dispatch(enableList(listURL));
        })
        .catch((error) => {
          console.debug("list added fetching error", error);
          dispatch(removeList(listURL));
        });
    });
  }, [library, includeTokenLists]);

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
    if (!chainId || !library || Object.keys(lists).length || ERRORS > 5) return;

    const urlList =
      chainId === 25
        ? DEFAULT_LIST_OF_LISTS_CRO
        : chainId === 56
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
          if (
            DEFAULT_ACTIVE_LIST_URLS.includes(listURL) &&
            !includeTokenLists.length
          ) {
            dispatch(enableList(listURL));
          }
        })
        .catch((error) => {
          ERRORS++;
          console.debug(`Could not fetch token list ${listURL}`, error);
          dispatch(removeList(listURL));
        });
    });
  }, [chainId, dispatch, fetchList, library, lists]);

  useEffect(() => {
    if (!chainId || !library) return;

    if (Object.keys(lists).length) {
      if (
        chainId === 25 &&
        !Object.keys(lists).includes(
          DEFAULT_LIST_OF_LISTS_CRO[DEFAULT_LIST_OF_LISTS_CRO.length - 1]
        )
      ) {
        DEFAULT_LIST_OF_LISTS_CRO.forEach((listURL: string) => {
          fetchList(library, listURL)
            .then(() => {
              dispatch(addList(listURL));
            })
            .catch(() => {
              dispatch(removeList(listURL));
            });
        });
      } else if (
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

  // if any lists from unsupported lists are loaded, check them too (in case new updates since last visit)
  // useEffect(() => {
  //   UNSUPPORTED_LIST_URLS.forEach((listUrl) => {
  //     const list = lists[listUrl];
  //     if (!list || (!list.current && !list.loadingRequestId && !list.error)) {
  //       if (!library) return;
  //       fetchList(library, listUrl).catch((error) =>
  //         console.debug("list added fetching error", error)
  //       );
  //     }
  //   });
  // }, [dispatch, fetchList, library, lists]);

  // // automatically update lists if versions are minor/patch
  // useEffect(() => {
  //   Object.keys(lists).forEach((listUrl) => {
  //     const list = lists[listUrl];
  //     if (list.current && list.pendingUpdate) {
  //       const bump = getVersionUpgrade(
  //         list.current.version,
  //         list.pendingUpdate.version
  //       );
  //       switch (bump) {
  //         case VersionUpgrade.NONE:
  //           throw new Error("unexpected no version bump");
  //         case VersionUpgrade.PATCH:
  //         case VersionUpgrade.MINOR:
  //           // eslint-disable-next-line no-case-declarations
  //           const min = minVersionBump(
  //             list.current.tokens,
  //             list.pendingUpdate.tokens
  //           );
  //           // automatically update minor/patch as long as bump matches the min update
  //           if (bump >= min) {
  //             dispatch(acceptListUpdate(listUrl));
  //           } else {
  //             console.error(
  //               `List at url ${listUrl} could not automatically update because the version bump was only PATCH/MINOR while the update had breaking changes and should have been MAJOR`
  //             );
  //           }
  //           break;

  //         // update any active or inactive lists
  //         case VersionUpgrade.MAJOR:
  //           dispatch(acceptListUpdate(listUrl));
  //       }
  //     }
  //   });
  // }, [dispatch, lists, activeListUrls]);

  return null;
}
