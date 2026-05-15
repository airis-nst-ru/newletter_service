export function renderVariables(
  html: string,
  variables: Record<
    string,
    string
  >
) {
  return html.replace(
    /\{\{(.*?)\}\}/g,
    (_, key) => {
      const cleanKey =
        key.trim();

      return (
        variables[cleanKey] || ""
      );
    }
  );
}