import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { X, Mail, Download, FileText } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ContractService, ContractData } from '@/services/contractService';
import { Reservation, Client, Vehicle } from '@/contexts/DataContext';
import { CompanyInfo } from '@/contexts/SettingsContext';

interface ContractModalProps {
  visible: boolean;
  reservation: Reservation;
  client: Client;
  vehicle: Vehicle;
  companyInfo: CompanyInfo;
  extraFees: any;
  onClose: () => void;
}

export default function ContractModal({
  visible,
  reservation,
  client,
  vehicle,
  companyInfo,
  extraFees,
  onClose
}: ContractModalProps) {
  const { colors } = useTheme();
  const [contractHTML, setContractHTML] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [contractUrl, setContractUrl] = useState<string>('');

  useEffect(() => {
    if (visible) {
      generateContractHTML();
    }
  }, [visible, reservation, client, vehicle, companyInfo, extraFees]);

  const generateContractHTML = async () => {
    setIsLoading(true);
    try {
      // Get enabled predefined fees
      const enabledPredefinedFees = extraFees.predefined?.filter((fee: any) => fee.enabled) || [];
      
      // Find specific fees
      const fuelFee = enabledPredefinedFees.find((fee: any) => fee.id === '1' && fee.label === 'Carburant manquant');
      const lateFee = enabledPredefinedFees.find((fee: any) => fee.id === '2' && fee.label.includes('Retard'));
      const rimFee = enabledPredefinedFees.find((fee: any) => fee.id === '3' && fee.label.includes('Jante'));
      const cleaningFee = enabledPredefinedFees.find((fee: any) => fee.id === '4' && fee.label.includes('Nettoyage'));

      // Format dates
      const dateDebut = new Date(reservation.dateDebut);
      const dateRetour = new Date(reservation.dateRetourPrevue);
      
      const formattedDateDebut = dateDebut.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      const formattedDateRetour = dateRetour.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Prepare contract data
      const contractData: ContractData = {
        nom_client: `${client.prenom} ${client.nom}`,
        adresse_client: 'Non spécifiée',
        email_client: client.email || '',
        telephone_client: client.telephone || 'Non spécifié',
        vehicule_marque: vehicle.marque,
        vehicule_modele: vehicle.modele,
        vehicule_immatriculation: vehicle.immatriculation,
        vehicule_carburant: vehicle.carburant,
        date_debut: formattedDateDebut,
        heure_debut: reservation.heureDebut,
        date_fin: formattedDateRetour,
        heure_fin: reservation.heureRetourPrevue,
        kilometrage_depart: reservation.kilometrageDepart?.toString() || 'À remplir',
        kilometrage_depart_edl: '',
        kilometrage_inclus: vehicle.kilometrageJournalier?.toString() || '',
        prixKmSupplementaire: vehicle.prixKmSupplementaire?.toString() || '0',
        cautiondepart: vehicle.cautionDepart?.toString() || '0',
        cautionRSV: vehicle.cautionRSV?.toString() || '0',
        nom_entreprise: companyInfo.nom || 'EasyGarage',
        adresse_entreprise: companyInfo.adresse || '',
        siret_entreprise: companyInfo.siret || '',
        ageminimal: vehicle.ageMinimal?.toString() || '21',
        anneepermis: vehicle.anneesPermis?.toString() || '2',
        retard: lateFee?.price.toString() || '25',
        carburant_manquant: fuelFee?.price.toString() || '3',
        jante_frottee: rimFee?.price.toString() || '150',
        nettoyage: cleaningFee?.price.toString() || '80',
        montant_location: reservation.montantLocation?.toString() || '0',
        reservation_id: reservation.id,
        date_generation: new Date().toISOString(),
        signature_client: '',
        logo_entreprise: companyInfo.logo || '',
        type_contrat: reservation.typeContrat || '',
        carburant_depart: '',
        carburant_max: '',
      };

      // Generate HTML content
      const html = generateContractHTMLContent(contractData);
      setContractHTML(html);
    } catch (error) {
      console.error('Error generating contract HTML:', error);
      Alert.alert('Erreur', 'Impossible de générer le contrat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!client.email) {
      Alert.alert(
        'Email manquant',
        'Le client n\'a pas d\'adresse email. Veuillez ajouter une adresse email au client pour pouvoir envoyer le contrat.'
      );
      return;
    }

    setIsSendingEmail(true);
    try {
      // Generate and upload contract PDF
      const pdfUrl = await ContractService.generateContract(
        reservation,
        client,
        vehicle,
        companyInfo,
        extraFees
      );
      
      setContractUrl(pdfUrl);

      // Send email with contract
      const success = await ContractService.sendContractByEmail(
        pdfUrl,
        client.email,
        reservation.userId,
        companyInfo.nom || 'EasyGarage',
        {
          nom_client: `${client.prenom} ${client.nom}`,
          vehicule_modele: `${vehicle.marque} ${vehicle.modele}`,
        } as ContractData
      );

      if (success) {
        Alert.alert(
          'Succès',
          'Le contrat a été envoyé par email au client avec succès.'
        );
      } else {
        Alert.alert(
          'Erreur',
          'Impossible d\'envoyer l\'email. Veuillez réessayer.'
        );
      }
    } catch (error) {
      console.error('Error sending contract email:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de l\'envoi du contrat.'
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  const generateContractHTMLContent = (data: ContractData): string => {
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
            background-color: white;
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
          .s1 { 
            color: black; 
            font-family:"Helvetica Neue", sans-serif; 
            font-style: normal; 
            font-weight: bold; 
            text-decoration: none; 
            font-size: 10pt; 
            text-align: center;
            padding-top: 5pt;
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
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
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
      </body>
      </html>
    `;
  };

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.text,
    },
    contractContainer: {
      flex: 1,
    },
    webViewContainer: {
      flex: 1,
      margin: 16,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 140,
      justifyContent: 'center',
    },
    actionButtonDisabled: {
      backgroundColor: colors.textSecondary,
    },
    actionButtonText: {
      color: colors.background,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      minWidth: 140,
      justifyContent: 'center',
    },
    secondaryButtonText: {
      color: colors.primary,
      fontWeight: 'bold',
      marginLeft: 8,
    },
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contrat de location</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Génération du contrat...</Text>
            </View>
          ) : (
            <View style={styles.contractContainer}>
              {contractHTML ? (
                <WebView
                  source={{ html: contractHTML }}
                  style={styles.webViewContainer}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  startInLoadingState={true}
                  renderLoading={() => (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text style={styles.loadingText}>Chargement du contrat...</Text>
                    </View>
                  )}
                />
              ) : (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Génération du contrat...</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              (isSendingEmail || !client.email) && styles.actionButtonDisabled
            ]}
            onPress={handleSendEmail}
            disabled={isSendingEmail || !client.email}
          >
            {isSendingEmail ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Mail size={20} color={colors.background} />
            )}
            <Text style={styles.actionButtonText}>
              {isSendingEmail ? 'Envoi...' : 'Envoyer au client'}
            </Text>
          </TouchableOpacity>

          {contractUrl && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                // Open PDF in browser or download
                if (Platform.OS === 'web') {
                  window.open(contractUrl, '_blank');
                } else {
                  // For mobile, you might want to use Linking.openURL
                  Alert.alert('PDF généré', 'Le contrat PDF est disponible pour téléchargement');
                }
              }}
            >
              <Download size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Télécharger PDF</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
