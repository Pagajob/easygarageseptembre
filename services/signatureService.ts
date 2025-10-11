import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SignatureType = 'contract' | 'edl_depart' | 'edl_retour';
export type SignedByRole = 'renter' | 'client' | 'owner' | 'admin' | 'user';

export interface SignatureContext {
  type: SignatureType;
  reservationId?: string;
  vehicleId?: string;
  clientId?: string;
  signedByRole: SignedByRole;
}

export interface SignatureRecord {
  id: string;
  type: SignatureType;
  reservationId?: string;
  vehicleId?: string;
  clientId?: string;
  signedByRole: SignedByRole;
  signedAt: number; // epoch ms
  fileUri: string;
  fileName: string;
  hash: string; // sha256(base64 + '|' + timestamp + '|' + reservationId)
  albumAssetId?: string;
}

const SIGNATURES_STORAGE_KEY = 'easygarage.signatures.v1';
const APP_DIR = `${FileSystem.documentDirectory}EasyGarage`;
const SIGNATURES_DIR = `${APP_DIR}/signatures`;
const ALBUM_NAME = 'EasyGarage';

async function ensureDirectories(): Promise<void> {
  try {
    const appDirInfo = await FileSystem.getInfoAsync(APP_DIR);
    if (!appDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(APP_DIR, { intermediates: true });
    }
    const sigDirInfo = await FileSystem.getInfoAsync(SIGNATURES_DIR);
    if (!sigDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(SIGNATURES_DIR, { intermediates: true });
    }
  } catch (error) {
    console.warn('ensureDirectories error', error);
  }
}

async function ensureAlbumAvailable(assetUri?: string): Promise<string | undefined> {
  try {
    const perm = await MediaLibrary.getPermissionsAsync();
    if (!perm.granted) {
      const req = await MediaLibrary.requestPermissionsAsync();
      if (!req.granted) return undefined;
    }

    let assetId: string | undefined;
    if (assetUri) {
      const asset = await MediaLibrary.createAssetAsync(assetUri);
      let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      assetId = asset.id;
    } else {
      // Ensure album exists
      let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
      if (!album) {
        // create empty album with a temp asset if needed; skip when none
      }
    }
    return assetId;
  } catch (error) {
    console.warn('ensureAlbumAvailable error', error);
    return undefined;
  }
}

function dataUrlToBase64(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',');
  return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
}

async function loadAll(): Promise<SignatureRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(SIGNATURES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SignatureRecord[];
  } catch {
    return [];
  }
}

async function saveAll(items: SignatureRecord[]): Promise<void> {
  await AsyncStorage.setItem(SIGNATURES_STORAGE_KEY, JSON.stringify(items));
}

export const SignatureService = {
  async saveSignatureFromDataUrl(
    dataUrl: string,
    context: SignatureContext
  ): Promise<SignatureRecord> {
    await ensureDirectories();

    const base64 = dataUrlToBase64(dataUrl);
    const timestamp = Date.now();
    const entityId = context.reservationId || context.vehicleId || context.clientId || 'na';
    const id = `sig_${context.type}_${entityId}_${timestamp}`;
    const fileName = `${id}.png`;
    const fileUri = `${SIGNATURES_DIR}/${fileName}`;

    // Write PNG from base64
    await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });

    // Save to media library album
    const albumAssetId = await ensureAlbumAvailable(fileUri);

    // Compute SHA-256 hash of PNG + timestamp + entity id
    const hashInput = `${base64}|${timestamp}|${entityId}`;
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, hashInput);

    const record: SignatureRecord = {
      id,
      type: context.type,
      reservationId: context.reservationId,
      vehicleId: context.vehicleId,
      clientId: context.clientId,
      signedByRole: context.signedByRole,
      signedAt: timestamp,
      fileUri,
      fileName,
      hash,
      albumAssetId,
    };

    const existing = await loadAll();
    existing.push(record);
    await saveAll(existing);

    return record;
  },

  async getAll(): Promise<SignatureRecord[]> {
    return loadAll();
  },

  async findByReservation(reservationId: string): Promise<SignatureRecord[]> {
    const all = await loadAll();
    return all.filter(x => x.reservationId === reservationId);
  },

  async clearAll(): Promise<void> {
    await saveAll([]);
  }
};
