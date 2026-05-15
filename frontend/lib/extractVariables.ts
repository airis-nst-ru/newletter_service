export function extractVariables(
  html: string
) {
  const regex =
    /\{\{(.*?)\}\}/g;

  const matches = [
    ...html.matchAll(regex),
  ];

  const uniqueVariables =
    Array.from(
      new Set(
        matches.map((match) =>
          match[1].trim()
        )
      )
    );

  return uniqueVariables;
}