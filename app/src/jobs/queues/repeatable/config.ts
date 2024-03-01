export const config = [
  {
    queue_name: "searchQuerySubscription",
    name: "bird",
    data: { color: "bird" },
    repeat: { every: 1000 }, // pattern: '0 15 3 * * *', // limit: 100,
  },
];
