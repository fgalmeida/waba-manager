"use client";

import { PhonePreview } from "./PhonePreview";

interface TemplatePreviewProps {
  headerText?: string;
  headerFormat?: string;
  bodyText: string;
  bodyExamples?: string[];
  footerText?: string;
  buttons?: { type: string; text: string }[];
  compact?: boolean;
}

let globalKeyCounter = 0;
function nextKey(): string {
  return `k${++globalKeyCounter}`;
}

function renderWhatsAppBody(text: string, examples: string[]): React.ReactNode {
  if (!text) return <span key={nextKey()} className="text-gray-400 italic">(Mensagem do template)</span>;

  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|~(.+?)~|`(.+?)`|\{\{(\d+)\}\}/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      const plain = text.slice(last, match.index);
      splitLines(plain).forEach((node) => parts.push(node));
    }

    if (match[1] !== undefined) {
      parts.push(
        <strong key={nextKey()} className="font-bold">
          {renderVars(match[1], examples)}
        </strong>
      );
    } else if (match[2] !== undefined) {
      parts.push(
        <em key={nextKey()} className="italic">
          {renderVars(match[2], examples)}
        </em>
      );
    } else if (match[3] !== undefined) {
      parts.push(
        <s key={nextKey()} className="line-through">
          {renderVars(match[3], examples)}
        </s>
      );
    } else if (match[4] !== undefined) {
      parts.push(
        <code key={nextKey()} className="bg-black/10 px-1 rounded text-[11px] font-mono">
          {match[4]}
        </code>
      );
    } else if (match[5] !== undefined) {
      const idx = parseInt(match[5]) - 1;
      const example = examples[idx];
      parts.push(renderVariable(match[5], example));
    }

    last = regex.lastIndex;
  }

  if (last < text.length) {
    splitLines(text.slice(last)).forEach((node) => parts.push(node));
  }

  return <>{parts}</>;
}

function renderVariable(
  num: string,
  example: string | undefined
): React.ReactNode {
  if (example) {
    return (
      <span
        key={nextKey()}
        className="text-blue-600 font-semibold underline decoration-blue-300 decoration-2 underline-offset-3"
        title={`Variavel {{${num}}} → "${example}"`}
      >
        {example}
      </span>
    );
  }
  return (
    <span
      key={nextKey()}
      className="inline-flex items-center bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold border border-blue-200"
      title={`Variavel {{${num}}} — defina um exemplo`}
    >
      {`{{${num}}}`}
    </span>
  );
}

function renderVars(
  text: string,
  examples: string[]
): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\{\{(\d+)\}\}/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<span key={nextKey()}>{text.slice(last, match.index)}</span>);
    }
    const idx = parseInt(match[1]) - 1;
    const example = examples[idx];
    if (example) {
      parts.push(
        <span
          key={nextKey()}
          className="text-blue-600 font-semibold underline decoration-blue-300 decoration-2 underline-offset-3"
          title={`Variavel {{${match[1]}}} → "${example}"`}
        >
          {example}
        </span>
      );
    } else {
      parts.push(
        <span
          key={nextKey()}
          className="inline-flex items-center bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold border border-blue-200"
          title={`Variavel {{${match[1]}}} — defina um exemplo`}
        >
          {`{{${match[1]}}}`}
        </span>
      );
    }
    last = regex.lastIndex;
  }

  if (last < text.length) {
    parts.push(<span key={nextKey()}>{text.slice(last)}</span>);
  }

  return <>{parts}</>;
}

function splitLines(text: string): React.ReactNode[] {
  if (!text) return [];
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    if (i > 0) nodes.push(<br key={nextKey()} />);
    if (line) nodes.push(<span key={nextKey()}>{line}</span>);
  });
  return nodes;
}

function renderWhatsAppFooter(text: string, examples: string[]): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\{\{(\d+)\}\}/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<span key={nextKey()}>{text.slice(last, match.index)}</span>);
    }
    const idx = parseInt(match[1]) - 1;
    const example = examples[idx];
    if (example) {
      parts.push(
        <span key={nextKey()} className="text-blue-600 font-medium underline decoration-blue-300">
          {example}
        </span>
      );
    } else {
      parts.push(
        <span key={nextKey()} className="inline-flex items-center bg-blue-100 text-blue-700 px-1 rounded text-[9px] font-mono font-bold">
          {`{{${match[1]}}}`}
        </span>
      );
    }
    last = regex.lastIndex;
  }

  if (last < text.length) {
    parts.push(<span key={nextKey()}>{text.slice(last)}</span>);
  }

  return <>{parts}</>;
}

function renderWhatsAppHeader(
  text: string,
  format: string,
  examples: string[]
): React.ReactNode {
  if (format !== "TEXT") {
    return (
      <span className="italic text-muted-foreground">
        [{format} - {text || "midia"}]
      </span>
    );
  }

  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|~(.+?)~|\{\{(\d+)\}\}/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<span key={nextKey()}>{text.slice(last, match.index)}</span>);
    }

    if (match[1] !== undefined) {
      parts.push(
        <strong key={nextKey()} className="font-extrabold">
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      parts.push(
        <em key={nextKey()} className="italic">
          {match[2]}
        </em>
      );
    } else if (match[3] !== undefined) {
      parts.push(
        <s key={nextKey()} className="line-through">
          {match[3]}
        </s>
      );
    } else if (match[4] !== undefined) {
      const idx = parseInt(match[4]) - 1;
      const example = examples[idx];
      if (example) {
        parts.push(
          <span key={nextKey()} className="text-blue-600 font-semibold underline decoration-blue-300">
            {example}
          </span>
        );
      } else {
        parts.push(
          <span key={nextKey()} className="bg-blue-100 text-blue-700 px-1 rounded text-[11px] font-mono font-bold">
            {`{{${match[4]}}}`}
          </span>
        );
      }
    }

    last = regex.lastIndex;
  }

  if (last < text.length) {
    parts.push(<span key={nextKey()}>{text.slice(last)}</span>);
  }

  return <>{parts}</>;
}

export function TemplatePreview({
  headerText,
  headerFormat = "TEXT",
  bodyText,
  bodyExamples = [],
  footerText,
  buttons = [],
  compact = false,
}: TemplatePreviewProps) {
  globalKeyCounter = 0;

  const bubbleContent = (
    <div className="flex flex-col items-end w-full">
      <div className={`bg-white rounded-lg shadow p-2.5 max-w-[85%] space-y-1 ${compact ? "p-2" : "p-3"}`}>
        {headerText && (
          <div className="font-semibold text-[#075e54] border-b pb-1 mb-1 text-[13px]">
            {renderWhatsAppHeader(headerText, headerFormat, bodyExamples)}
          </div>
        )}

        <p className={`text-gray-700 whitespace-pre-wrap leading-relaxed ${compact ? "text-[11px]" : "text-[13px]"}`}>
          {renderWhatsAppBody(bodyText, bodyExamples)}
        </p>

        {footerText && (
          <p className="text-[10px] text-gray-400 mt-1 pt-1 border-t">
            {renderWhatsAppFooter(footerText, bodyExamples)}
          </p>
        )}
      </div>

      {buttons.length > 0 && (
        <div className="flex flex-wrap gap-1 max-w-[85%] mt-1">
          {buttons.map((btn, i) => (
            <span
              key={`btn-${i}`}
              className="text-[11px] bg-white border rounded-full px-2.5 py-1 text-[#075e54] shadow-sm"
            >
              {btn.text || `Botao ${i + 1}`}
            </span>
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-400 mt-1 mr-1">12:00</p>
    </div>
  );

  if (compact) {
    return (
      <div className="bg-[#e5ddd5] rounded-lg p-3 min-h-[140px] flex items-end">
        {bubbleContent}
      </div>
    );
  }

  return (
    <PhonePreview contactName="Sua Empresa">
      <div className="bg-[#e5ddd5] p-3 min-h-[300px] flex items-end pb-2">
        {bubbleContent}
      </div>
    </PhonePreview>
  );
}
