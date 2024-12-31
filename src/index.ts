
import { Server } from "@modelcontextprotocol/sdk/server";
import { google, GoogleAuth } from "googleapis";
import { Drive, FileList } from "googleapis/build/src/apis/drive";

const server = new Server({
  name: "gdrive",
  version: "1.0.0"
}, {
  capabilities: {
    resources: {},
    tools: {}
  }
});

// List files in Google Drive
server.setRequestHandler(ListGoogleDriveFilesRequestSchema, async (request) => {
  const drive = await getDriveClient();
  const files = await listFiles(drive, request.params.folderId);
  return { files };
});

// Read file content from Google Drive
server.setRequestHandler(ReadGoogleDriveFileRequestSchema, async (request) => {
  const drive = await getDriveClient();
  const fileContent = await readFile(drive, request.params.fileId);
  return { content: fileContent };
});

// Helper functions
async function getDriveClient(): Promise<Drive> {
  const auth = new GoogleAuth({
    credentials: {
      client_id: "YOUR_CLIENT_ID",
      client_secret: "YOUR_CLIENT_SECRET",
      refresh_token: "YOUR_REFRESH_TOKEN"
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"]
  });
  return google.drive({ version: "v3", auth });
}

async function listFiles(drive: Drive, folderId: string): Promise<FileList> {
  const response = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: "files(id, name, mimeType)"
  });
  return response.data;
}

async function readFile(drive: Drive, fileId: string): Promise<string> {
  const response = await drive.files.get({
    fileId,
    alt: "media"
  });
  return response.data as string;
}
