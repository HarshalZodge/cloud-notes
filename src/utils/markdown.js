/**
 * Markdown parser, Frontmatter serializer/extractor, and Preview utilities
 */

/**
 * Parses a markdown document containing optional YAML frontmatter.
 * Format:
 * ---
 * title: Note Title
 * category: Study
 * favorite: true
 * createdAt: 2026-10-14T06:00:00Z
 * updatedAt: 2026-10-14T06:15:00Z
 * tags: ["cloud", "viva"]
 * ---
 * # Body content...
 */
export function parseNoteMarkdown(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      metadata: {},
      content: ''
    };
  }

  const trimmed = rawText.trimStart();
  if (!trimmed.startsWith('---')) {
    // No frontmatter, treat entire content as body
    return {
      metadata: {},
      content: rawText
    };
  }

  // Find closing --- fence
  const secondFenceIndex = trimmed.indexOf('\n---', 3);
  if (secondFenceIndex === -1) {
    return {
      metadata: {},
      content: rawText
    };
  }

  const frontmatterStr = trimmed.substring(3, secondFenceIndex).trim();
  const content = trimmed.substring(secondFenceIndex + 4).trimStart();
  const metadata = {};

  const lines = frontmatterStr.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let val = line.substring(colonIndex + 1).trim();

      // Parse JSON strings, arrays, booleans
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(Number(val)) && val !== '') val = Number(val);
      else if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/\\"/g, '"');
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      } else if (val.startsWith('[') && val.endsWith(']')) {
        try {
          val = JSON.parse(val);
        } catch {
          val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        }
      }

      metadata[key] = val;
    }
  }

  return { metadata, content };
}

/**
 * Serializes metadata and content back into standard Markdown with frontmatter
 */
export function serializeNoteMarkdown(metadata, content) {
  const metaLines = ['---'];
  
  if (metadata.title) {
    metaLines.push(`title: "${metadata.title.replace(/"/g, '\\"')}"`);
  }
  if (metadata.category) {
    metaLines.push(`category: "${metadata.category.replace(/"/g, '\\"')}"`);
  }
  metaLines.push(`favorite: ${Boolean(metadata.favorite)}`);
  
  if (metadata.createdAt) {
    metaLines.push(`createdAt: "${metadata.createdAt}"`);
  }
  metaLines.push(`updatedAt: "${new Date().toISOString()}"`);

  if (metadata.noteId) {
    metaLines.push(`noteId: "${metadata.noteId}"`);
  }
  if (metadata.tags && Array.isArray(metadata.tags) && metadata.tags.length > 0) {
    metaLines.push(`tags: ${JSON.stringify(metadata.tags)}`);
  }

  metaLines.push('---');
  metaLines.push('');
  metaLines.push(content || '');

  return metaLines.join('\n');
}

/**
 * Calculates word and character count of content
 */
export function getDocumentStats(text) {
  if (!text) return { words: 0, characters: 0, readingTime: 1 };
  const characters = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { words, characters, readingTime };
}

/**
 * Extracts a short, clean plain-text preview snippet from markdown
 */
export function extractExcerpt(markdownText, maxLength = 130) {
  if (!markdownText) return '';
  // Strip frontmatter if present
  const { content } = parseNoteMarkdown(markdownText);
  
  // Clean markdown syntax for teaser
  let plain = content
    .replace(/^#+\s+/gm, '') // headings
    .replace(/\!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italic
    .replace(/`{3}[\s\S]*?`{3}/g, '') // code blocks
    .replace(/`(.+?)`/g, '$1') // inline code
    .replace(/^\s*[-*+]\s+\[[ x]\]\s+/gim, '') // checkboxes
    .replace(/^\s*[-*+]\s+/gim, '') // bullet lists
    .replace(/^\s*\d+\.\s+/gim, '') // numbered lists
    .replace(/^\s*>\s+/gim, '') // blockquotes
    .replace(/\n+/g, ' ')
    .trim();

  if (plain.length > maxLength) {
    return plain.substring(0, maxLength) + '...';
  }
  return plain || 'No additional content';
}

/**
 * Escapes HTML characters to prevent XSS
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Safe client-side Markdown to HTML converter for note preview
 */
export function markdownToHtml(md) {
  if (!md) return '';
  
  // Strip frontmatter if present
  const { content } = parseNoteMarkdown(md);

  const lines = content.split('\n');
  const output = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    // Fenced Code Blocks
    if (rawLine.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        output.push(`<pre class="md-code-block"><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Close lists if non-list line encountered
    const isUlItem = /^\s*[-*+]\s+(.*)/.test(rawLine);
    const isOlItem = /^\s*\d+\.\s+(.*)/.test(rawLine);

    if (inUl && !isUlItem) {
      output.push('</ul>');
      inUl = false;
    }
    if (inOl && !isOlItem) {
      output.push('</ol>');
      inOl = false;
    }

    // Blank line
    if (!rawLine.trim()) {
      continue;
    }

    // Horizontal rule
    if (/^(---|___|\*\*\*)$/.test(rawLine.trim())) {
      output.push('<hr class="md-divider" />');
      continue;
    }

    // Headings
    const headingMatch = rawLine.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = inlineMarkdown(headingMatch[2]);
      output.push(`<h${level} class="md-h${level}">${text}</h${level}>`);
      continue;
    }

    // Blockquote
    if (rawLine.startsWith('>')) {
      const quoteText = inlineMarkdown(rawLine.replace(/^>\s?/, ''));
      output.push(`<blockquote class="md-blockquote">${quoteText}</blockquote>`);
      continue;
    }

    // Task list / Checkbox
    const taskMatch = rawLine.match(/^\s*[-*+]\s+\[([ xX])\]\s+(.*)/);
    if (taskMatch) {
      if (!inUl) {
        output.push('<ul class="md-task-list">');
        inUl = true;
      }
      const isChecked = taskMatch[1].toLowerCase() === 'x';
      const itemText = inlineMarkdown(taskMatch[2]);
      output.push(
        `<li class="md-task-item ${isChecked ? 'checked' : ''}">
          <input type="checkbox" disabled ${isChecked ? 'checked' : ''} class="md-task-checkbox" />
          <span>${itemText}</span>
        </li>`
      );
      continue;
    }

    // Bullet List
    if (isUlItem) {
      if (!inUl) {
        output.push('<ul class="md-list">');
        inUl = true;
      }
      const itemText = inlineMarkdown(rawLine.replace(/^\s*[-*+]\s+/, ''));
      output.push(`<li>${itemText}</li>`);
      continue;
    }

    // Numbered List
    if (isOlItem) {
      if (!inOl) {
        output.push('<ol class="md-numbered-list">');
        inOl = true;
      }
      const itemText = inlineMarkdown(rawLine.replace(/^\s*\d+\.\s+/, ''));
      output.push(`<li>${itemText}</li>`);
      continue;
    }

    // Standard paragraph
    output.push(`<p class="md-p">${inlineMarkdown(rawLine)}</p>`);
  }

  if (inUl) output.push('</ul>');
  if (inOl) output.push('</ol>');
  if (inCodeBlock) {
    output.push(`<pre class="md-code-block"><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }

  return output.join('\n');
}

/**
 * Handles inline styles: bold, italic, inline code, links
 */
function inlineMarkdown(text) {
  if (!text) return '';
  let str = escapeHtml(text);

  // Inline Code
  str = str.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // Bold (**text** or __text__)
  str = str.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

  // Italic (*text* or _text_)
  str = str.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

  // Links [text](url)
  str = str.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');

  return str;
}
