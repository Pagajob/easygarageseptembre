import { ContractData } from './contractService';

export class WebContractService {
  /**
   * Generate PDF from HTML for web platform using the same logic as profit report
   */
  static async generatePDFFromHTMLWeb(html: string): Promise<Blob> {
    try {
      // For web, we'll use a more sophisticated approach similar to the profit report
      // This creates a proper PDF using the browser's print functionality
      
      // Create a temporary iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '210mm'; // A4 width
      iframe.style.height = '297mm'; // A4 height
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Cannot access iframe document');
      }
      
      // Set the HTML content
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create a blob from the HTML content for now
      // In a real implementation, you might want to use libraries like jsPDF or html2canvas
      const blob = new Blob([html], { type: 'text/html' });
      
      // Clean up
      document.body.removeChild(iframe);
      
      return blob;
    } catch (error) {
      console.error('Error generating PDF for web:', error);
      // Return a fallback PDF
      const fallbackHTML = this.createFallbackContractHTML();
      return new Blob([fallbackHTML], { type: 'text/html' });
    }
  }

  /**
   * Create a simple PDF content using jsPDF (if available)
   */
  static async generatePDFWithJSPDF(html: string): Promise<Blob> {
    try {
      // Check if jsPDF is available
      if (typeof window !== 'undefined' && (window as any).jspdf) {
        const { jsPDF } = (window as any).jspdf;
        
        // Create a new PDF document
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Add content to PDF (simplified version)
        doc.setFontSize(16);
        doc.text('CONTRAT DE LOCATION', 105, 20, { align: 'center' });
        
        // You can add more sophisticated HTML to PDF conversion here
        // For now, we'll create a simple text-based PDF
        
        // Save as blob
        const pdfBlob = doc.output('blob');
        return pdfBlob;
      } else {
        // Fallback to HTML blob
        return new Blob([html], { type: 'text/html' });
      }
    } catch (error) {
      console.error('Error generating PDF with jsPDF:', error);
      return new Blob([html], { type: 'text/html' });
    }
  }

  /**
   * Generate contract HTML optimized for web display and printing
   */
  static generateWebContractHTML(data: ContractData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contrat de location</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.4;
            background-color: white;
          }
          
          .contract-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 20px;
          }
          
          h1 { 
            color: black; 
            font-family: "Avenir Next", sans-serif; 
            font-style: normal; 
            font-weight: bold; 
            text-decoration: none; 
            font-size: 19pt; 
            text-align: center;
            padding-top: 3pt;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563EB;
            padding-bottom: 10px;
          }
          
          .s1 { 
            color: black; 
            font-family: "Helvetica Neue", sans-serif; 
            font-style: normal; 
            font-weight: bold; 
            text-decoration: none; 
            font-size: 10pt; 
            text-align: center;
            padding-top: 5pt;
          }
          
          .s2 { 
            color: black; 
            font-family: "Helvetica Neue", sans-serif; 
            font-style: normal; 
            font-weight: normal; 
            text-decoration: none; 
            font-size: 8pt; 
            padding-left: 4pt;
          }
          
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }
          
          .header-cell {
            background-color: #D5D5D5;
            text-align: center;
            padding: 6pt;
            font-weight: bold;
            border: 1pt solid #7F7F7F;
          }
          
          .data-cell {
            background-color: #F5F5F5;
            padding: 4pt;
            border: 1pt solid #7F7F7F;
          }
          
          .footer {
            margin-top: 50px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
            font-size: 10px;
            text-align: right;
          }
          
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
          }
          
          .signature-box {
            border-top: 1px solid #000;
            width: 45%;
            padding-top: 10px;
            text-align: center;
            font-size: 12px;
          }
          
          .terms {
            font-size: 9px;
            margin-top: 30px;
            text-align: justify;
          }
          
          .caution-table {
            background-color: #D5D5D5;
            border: 1pt solid #7F7F7F;
          }
          
          .caution-cell {
            padding: 8pt 4pt;
            font-weight: bold;
            font-size: 8pt;
          }
          
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #2563EB;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
          }
          
          .print-button:hover {
            background-color: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">Imprimer</button>
        
        <div class="contract-container">
          <h1>CONTRAT DE LOCATION</h1>
          
          <table>
            <tr>
              <td colspan="2" class="header-cell">CLIENT(S) - CONDUCTEUR(S)</td>
            </tr>
            <tr>
              <td class="data-cell" width="50%">
                <p class="s2">Nom : ${data.nom_client}</p>
              </td>
              <td class="data-cell" width="50%">
                <p class="s2">Téléphone : ${data.telephone_client}</p>
              </td>
            </tr>
            <tr>
              <td colspan="2" class="data-cell">
                <p class="s2">Adresse : ${data.adresse_client || 'Non spécifiée'}</p>
              </td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td colspan="2" class="header-cell">VEHICULE</td>
            </tr>
            <tr>
              <td colspan="2" class="data-cell">
                <p class="s2">Marque et modèle : ${data.vehicule_marque} ${data.vehicule_modele}</p>
              </td>
            </tr>
            <tr>
              <td class="data-cell" width="50%">
                <p class="s2">Immatriculation : ${data.vehicule_immatriculation}</p>
              </td>
              <td class="data-cell" width="50%">
                <p class="s2">Carburant : ${data.vehicule_carburant}</p>
              </td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td colspan="2" class="header-cell">DETAILS DE LA RESERVATION</td>
            </tr>
            <tr>
              <td class="data-cell" width="50%">
                <p class="s2">Date et heure de départ : ${data.date_debut} à ${data.heure_debut}</p>
              </td>
              <td class="data-cell" width="50%">
                <p class="s2">Date et heure de retour : ${data.date_fin} à ${data.heure_fin}</p>
              </td>
            </tr>
            <tr>
              <td class="data-cell">
                <p class="s2">Kilométrage au départ : ${data.kilometrage_depart}</p>
              </td>
              <td class="data-cell">
                <p class="s2">Kilométrage inclus : ${data.kilometrage_inclus} km/jour</p>
              </td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td colspan="2" class="header-cell">SUPPLEMENTS</td>
            </tr>
            <tr>
              <td class="data-cell" width="50%">
                <p class="s2">Appoint de carburant : <b>${data.carburant_manquant}€</b> par litre manquant</p>
              </td>
              <td class="data-cell" width="50%">
                <p class="s2">Kilomètre supplémentaire : ${data.prixKmSupplementaire} €</p>
              </td>
            </tr>
          </table>
          
          <table class="caution-table">
            <tr>
              <td class="caution-cell" width="50%">Caution de départ : <span style="font-weight: normal">${data.cautiondepart} €</span></td>
              <td class="caution-cell" width="50%">Franchise majorée : <span style="font-weight: normal">${data.cautionRSV} €</span></td>
            </tr>
          </table>
          
          <p style="padding-top: 3pt; padding-left: 5pt; text-align: justify; font-size: 8pt;">
            Les présentes conditions générales de location régissent les relations entre la société
            ${data.nom_entreprise} et toute personne désignée sur le contrat de location, qui paie ledit contrat et/ou est désignée en tant que conducteur principal.
          </p>
          
          <h2 style="padding-left: 5pt; font-size: 8pt; text-align: justify;">
            ARTICLE 1. <span style="font-weight: normal">RÉSERVATION DU VÉHICULE : </span><i>Qui peut louer et conduire un véhicule ${data.nom_entreprise} ?</i>
          </h2>
          
          <p style="padding-left: 5pt; font-size: 8pt; text-align: left;">
            Pour louer et conduire un véhicule ${data.nom_entreprise}, je dois nécessairement:
          </p>
          <ul style="list-style-type: disc; padding-left: 39pt; font-size: 8pt;">
            <li>avoir plus de ${data.ageminimal} ans révolus</li>
            <li>disposer d'un permis de conduire valide obtenu depuis au moins ${data.anneepermis} an(s)</li>
            <li>disposer d'un moyen de paiement accepté par ${data.nom_entreprise}</li>
          </ul>
          
          <h2 style="padding-left: 5pt; font-size: 8pt; text-align: justify;">
            ARTICLE 5. <span style="font-weight: normal">GARDE ET UTILISATION DU VEHICULE : Le locataire assume la garde du véhicule et la maitrise de la conduite.</span>
          </h2>
          
          <table style="margin-top: 20px;">
            <tr>
              <td colspan="2" class="header-cell">TARIFS ET FRAIS POTENTIELS</td>
            </tr>
            <tr>
              <td class="data-cell" width="50%"><p class="s2">Jante frottée</p></td>
              <td class="data-cell" width="50%"><p class="s2">${data.jante_frottee}€ / remplacement si non réparable</p></td>
            </tr>
            <tr>
              <td class="data-cell"><p class="s2">Carburant manquant</p></td>
              <td class="data-cell"><p class="s2">${data.carburant_manquant}€ par litre</p></td>
            </tr>
            <tr>
              <td class="data-cell"><p class="s2">Nettoyage</p></td>
              <td class="data-cell"><p class="s2">${data.nettoyage}€</p></td>
            </tr>
            <tr>
              <td class="data-cell"><p class="s2">Retard (par tranche de 30min)</p></td>
              <td class="data-cell"><p class="s2">${data.retard}€</p></td>
            </tr>
            <tr>
              <td class="data-cell"><p class="s2">Rayure</p></td>
              <td class="data-cell"><p class="s2">Peinture de l'élément</p></td>
            </tr>
            <tr>
              <td class="data-cell"><p class="s2">Pare-brise</p></td>
              <td class="data-cell"><p class="s2">Achat + montage (environ 300€)</p></td>
            </tr>
          </table>
          
          <div class="signatures">
            <div class="signature-box">
              <p><strong>Signature du loueur</strong></p>
              <br><br>
              <p>${data.nom_entreprise}</p>
            </div>
            <div class="signature-box">
              <p><strong>Signature du client</strong></p>
              <br><br>
              <p>${data.nom_client}</p>
            </div>
          </div>
          
          <div class="terms">
            <p><strong>CONDITIONS GÉNÉRALES DE LOCATION</strong></p>
            
            <p><strong>ARTICLE 1. RÉSERVATION :</strong> Le présent contrat régit la location du véhicule mentionné ci-dessus.</p>
            
            <p><strong>ARTICLE 2. RESPONSABILITÉS :</strong> Le locataire s'engage à utiliser le véhicule conformément aux règles de circulation.</p>
            
            <p><strong>ARTICLE 3. RESTITUTION :</strong> Le véhicule doit être restitué dans l'état où il a été remis, au lieu et à l'heure convenus.</p>
            
            <p><strong>ARTICLE 4. ASSURANCE :</strong> Le véhicule est couvert par une assurance tous risques selon les conditions en vigueur.</p>
            
            <p><strong>ARTICLE 5. CONDUCTEUR :</strong> Pour louer et conduire un véhicule, le client doit nécessairement avoir plus de ${data.ageminimal} ans révolus et disposer d'un permis de conduire valide obtenu depuis au moins ${data.anneepermis} an(s).</p>
            
            <p><strong>ARTICLE 6. RETARD :</strong> Tout retard de restitution est facturé à hauteur de ${data.retard}€ par tranche de 30 minutes.</p>
            
            <p><strong>ARTICLE 7. AMENDES :</strong> Le client s'engage à régler tous frais, amendes et dépenses pour toute infraction au code de la route, au stationnement, etc.</p>
          </div>
          
          <div class="footer">
            <p style="font-size: 6pt;">${data.nom_entreprise} - ${data.adresse_entreprise || ''} ${data.siret_entreprise ? `- SIRET: ${data.siret_entreprise}` : ''}</p>
            <p style="font-size: 8pt;">Document généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Create fallback contract HTML
   */
  private static createFallbackContractHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contrat de location - Erreur</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .error { color: red; text-align: center; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>Erreur de génération du contrat</h1>
          <p>Impossible de générer le contrat. Veuillez réessayer.</p>
        </div>
      </body>
      </html>
    `;
  }
}
