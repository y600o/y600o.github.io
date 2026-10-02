import { resolvePostImage } from '../../scripts/post-assets.mjs';

interface MarkdownNode {
  type: string;
  url?: string;
  identifier?: string;
  children?: MarkdownNode[];
}

export default function remarkPostImages({ slug }: { slug: string }) {
  return (tree: MarkdownNode) => {
    const imageReferences = new Set<string>();
    const walk = (node: MarkdownNode, visit: (node: MarkdownNode) => void) => {
      visit(node);
      node.children?.forEach((child) => walk(child, visit));
    };
    walk(tree, (node) => {
      if (node.type === 'imageReference' && node.identifier) {
        imageReferences.add(node.identifier);
      }
    });
    walk(tree, (node) => {
      if (node.url && (node.type === 'image' ||
          (node.type === 'definition' && node.identifier && imageReferences.has(node.identifier)))) {
        node.url = resolvePostImage(node.url, slug);
      }
    });
  };
}
