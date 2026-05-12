import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock.jsx";

export default function Markdown({ children }) {
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          a: (props) => <a target="_blank" rel="noopener noreferrer" {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
