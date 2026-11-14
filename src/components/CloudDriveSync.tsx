import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  AetherLiftDataBundle,
  OpenDataFilePayload,
  buildAllOpenDataFiles,
  parseOpenDataFile
} from '../utils/openDataSerializer';
import {
  APP_DRIVE_FOLDER_NAME,
  DriveFileMetadata,
  deleteDriveFile,
  downloadDriveFileContent,
  ensureAppFolder,
  isDriveAuthError,
  listAppDriveFiles,
  uploadOrUpdateDriveFile
} from '../utils/googleDriveClient';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  Cloud,
  CloudUpload,
  Download,
  RefreshCw,
  Trash2,
  FileSpreadsheet,
  FileJson,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Eye,
  Upload,
  ExternalLink,
  RotateCcw,
  ShieldAlert,
  X
} from 'lucide-react';

interface CloudDriveSyncProps {
  dataBundle: AetherLiftDataBundle;
  user: User | null;
  accessToken: string | null;
  needsAuth: boolean;
  isLoggingIn: boolean;
  lastSyncedAt: string | null;
  onGoogleLogin: () => Promise<void>;
  onGoogleLogout: () => Promise<void>;
  onRequireReauth: () => void;
  onUpdateLastSynced: (iso: string) => void;
  onRestoreDataPatch: (patch: Partial<AetherLiftDataBundle>) => void;
}

type SyncFormatChoice = 'csv_and_json' | 'csv_only' | 'json_only';

interface PendingConfirmation {
  type: 'sync_drive' | 'delete_file' | 'restore_file';
  title: string;
  description: string;
  affectedItems: string[];
  confirmLabel: string;
  isDestructive: boolean;
  onConfirm: () => Promise<void>;
}

export const CloudDriveSync: React.FC<CloudDriveSyncProps> = ({
  dataBundle,
  user,
  accessToken,
  needsAuth,
  isLoggingIn,
  lastSyncedAt,
  onGoogleLogin,
  onGoogleLogout,
  onRequireReauth,
  onUpdateLastSynced,
  onRestoreDataPatch
}) => {
  const [syncFormat, setSyncFormat] = useState<SyncFormatChoice>('csv_and_json');
  const [driveFiles, setDriveFiles] = useState<DriveFileMetadata[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [busyFileId, setBusyFileId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<OpenDataFilePayload | null>(null);
  const [statusBanner, setStatusBanner] = useState<{
    kind: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);

  const openFiles = useMemo(() => buildAllOpenDataFiles(dataBundle), [dataBundle]);

  const filesToSync = useMemo(() => {
    if (syncFormat === 'csv_only') {
      return openFiles.filter((f) => f.mimeType === 'text/csv');
    }
    if (syncFormat === 'json_only') {
      return openFiles.filter((f) => f.mimeType === 'application/json');
    }
    return openFiles;
  }, [openFiles, syncFormat]);

  const refreshDriveFiles = useCallback(async () => {
    if (!accessToken) return;
    setIsLoadingFiles(true);
    try {
      const fId = await ensureAppFolder(accessToken);
      setFolderId(fId);
      const files = await listAppDriveFiles(accessToken, fId);
      setDriveFiles(files);
    } catch (err: any) {
      if (isDriveAuthError(err)) {
        onRequireReauth();
        setStatusBanner({
          kind: 'error',
          text: 'Google Drive session expired. Please reconnect with Google to refresh access.'
        });
      } else {
        setStatusBanner({
          kind: 'error',
          text: err?.message || 'Unable to load files from Google Drive.'
        });
      }
    } finally {
      setIsLoadingFiles(false);
    }
  }, [accessToken, onRequireReauth]);

  useEffect(() => {
    if (accessToken && !needsAuth) {
      refreshDriveFiles();
    } else {
      setDriveFiles([]);
      setFolderId(null);
    }
  }, [accessToken, needsAuth, refreshDriveFiles]);

  // Download open-format file locally to disk
  const handleDownloadLocal = (file: OpenDataFilePayload) => {
    const blob = new Blob([file.content], { type: `${file.mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import local open-format CSV or JSON file
  const handleLocalFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const content = await file.text();
      const parsed = parseOpenDataFile(file.name, content);
      setPendingConfirmation({
        type: 'restore_file',
        title: `Import "${file.name}" into AetherLift?`,
        description: `${parsed.summary} Existing matching local records will be replaced with the contents of this file.`,
        affectedItems: [file.name],
        confirmLabel: 'Confirm Import',
        isDestructive: true,
        onConfirm: async () => {
          onRestoreDataPatch(parsed.patch);
          setStatusBanner({ kind: 'success', text: parsed.summary });
        }
      });
    } catch (err: any) {
      setStatusBanner({
        kind: 'error',
        text: err?.message || 'Failed to parse selected file.'
      });
    }
  };

  // Initiate Google Drive sync with explicit confirmation dialog when updating/creating files
  const handleRequestSyncToDrive = () => {
    if (!accessToken) {
      onRequireReauth();
      return;
    }

    const existingNames = new Set(driveFiles.map((df) => df.name));
    const overwriting = filesToSync.filter((f) => existingNames.has(f.fileName));
    const creating = filesToSync.filter((f) => !existingNames.has(f.fileName));

    const itemSummary = filesToSync.map((f) => {
      const isUpdate = existingNames.has(f.fileName);
      return `${f.fileName} (${isUpdate ? 'Overwrite existing' : 'Create new'} · ${f.rowCount} rows)`;
    });

    setPendingConfirmation({
      type: 'sync_drive',
      title:
        overwriting.length > 0
          ? `Update ${overwriting.length} & Create ${creating.length} file(s) in Google Drive?`
          : `Save ${creating.length} open-format file(s) to Google Drive?`,
      description:
        overwriting.length > 0
          ? `Files will be saved inside your "${APP_DRIVE_FOLDER_NAME}" folder on Google Drive. Existing matching files will be overwritten with your latest AetherLift data.`
          : `This will create a "${APP_DRIVE_FOLDER_NAME}" folder (if needed) and upload ${creating.length} open-format file(s) to your Google Drive.`,
      affectedItems: itemSummary,
      confirmLabel: overwriting.length > 0 ? 'Confirm Overwrite & Save' : 'Save to Google Drive',
      isDestructive: overwriting.length > 0,
      onConfirm: async () => {
        setIsSyncing(true);
        try {
          const activeFolderId = folderId || (await ensureAppFolder(accessToken));
          setFolderId(activeFolderId);
          const latestList = await listAppDriveFiles(accessToken, activeFolderId);

          for (const payload of filesToSync) {
            const match = latestList.find((df) => df.name === payload.fileName);
            await uploadOrUpdateDriveFile(
              accessToken,
              activeFolderId,
              payload.fileName,
              payload.content,
              payload.mimeType,
              match?.id
            );
          }

          const refreshed = await listAppDriveFiles(accessToken, activeFolderId);
          setDriveFiles(refreshed);
          const nowIso = new Date().toISOString();
          onUpdateLastSynced(nowIso);
          setStatusBanner({
            kind: 'success',
            text: `Saved ${filesToSync.length} open-format file(s) to Google Drive (${APP_DRIVE_FOLDER_NAME}).`
          });
        } catch (err: any) {
          if (isDriveAuthError(err)) {
            onRequireReauth();
            setStatusBanner({
              kind: 'error',
              text: 'Google Drive authorization expired. Please reconnect your Google account.'
            });
          } else {
            setStatusBanner({
              kind: 'error',
              text: err?.message || 'Failed to sync files to Google Drive.'
            });
          }
        } finally {
          setIsSyncing(false);
        }
      }
    });
  };

  // Download a Drive file directly to computer
  const handleDownloadFromDrive = async (file: DriveFileMetadata) => {
    if (!accessToken) {
      onRequireReauth();
      return;
    }
    setBusyFileId(file.id);
    try {
      const content = await downloadDriveFileContent(accessToken, file.id);
      const blob = new Blob([content], { type: `${file.mimeType};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      if (isDriveAuthError(err)) {
        onRequireReauth();
      }
      setStatusBanner({
        kind: 'error',
        text: err?.message || `Failed to download ${file.name}.`
      });
    } finally {
      setBusyFileId(null);
    }
  };

  // Restore data from a Google Drive file (requires explicit confirmation)
  const handleRequestRestoreFromDrive = async (file: DriveFileMetadata) => {
    if (!accessToken) {
      onRequireReauth();
      return;
    }
    setBusyFileId(file.id);
    try {
      const content = await downloadDriveFileContent(accessToken, file.id);
      const parsed = parseOpenDataFile(file.name, content);
      setPendingConfirmation({
        type: 'restore_file',
        title: `Restore "${file.name}" from Google Drive?`,
        description: `${parsed.summary} This will overwrite matching current data in AetherLift with the snapshot from Google Drive.`,
        affectedItems: [file.name],
        confirmLabel: 'Confirm Restore',
        isDestructive: true,
        onConfirm: async () => {
          onRestoreDataPatch(parsed.patch);
          setStatusBanner({
            kind: 'success',
            text: parsed.summary
          });
        }
      });
    } catch (err: any) {
      if (isDriveAuthError(err)) {
        onRequireReauth();
      }
      setStatusBanner({
        kind: 'error',
        text: err?.message || `Could not read ${file.name} from Google Drive.`
      });
    } finally {
      setBusyFileId(null);
    }
  };

  // Delete a file from Google Drive (mandatory confirmation modal)
  const handleRequestDeleteDriveFile = (file: DriveFileMetadata) => {
    if (!accessToken) {
      onRequireReauth();
      return;
    }
    setPendingConfirmation({
      type: 'delete_file',
      title: `Delete "${file.name}" from Google Drive?`,
      description:
        'This permanently deletes the file from your Google Drive. Your current local data inside AetherLift will remain untouched.',
      affectedItems: [file.name],
      confirmLabel: 'Confirm Delete',
      isDestructive: true,
      onConfirm: async () => {
        setBusyFileId(file.id);
        try {
          await deleteDriveFile(accessToken, file.id);
          setDriveFiles((prev) => prev.filter((f) => f.id !== file.id));
          setStatusBanner({
            kind: 'info',
            text: `Deleted "${file.name}" from Google Drive.`
          });
        } catch (err: any) {
          if (isDriveAuthError(err)) {
            onRequireReauth();
          }
          setStatusBanner({
            kind: 'error',
            text: err?.message || `Failed to delete ${file.name}.`
          });
        } finally {
          setBusyFileId(null);
        }
      }
    });
  };

  const formatBytes = (sizeStr?: string) => {
    if (!sizeStr) return '—';
    const bytes = Number(sizeStr);
    if (Number.isNaN(bytes)) return '—';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {statusBanner && (
        <div
          className={`rounded-xl p-4 border flex items-center justify-between gap-3 text-xs ${
            statusBanner.kind === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : statusBanner.kind === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusBanner.kind === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="font-medium">{statusBanner.text}</span>
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero: Google Account & Drive Connection Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-orange-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Open-Format Cloud Portability
              </span>
            </div>
            <h2 className="font-athletic text-3xl font-extrabold tracking-wide text-white uppercase">
              Google Drive Sync &amp; Open CSV Storage
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every workout session, set, PR, plan, body metric, and meal log in AetherLift is stored in open, human-readable{' '}
              <strong className="text-slate-200">CSV spreadsheets</strong> and{' '}
              <strong className="text-slate-200">JSON archives</strong>. Connect your Google account to back up, inspect, and restore your files inside your personal Google Drive folder ({APP_DRIVE_FOLDER_NAME}).
            </p>
          </div>

          {/* Auth State Controls */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 min-w-[290px] flex flex-col gap-3">
            {user && !needsAuth && accessToken ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Google User'}
                        className="w-10 h-10 rounded-full border border-emerald-500/40 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold text-sm shrink-0">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {user.displayName || 'Google Account'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded shrink-0">
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400">
                    {lastSyncedAt
                      ? `Last synced ${new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Ready to sync CSV & JSON'}
                  </span>
                  <button
                    onClick={onGoogleLogout}
                    className="flex items-center gap-1 text-slate-400 hover:text-rose-400 font-semibold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-slate-300 font-medium">
                  {user
                    ? `Signed in as ${user.email}. Reconnect Google Drive to start syncing.`
                    : 'Sign in with Google to save and restore your CSV and JSON fitness data.'}
                </div>
                <GoogleSignInButton
                  onClick={onGoogleLogin}
                  disabled={isLoggingIn}
                  label={
                    isLoggingIn
                      ? 'Connecting...'
                      : user
                      ? 'Reconnect Google Drive'
                      : 'Sign in with Google'
                  }
                />
                {user && (
                  <button
                    onClick={onGoogleLogout}
                    className="block text-[11px] text-slate-400 hover:text-white underline"
                  >
                    Sign out of {user.email}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync Controls & Local Open-Format Export/Import */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Open-Format Datasets Inventory */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-athletic text-xl font-bold text-white uppercase flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-orange-500" />
                <span>Open-Format Dataset Tables ({openFiles.length} Files)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Inspect row counts, preview raw CSV/JSON contents, or download individual files directly.
              </p>
            </div>

            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-colors shrink-0">
              <Upload className="w-3.5 h-3.5 text-orange-400" />
              <span>Import CSV / JSON</span>
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleLocalFileImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {openFiles.map((file) => (
              <div
                key={file.key}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {file.mimeType === 'text/csv' ? (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <FileJson className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-white truncate">{file.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {file.rowCount} rows
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-orange-400/90 mt-1 truncate">
                    {file.fileName}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {file.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold rounded-lg border border-slate-800 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => handleDownloadLocal(file)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold rounded-lg border border-slate-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right col: Push to Google Drive Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <h3 className="font-athletic text-xl font-bold text-white uppercase flex items-center gap-2">
                <CloudUpload className="w-5 h-5 text-orange-500" />
                <span>Sync to Google Drive</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose the open file formats to write to your <strong className="text-slate-200">{APP_DRIVE_FOLDER_NAME}</strong> folder.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Format Bundle
              </label>
              {[
                {
                  id: 'csv_and_json',
                  title: 'All 6 CSVs + Full JSON Archive',
                  sub: 'Open spreadsheets + single complete snapshot (7 files)'
                },
                {
                  id: 'csv_only',
                  title: 'Open CSV Files Only',
                  sub: 'Opens directly in Google Sheets / Excel (6 CSV files)'
                },
                {
                  id: 'json_only',
                  title: 'Full JSON Snapshot Only',
                  sub: 'Single portable structured backup (1 JSON file)'
                }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSyncFormat(opt.id as SyncFormatChoice)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    syncFormat === opt.id
                      ? 'bg-orange-950/30 border-orange-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800">
            {accessToken && !needsAuth ? (
              <button
                onClick={handleRequestSyncToDrive}
                disabled={isSyncing}
                className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-950 flex items-center justify-center gap-2 transition-all"
              >
                <CloudUpload className="w-4 h-4" />
                <span>
                  {isSyncing
                    ? 'Uploading to Google Drive...'
                    : `Save ${filesToSync.length} File(s) to Google Drive`}
                </span>
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400 text-center">
                  Sign in with Google above or below to enable Drive cloud sync.
                </p>
                <div className="flex justify-center">
                  <GoogleSignInButton
                    onClick={onGoogleLogin}
                    disabled={isLoggingIn}
                    label={user ? 'Reconnect Google Drive' : 'Sign in with Google'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Drive Cloud Files Browser */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-athletic text-xl font-bold text-white uppercase flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-orange-500" />
              <span>Stored Files in Google Drive ({APP_DRIVE_FOLDER_NAME})</span>
            </h3>
            <p className="text-xs text-slate-400">
              View, download, restore into AetherLift, or remove files saved in your Google Drive app folder.
            </p>
          </div>

          {accessToken && !needsAuth && (
            <button
              onClick={refreshDriveFiles}
              disabled={isLoadingFiles}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors disabled:opacity-50 w-fit"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              <span>Refresh Drive Folder</span>
            </button>
          )}
        </div>

        {!accessToken || needsAuth ? (
          <div className="py-10 text-center space-y-3">
            <Cloud className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Connect your Google account to browse your <strong className="text-slate-200">{APP_DRIVE_FOLDER_NAME}</strong> folder, manage saved CSV &amp; JSON backups, and restore data across devices.
            </p>
          </div>
        ) : isLoadingFiles && driveFiles.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            Loading files from Google Drive...
          </div>
        ) : driveFiles.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <FolderOpen className="w-9 h-9 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              No files saved in <strong className="text-slate-200">{APP_DRIVE_FOLDER_NAME}</strong> yet. Click &ldquo;Save {filesToSync.length} File(s) to Google Drive&rdquo; above to create your first open-format backup.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Last Modified</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {driveFiles.map((df) => {
                  const isBusy = busyFileId === df.id;
                  const isJson = df.name.toLowerCase().endsWith('.json');
                  return (
                    <tr key={df.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-white">
                        <div className="flex items-center gap-2">
                          {isJson ? (
                            <FileJson className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          <span>{df.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {isJson ? 'JSON' : 'CSV'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {formatBytes(df.size)}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {df.modifiedTime
                          ? new Date(df.modifiedTime).toLocaleString()
                          : '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {df.webViewLink && (
                            <a
                              href={df.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 inline-flex items-center gap-1 text-[11px] font-semibold transition-colors"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Drive</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleDownloadFromDrive(df)}
                            disabled={isBusy}
                            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 inline-flex items-center gap-1 text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            <Download className="w-3 h-3 text-emerald-400" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => handleRequestRestoreFromDrive(df)}
                            disabled={isBusy}
                            className="px-2.5 py-1.5 bg-orange-950/60 hover:bg-orange-500 text-orange-300 hover:text-white rounded-lg border border-orange-500/30 inline-flex items-center gap-1 text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => handleRequestDeleteDriveFile(df)}
                            disabled={isBusy}
                            className="p-1.5 bg-slate-950 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 transition-colors disabled:opacity-50"
                            title="Delete from Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal for Open CSV / JSON Contents */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-athletic text-2xl font-bold text-white uppercase">
                  {previewFile.label}
                </h3>
                <p className="text-xs font-mono text-orange-400 mt-0.5">
                  {previewFile.fileName} · {previewFile.rowCount} rows · {previewFile.mimeType}
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-slate-950">
              <pre className="text-[11px] font-mono text-slate-300 whitespace-pre leading-relaxed">
                {previewFile.content}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadLocal(previewFile)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {previewFile.fileName}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Confirmation Dialog for Mutating / Destructive Operations */}
      {pendingConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  pendingConfirmation.isDestructive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-athletic text-xl font-bold text-white uppercase">
                  {pendingConfirmation.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {pendingConfirmation.description}
                </p>
              </div>
            </div>

            {pendingConfirmation.affectedItems.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-44 overflow-y-auto space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Affected Files ({pendingConfirmation.affectedItems.length})
                </div>
                {pendingConfirmation.affectedItems.map((item, idx) => (
                  <div key={idx} className="text-[11px] font-mono text-slate-300 truncate">
                    • {item}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setPendingConfirmation(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const action = pendingConfirmation.onConfirm;
                  setPendingConfirmation(null);
                  await action();
                }}
                className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-lg transition-colors ${
                  pendingConfirmation.type === 'delete_file'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {pendingConfirmation.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
