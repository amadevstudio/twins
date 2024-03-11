export const QUEUE_NAMES = {
  SEARCH_QUERY_SUBSCRIPTION: "searchQuerySubscription"
}

export const config = [
  {
    queue_name: QUEUE_NAMES.SEARCH_QUERY_SUBSCRIPTION,
    name: "Search query subscription",
    data: {},
    repeat: { every: 10_000 }, // pattern: '0 15 3 * * *', // limit: 100,
  },
];
