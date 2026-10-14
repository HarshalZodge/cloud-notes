/**
 * Google Drive API v3 Service
 * Interacts with Google Drive via REST API v3 using Bearer access tokens.
 * Operates within the dedicated "CloudNotes" folder.
 */

import { sanitizeFilename, titleFromFilename, generateNoteId } from '../utils/fileNames.js';
import { parseNoteMarkdown, serializeNoteMarkdown } from '../utils/markdown.js';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';
const FOLDER_NAME = 'CloudNotes';

let cachedFolderId = null;

/**
 * Searches for or creates the "CloudNotes" folder in the user's Drive.
 * @param {string} accessToken 
 * @returns {Promise<string>} The folder ID
 */
export async function getOrCreateNotesFolder(accessToken) {
  if (cachedFolderId) {
    // Verify cached folder is still valid
    try {
      const verifyRes = await fetch(`${DRIVE_API_BASE}/files/${cachedFolderId}?fields=id,name,trashed`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (verifyRes.ok) {
        const data = await verifyRes.json();
        if (!data.trashed) {
          return cachedFolderId;
        }
      }
    } catch {
      // Cache invalid, fall through
    }
  }

  // Search for existing non-trashed CloudNotes folder
  const query = encodeURIComponent(`mimeType = 'application/vnd.google-apps.folder' and name = '${FOLDER_NAME}' and trashed = false`);
  const searchRes = await fetch(`${DRIVE_API_BASE}/files?q=${query}&fields=files(id,name)&spaces=drive`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    throw new Error(`Failed to query Google Drive for folder: ${searchRes.status} ${errorText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    cachedFolderId = searchData.files[0].id;
    return cachedFolderId;
  }

  // Create folder if not found
  const createRes = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Dedicated storage directory for CloudNotes personal notes manager'
    })
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create CloudNotes folder in Google Drive: ${createRes.status} ${errorText}`);
  }

  const createdData = await createRes.json();
  cachedFolderId = createdData.id;
  return cachedFolderId;
}

/**
 * Lists all notes in the CloudNotes folder
 * @param {string} accessToken 
 * @param {boolean} includeTrashed 
 * @returns {Promise<Array>} List of note objects with full metadata and content
 */
export async function listDriveNotes(accessToken, includeTrashed = false) {
  const folderId = await getOrCreateNotesFolder(accessToken);
  const trashedCondition = includeTrashed ? '' : ' and trashed = false';
  const query = encodeURIComponent(`'${folderId}' in parents${trashedCondition}`);

  const res = await fetch(
    `${DRIVE_API_BASE}/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,createdTime,properties,size,webViewLink,trashed)&pageSize=100`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list files from Google Drive: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const fileItems = data.files || [];

  // Filter only markdown or text notes
  const noteFiles = fileItems.filter(f => 
    f.name.endsWith('.md') || 
    f.name.endsWith('.txt') || 
    f.mimeType === 'text/markdown' || 
    f.mimeType === 'text/plain'
  );

  // Fetch contents in parallel (with concurrency limit)
  const notes = await Promise.all(
    noteFiles.map(async (file) => {
      try {
        const content = await getDriveFileContent(accessToken, file.id);
        const { metadata, content: bodyContent } = parseNoteMarkdown(content);

        return {
          id: file.id,
          title: metadata.title || file.properties?.title || titleFromFilename(file.name),
          category: metadata.category || file.properties?.category || 'General',
          favorite: metadata.favorite === true || file.properties?.favorite === 'true',
          createdAt: metadata.createdAt || file.createdTime,
          updatedAt: metadata.updatedAt || file.modifiedTime,
          content: bodyContent,
          rawMarkdown: content,
          filename: file.name,
          webViewLink: file.webViewLink,
          trashed: file.trashed || false,
          tags: metadata.tags || []
        };
      } catch (err) {
        console.warn(`Could not read note file ${file.name} (${file.id}):`, err);
        return {
          id: file.id,
          title: titleFromFilename(file.name),
          category: 'General',
          favorite: false,
          createdAt: file.createdTime,
          updatedAt: file.modifiedTime,
          content: '',
          rawMarkdown: '',
          filename: file.name,
          webViewLink: file.webViewLink,
          trashed: file.trashed || false,
          tags: []
        };
      }
    })
  );

  return notes;
}

/**
 * Reads raw file content from Drive by file ID
 */
export async function getDriveFileContent(accessToken, fileId) {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    throw new Error(`Error reading file ${fileId}: ${res.status}`);
  }

  return await res.text();
}

/**
 * Creates a new Markdown note in the CloudNotes folder using multipart upload
 */
export async function createDriveNote(accessToken, noteInput) {
  const folderId = await getOrCreateNotesFolder(accessToken);
  const noteId = noteInput.noteId || generateNoteId();
  const filename = sanitizeFilename(noteInput.title || 'Untitled Note');
  const now = new Date().toISOString();

  const metadata = {
    title: noteInput.title || 'Untitled Note',
    category: noteInput.category || 'General',
    favorite: Boolean(noteInput.favorite),
    createdAt: noteInput.createdAt || now,
    updatedAt: now,
    noteId: noteId,
    tags: noteInput.tags || []
  };

  const rawMarkdown = serializeNoteMarkdown(metadata, noteInput.content || '');

  // Construct multipart body
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const driveMetadata = {
    name: filename,
    mimeType: 'text/markdown',
    parents: [folderId],
    properties: {
      category: metadata.category,
      favorite: String(metadata.favorite),
      noteId: noteId,
      app: 'CloudNotes'
    }
  };

  const multipartBody = 
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(driveMetadata) +
    delimiter +
    'Content-Type: text/markdown; charset=UTF-8\r\n\r\n' +
    rawMarkdown +
    closeDelimiter;

  const res = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,webViewLink,createdTime,modifiedTime`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create note in Google Drive: ${res.status} ${errorText}`);
  }

  const createdFile = await res.json();

  return {
    id: createdFile.id,
    title: metadata.title,
    category: metadata.category,
    favorite: metadata.favorite,
    createdAt: createdFile.createdTime || metadata.createdAt,
    updatedAt: createdFile.modifiedTime || metadata.updatedAt,
    content: noteInput.content || '',
    rawMarkdown: rawMarkdown,
    filename: filename,
    webViewLink: createdFile.webViewLink,
    trashed: false,
    tags: metadata.tags
  };
}

/**
 * Updates an existing note file in Google Drive
 */
export async function updateDriveNote(accessToken, fileId, noteUpdate) {
  const filename = sanitizeFilename(noteUpdate.title || 'Untitled Note');
  const now = new Date().toISOString();

  const metadata = {
    title: noteUpdate.title || 'Untitled Note',
    category: noteUpdate.category || 'General',
    favorite: Boolean(noteUpdate.favorite),
    createdAt: noteUpdate.createdAt || now,
    updatedAt: now,
    noteId: noteUpdate.noteId || fileId,
    tags: noteUpdate.tags || []
  };

  const rawMarkdown = serializeNoteMarkdown(metadata, noteUpdate.content || '');

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const driveMetadata = {
    name: filename,
    properties: {
      category: metadata.category,
      favorite: String(metadata.favorite),
      noteId: metadata.noteId,
      app: 'CloudNotes'
    }
  };

  const multipartBody = 
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(driveMetadata) +
    delimiter +
    'Content-Type: text/markdown; charset=UTF-8\r\n\r\n' +
    rawMarkdown +
    closeDelimiter;

  const res = await fetch(`${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=multipart&fields=id,name,webViewLink,modifiedTime`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update note in Google Drive: ${res.status} ${errorText}`);
  }

  const updatedFile = await res.json();

  return {
    id: fileId,
    title: metadata.title,
    category: metadata.category,
    favorite: metadata.favorite,
    createdAt: metadata.createdAt,
    updatedAt: updatedFile.modifiedTime || now,
    content: noteUpdate.content || '',
    rawMarkdown: rawMarkdown,
    filename: filename,
    webViewLink: updatedFile.webViewLink,
    trashed: false,
    tags: metadata.tags
  };
}

/**
 * Moves a note to Drive Trash
 */
export async function trashDriveNote(accessToken, fileId) {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ trashed: true })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to move note to Drive Trash: ${res.status} ${errText}`);
  }

  return true;
}

/**
 * Restores a note from Drive Trash
 */
export async function restoreDriveNote(accessToken, fileId) {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ trashed: false })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to restore note from Drive Trash: ${res.status} ${errText}`);
  }

  return true;
}

/**
 * Permanently deletes a note from Google Drive
 */
export async function permanentlyDeleteDriveNote(accessToken, fileId) {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok && res.status !== 404) {
    const errText = await res.text();
    throw new Error(`Failed to permanently delete note: ${res.status} ${errText}`);
  }

  return true;
}

/**
 * Retrieves Drive storage quota if accessible
 */
export async function getDriveStorageInfo(accessToken) {
  try {
    const res = await fetch(`${DRIVE_API_BASE}/about?fields=storageQuota,user`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.storageQuota) {
      const usage = Number(data.storageQuota.usage) || 0;
      const limit = Number(data.storageQuota.limit) || 0;
      const usageInDrive = Number(data.storageQuota.usageInDrive) || 0;

      return {
        usageBytes: usage,
        limitBytes: limit,
        usageInDriveBytes: usageInDrive,
        usageFormatted: formatStorageSize(usage),
        limitFormatted: limit > 0 ? formatStorageSize(limit) : 'Unlimited',
        percentage: limit > 0 ? Math.min(100, Math.round((usage / limit) * 100)) : 0
      };
    }
  } catch (err) {
    console.debug('Drive quota not available or restricted by scope:', err);
  }
  return null;
}

function formatStorageSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
