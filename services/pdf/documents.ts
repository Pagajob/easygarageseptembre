import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Sharing from 'expo-sharing';

export interface CompanyInfoLite {
  nom: string;
  adresse?: string;
  siret?: string;
  logo?: string; // local uri
}

export interface ContractInputs {
  company: CompanyInfoLite;
  client: { nomComplet: string; email?: string; telephone?: string; adresse?: string };
  vehicle: { marque: string; modele: string; immatriculation: string; carburant?: string };
  reservation: { id: string; dateDebut: string; heureDebut: string; dateFin: string; heureFin: string; kilometrageDepart?: string };
  fees: { carburantManquant?: string; prixKmSupp?: string; cautionDepart?: string; cautionRSV?: string; nettoyage?: string; retard?: string };
  signatures?: { clientUri?: string; loueurUri?: string };
  documentNumber: string; // e.g. EG-202510-0001
  hash?: string;
}

export interface EDLInputs {
  company: CompanyInfoLite;
  reservationId: string;
  resume: { kilometrage?: number; carburant?: number; remarques?: string };
  photos: string[]; // local URIs
  signatures?: { departUri?: string; retourUri?: string };
  documentNumber: string;
  hash?: string;
}

const ALBUM = 'EasyGarage';
const OUT_DIR = `${FileSystem.documentDirectory}EasyGarage/pdfs`;

async function ensureOutDir() {
  const info = await FileSystem.getInfoAsync(OUT_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(OUT_DIR, { intermediates: true });
}

async function addToAlbumAsync(uri: string) {
  try {
    const perm = await MediaLibrary.getPermissionsAsync();
    if (!perm.granted) {
      const req = await MediaLibrary.requestPermissionsAsync();
      if (!req.granted) return;
    }
    const asset = await MediaLibrary.createAssetAsync(uri);
    let album = await MediaLibrary.getAlbumAsync(ALBUM);
    if (!album) album = await MediaLibrary.createAlbumAsync(ALBUM, asset, false);
    else await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  } catch (e) {
    // best effort
  }
}

async function embedPngFromUri(doc: PDFDocument, uri?: string) {
  if (!uri) return undefined;
  try {
    const file = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const bytes = Uint8Array.from(atob(file), c => c.charCodeAt(0));
    return await doc.embedPng(bytes);
  } catch {
    return undefined;
  }
}

async function compressImage(uri: string, quality = 0.7, width = 1024) {
  try {
    const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width } }], { compress: quality, format: ImageManipulator.SaveFormat.JPEG });
    return result.uri;
  } catch {
    return uri;
  }
}

export const Documents = {
  async buildContractPDF(input: ContractInputs): Promise<string> {
    await ensureOutDir();
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]); // A4
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const margin = 40;
    const { width } = page.getSize();
    let y = 800;

    const drawText = (text: string, size = 12, color = rgb(0, 0, 0)) => {
      page.drawText(text, { x: margin, y, size, font, color });
      y -= size + 6;
    };

    // Header
    drawText('CONTRAT DE LOCATION', 18);
    drawText(`${input.company.nom}`);
    if (input.company.adresse) drawText(input.company.adresse);
    y -= 8;

    // Client & véhicule
    drawText(`Client: ${input.client.nomComplet}`);
    drawText(`Véhicule: ${input.vehicle.marque} ${input.vehicle.modele} (${input.vehicle.immatriculation})`);
    drawText(`Période: ${input.reservation.dateDebut} ${input.reservation.heureDebut} → ${input.reservation.dateFin} ${input.reservation.heureFin}`);
    if (input.reservation.kilometrageDepart) drawText(`Km départ: ${input.reservation.kilometrageDepart}`);
    y -= 8;

    // Fees
    drawText(`Frais: Carburant ${input.fees.carburantManquant || '0'}€/L, Km supp ${input.fees.prixKmSupp || '0'}€, Nettoyage ${input.fees.nettoyage || '0'}€`);
    drawText(`Caution: départ ${input.fees.cautionDepart || '0'}€, RSV ${input.fees.cautionRSV || '0'}€`);

    // Signatures (thumbnails)
    y -= 12;
    const clientSig = await embedPngFromUri(doc, input.signatures?.clientUri);
    const loueurSig = await embedPngFromUri(doc, input.signatures?.loueurUri);
    const sigY = y;
    if (clientSig) page.drawImage(clientSig, { x: margin, y: sigY - 60, width: 180, height: 60 });
    if (loueurSig) page.drawImage(loueurSig, { x: margin + 220, y: sigY - 60, width: 180, height: 60 });
    y = sigY - 80;

    // Footer
    drawText(`N° doc: ${input.documentNumber}`);
    if (input.hash) drawText(`Hash: ${input.hash}`);
    drawText(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`);

    const bytes = await doc.save();
    const fileName = `contrat_${input.reservation.id}_${Date.now()}.pdf`;
    const fileUri = `${OUT_DIR}/${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, Buffer.from(bytes).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });
    await addToAlbumAsync(fileUri);
    return fileUri;
  },

  async buildEDLPDF(input: EDLInputs): Promise<string> {
    await ensureOutDir();
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const photos = await Promise.all(input.photos.map(async p => await compressImage(p)));

    let page = doc.addPage([595.28, 841.89]);
    const margin = 36;
    const drawHeader = (title: string) => {
      page.drawText(title, { x: margin, y: 800, size: 18, font });
      page.drawText(`N°: ${input.documentNumber}`, { x: margin, y: 780, size: 10, font });
      if (input.hash) page.drawText(`Hash: ${input.hash}`, { x: margin, y: 768, size: 10, font });
      page.drawText(`${input.company.nom}`, { x: margin, y: 756, size: 12, font });
    };

    drawHeader('ÉTAT DES LIEUX');

    // Grid 6 per page
    let x = margin, y = 720;
    const cellW = 170, cellH = 120;
    let count = 0;
    for (const uri of photos) {
      const imgBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const bytes = Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0));
      const img = await doc.embedJpg(bytes);
      if (count > 0 && count % 6 === 0) {
        page = doc.addPage([595.28, 841.89]);
        drawHeader('ÉTAT DES LIEUX (suite)');
        x = margin; y = 720;
      }
      page.drawImage(img, { x, y: y - cellH, width: cellW, height: cellH });
      x += cellW + 10;
      if ((count % 3) === 2) { x = margin; y -= (cellH + 12); }
      count += 1;
    }

    const bytes = await doc.save();
    const fileName = `edl_${input.reservationId}_${Date.now()}.pdf`;
    const fileUri = `${OUT_DIR}/${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, Buffer.from(bytes).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });
    await addToAlbumAsync(fileUri);
    return fileUri;
  },

  async share(fileUri: string): Promise<boolean> {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) return false;
      await Sharing.shareAsync(fileUri, { dialogTitle: 'Partager le PDF' });
      return true;
    } catch {
      return false;
    }
  },
};
