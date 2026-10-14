/**
 * File naming and sanitization utilities for Google Drive Markdown files
 */

/**
 * Sanitizes a note title into a safe Google Drive filename
 * @param {string} title 
 * @returns {string} Safe filename ending with .md
 */
export function sanitizeFilename(title) {
  if (!title || typeof title !== 'string') {
    return `Untitled_Note_${Date.now()}.md`;
  }
  
  // Remove invalid filename characters: / \ : * ? " < > |
  let clean = title.trim().replace(/[\\/:*?"<>|]/g, '');
  
  // Replace multiple spaces or punctuation sequences with single underscore
  clean = clean.replace(/\s+/g, '_');
  
  if (!clean) {
    clean = `Note_${Date.now()}`;
  }
  
  // Truncate to reasonable length
  if (clean.length > 80) {
    clean = clean.substring(0, 80);
  }
  
  if (!clean.toLowerCase().endsWith('.md')) {
    clean = `${clean}.md`;
  }
  
  return clean;
}

/**
 * Extracts a readable title from a filename
 * @param {string} filename 
 * @returns {string}
 */
export function titleFromFilename(filename) {
  if (!filename) return 'Untitled Note';
  let name = filename.replace(/\.md$/i, '');
  // Replace underscores and hyphens with spaces for natural display
  return name.replace(/[_-]/g, ' ').trim() || 'Untitled Note';
}

/**
 * Generates a stable unique note identifier
 * @returns {string}
 */
export function generateNoteId() {
  return 'note_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}
