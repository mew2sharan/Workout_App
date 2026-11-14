export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

const DRIVE_FILES_API = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';
export const APP_DRIVE_FOLDER_NAME = 'AetherLift Fitness Data';

class DriveAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DriveAuthError';
  }
}

export const isDriveAuthError = (err: unknown): boolean => {
  return err instanceof DriveAuthError;
};

async function handleDriveResponse(res: Response) {
  if (res.status === 401 || res.status === 403) {
    const text = await res.text();
    throw new DriveAuthError(`Google Drive authorization expired or insufficient (${res.status}): ${text}`);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Drive API error (${res.status}): ${text}`);
  }
  return res;
}

/**
 * Find or create the dedicated AetherLift folder in the user's Google Drive.
 */
export async function ensureAppFolder(accessToken: string): Promise<string> {
  const query = encodeURIComponent(
    `name = '${APP_DRIVE_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchRes = await fetch(
    `${DRIVE_FILES_API}?q=${query}&fields=files(id,name)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  await handleDriveResponse(searchRes);
  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  const createRes = await fetch(DRIVE_FILES_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: APP_DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });
  await handleDriveResponse(createRes);
  const created = await createRes.json();
  return created.id;
}

/**
 * List all non-trashed files inside the AetherLift Drive folder (or app-created files).
 */
export async function listAppDriveFiles(
  accessToken: string,
  folderId: string
): Promise<DriveFileMetadata[]> {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime,size,webViewLink)');
  const res = await fetch(
    `${DRIVE_FILES_API}?q=${query}&fields=${fields}&orderBy=modifiedTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  await handleDriveResponse(res);
  const data = await res.json();
  return data.files || [];
}

/**
 * Upload a new file or overwrite an existing file on Google Drive using multipart upload.
 */
export async function uploadOrUpdateDriveFile(
  accessToken: string,
  folderId: string,
  fileName: string,
  content: string,
  mimeType: string,
  existingFileId?: string
): Promise<DriveFileMetadata> {
  const boundary = `aetherlift_boundary_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType
  };
  if (!existingFileId) {
    metadata.parents = [folderId];
  }

  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;

  const url = existingFileId
    ? `${DRIVE_UPLOAD_API}/${existingFileId}?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink`
    : `${DRIVE_UPLOAD_API}?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink`;

  const res = await fetch(url, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });
  await handleDriveResponse(res);
  return await res.json();
}

/**
 * Download raw text contents of a CSV or JSON file from Google Drive.
 */
export async function downloadDriveFileContent(
  accessToken: string,
  fileId: string
): Promise<string> {
  const res = await fetch(`${DRIVE_FILES_API}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  await handleDriveResponse(res);
  return await res.text();
}

/**
 * Delete a file from Google Drive (must only be called after explicit user confirmation).
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`${DRIVE_FILES_API}/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  await handleDriveResponse(res);
}
