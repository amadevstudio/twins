export const config = [
  {
    queue_name: "searchQuerySubscription",
    name: "searchQuerySubscription",
    data: {},
    repeat: { every: 10_000 }, // pattern: '0 15 3 * * *', // limit: 100,
  },
];
