import { JWT } from "google-auth-library";

/**
 * Google Drive — cold storage for original product images and DB backups.
 * SERVER ONLY. Never touched during a normal visitor request; used by the
 * admin "import from Drive" action, the batch importer, and the backup job.
 *
 * Auth: a Google Cloud service account. Put the base64 of its JSON key in
 * GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 and share the MONOR STORE folder with the
 * service-account email. GOOGLE_DRIVE_ROOT_FOLDER_ID is that folder's id.
 */
export class DriveNotConfiguredError extends Error {
  constructor() {
    super(
      "Google Drive is not configured (GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 / GOOGLE_DRIVE_ROOT_FOLDER_ID).",
    );
    this.name = "DriveNotConfiguredError";
  }
}

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  parents?: string[];
};

const SCOPE = "https://www.googleapis.com/auth/drive";
const API = "https://www.googleapis.com/drive/v3";
const UPLOAD = "https://www.googleapis.com/upload/drive/v3";

function config() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 ?? "";
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? "";
  return { b64, rootFolderId, ready: Boolean(b64 && rootFolderId) };
}

async function retry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 250 * 2 ** i));
    }
  }
  throw lastErr;
}

class DriveClient {
  private jwt: JWT | null = null;

  isConfigured(): boolean {
    return config().ready;
  }

  private auth(): JWT {
    if (this.jwt) return this.jwt;
    const { b64, ready } = config();
    if (!ready) throw new DriveNotConfiguredError();
    const creds = JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as {
      client_email: string;
      private_key: string;
    };
    this.jwt = new JWT({ email: creds.client_email, key: creds.private_key, scopes: [SCOPE] });
    return this.jwt;
  }

  private async token(): Promise<string> {
    const { token } = await this.auth().getAccessToken();
    if (!token) throw new Error("Failed to obtain Google access token");
    return token;
  }

  private async api<T>(pathAndQuery: string, init?: RequestInit): Promise<T> {
    const token = await this.token();
    const res = await fetch(`${API}${pathAndQuery}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`Drive ${pathAndQuery}: ${res.status} ${await res.text().catch(() => "")}`);
    return (await res.json()) as T;
  }

  /** Direct children of a folder (files only by default). */
  async listFolder(folderId: string, opts: { foldersToo?: boolean } = {}): Promise<DriveFile[]> {
    const q = encodeURIComponent(
      `'${folderId}' in parents and trashed = false` +
        (opts.foldersToo ? "" : " and mimeType != 'application/vnd.google-apps.folder'"),
    );
    const data = await retry(() =>
      this.api<{ files: DriveFile[] }>(
        `/files?q=${q}&fields=files(id,name,mimeType,size,parents)&pageSize=1000`,
      ),
    );
    return data.files ?? [];
  }

  async ensureFolder(name: string, parentId: string): Promise<string> {
    const q = encodeURIComponent(
      `name = '${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    );
    const found = await this.api<{ files: DriveFile[] }>(`/files?q=${q}&fields=files(id)`);
    if (found.files?.[0]) return found.files[0].id;
    const created = await this.api<DriveFile>(`/files?fields=id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        parents: [parentId],
        mimeType: "application/vnd.google-apps.folder",
      }),
    });
    return created.id;
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    const token = await this.token();
    const res = await retry(() =>
      fetch(`${API}/files/${fileId}?alt=media`, { headers: { Authorization: `Bearer ${token}` } }),
    );
    if (!res.ok) throw new Error(`Drive download ${fileId}: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }

  async uploadFile(
    name: string,
    body: Buffer,
    mimeType: string,
    parentId: string,
  ): Promise<DriveFile> {
    const token = await this.token();
    const boundary = `monor${Date.now()}`;
    const meta = JSON.stringify({ name, parents: [parentId] });
    const pre = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`;
    const post = `\r\n--${boundary}--`;
    const payload = Buffer.concat([Buffer.from(pre), body, Buffer.from(post)]);

    const res = await retry(() =>
      fetch(`${UPLOAD}/files?uploadType=multipart&fields=id,name,mimeType,size`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: new Uint8Array(payload),
      }),
    );
    if (!res.ok) throw new Error(`Drive upload ${name}: ${res.status} ${await res.text().catch(() => "")}`);
    return (await res.json()) as DriveFile;
  }

  async moveFile(fileId: string, toFolderId: string, fromFolderId?: string): Promise<void> {
    const remove = fromFolderId ? `&removeParents=${fromFolderId}` : "";
    await this.api(`/files/${fileId}?addParents=${toFolderId}${remove}&fields=id`, { method: "PATCH" });
  }

  rootFolderId(): string {
    const { rootFolderId, ready } = config();
    if (!ready) throw new DriveNotConfiguredError();
    return rootFolderId;
  }
}

export const drive = new DriveClient();
