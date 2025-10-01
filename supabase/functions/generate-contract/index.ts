import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContractData {
  nom_client: string;
  adresse_client: string;
  email_client: string;
  telephone_client: string;
  vehicule_marque: string;
  vehicule_modele: string;
  vehicule_immatriculation: string;
  vehicule_carburant: string;
  date_debut: string;
  heure_debut: string;
  date_fin: string;
  heure_fin: string;
  kilometrage_depart: string;
  kilometrage_inclus: string;
  prixKmSupplementaire: string;
  cautiondepart: string;
  cautionRSV: string;
  nom_entreprise: string;
  adresse_entreprise: string;
  siret_entreprise: string;
  ageminimal: string;
  anneepermis: string;
  retard: string;
  carburant_manquant: string;
  jante_frottee: string;
  nettoyage: string;
  montant_location: string;
  reservation_id: string;
  type_contrat: string;
}

function generateContractHTML(data: ContractData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Contrat de location</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.4;
        }
        h1 { 
          color: black; 
          font-family:"Avenir Next", sans-serif; 
          font-style: normal; 
          font-weight: bold; 
          text-decoration: none; 
          font-size: 19pt; 
          text-align: center;
          padding-top: 3pt;
        }
        .s2 { 
          color: black; 
          font-family:"Helvetica Neue", sans-serif; 
          font-style: normal; 
          font-weight: normal; 
          text-decoration: none; 
          font-size: 8pt; 
          padding-left: 4pt;
        }
        table {
          width: 95%;
          border-collapse: collapse;
          margin-bottom: 20px;
          margin-left: 5.94292pt;
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
        .caution-table {
          background-color: #D5D5D5;
          border: 1pt solid #7F7F7F;
        }
        .caution-cell {
          padding: 8pt 4pt;
          font-weight: bold;
          font-size: 8pt;
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
      </style>
    </head>
    <body>
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
      
      <h2 style="padding-left: 5pt; font-size: 8pt; text-align: justify;">
        ARTICLE 1. <span style="font-weight: normal">RÉSERVATION DU VÉHICULE</span>
      </h2>
      
      <p style="padding-left: 5pt; font-size: 8pt; text-align: left;">
        Pour louer et conduire un véhicule ${data.nom_entreprise}, je dois nécessairement:
      </p>
      <ul style="list-style-type: disc; padding-left: 39pt; font-size: 8pt;">
        <li>avoir plus de ${data.ageminimal} ans révolus</li>
        <li>disposer d'un permis de conduire valide obtenu depuis au moins ${data.anneepermis} an(s)</li>
      </ul>
      
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
      
      <div style="margin-top: 50px; font-size: 6pt; text-align: right;">
        <p>${data.nom_entreprise} - ${data.adresse_entreprise || ''} ${data.siret_entreprise ? `- SIRET: ${data.siret_entreprise}` : ''}</p>
        <p style="font-size: 8pt;">Document généré le ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>
    </body>
    </html>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { contractData } = await req.json();

    if (!contractData) {
      return new Response(
        JSON.stringify({ error: "Missing contract data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const html = generateContractHTML(contractData as ContractData);

    return new Response(
      JSON.stringify({ 
        success: true,
        html: html,
        message: "Contract HTML generated successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating contract:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate contract",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});