import NewsletterEditor from "@/components/editor/NewsletterEditor";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditorPage(
  props: Props
) {
  const { id } = await props.params;

  return (
    <NewsletterEditor
      newsletterId={id}
    />
  );
}