import { useEffect, useState } from "react";

export default function useInfiniteScroll({
  fetchMoreCallback,
  offset,
  isFetching,
  hasMore,
  triggerDistance = 500,
}) {
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - triggerDistance;

      if (nearBottom && !isFetching && hasMore) {
        fetchMoreCallback();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset, isFetching, hasMore]);
}