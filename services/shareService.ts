import { Platform, Alert, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export class ShareService {
  /**
   * Share a contract URL or file
   */
  static async shareContract(contractUrl: string, clientName: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // On web, use navigator.share or fallback to clipboard
        if (navigator.share) {
          await navigator.share({
            title: 'Contrat de location',
            text: `Contrat de location pour ${clientName}`,
            url: contractUrl
          });
          return true;
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(contractUrl);
          Alert.alert('Lien copié', 'Le lien du contrat a été copié dans le presse-papier');
          return true;
        }
      }

      // On mobile (iOS/Android)
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        // Fallback to React Native Share API
        await Share.share({
          message: `Voici votre contrat de location pour ${clientName}`,
          url: contractUrl,
          title: 'Contrat de location'
        });
        return true;
      }

      // Download the file first
      const fileName = `contrat_${clientName.replace(/\s/g, '_')}_${Date.now()}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      console.log('[ShareService] Downloading contract from:', contractUrl);
      console.log('[ShareService] To:', fileUri);

      const downloadResult = await FileSystem.downloadAsync(contractUrl, fileUri);

      if (downloadResult.status !== 200) {
        throw new Error('Failed to download contract');
      }

      console.log('[ShareService] Download successful, sharing file');

      // Share the downloaded file
      await Sharing.shareAsync(downloadResult.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Contrat de location - ${clientName}`,
        UTI: 'com.adobe.pdf'
      });

      return true;
    } catch (error) {
      console.error('[ShareService] Error sharing contract:', error);

      // Fallback: try to share just the URL
      try {
        await Share.share({
          message: `Contrat de location: ${contractUrl}`,
          title: 'Contrat de location'
        });
        return true;
      } catch (shareError) {
        console.error('[ShareService] Fallback share also failed:', shareError);
        Alert.alert(
          'Erreur de partage',
          'Impossible de partager le contrat. Vous pouvez copier le lien manuellement : ' + contractUrl
        );
        return false;
      }
    }
  }

  /**
   * Show contract sharing options
   */
  static showContractOptions(contractUrl: string, clientName: string, clientEmail: string) {
    Alert.alert(
      'Contrat généré avec succès',
      `Le contrat pour ${clientName} a été généré et uploadé.\n\nQue souhaitez-vous faire ?`,
      [
        {
          text: 'Partager',
          onPress: async () => {
            await this.shareContract(contractUrl, clientName);
          }
        },
        {
          text: 'Copier le lien',
          onPress: async () => {
            if (Platform.OS === 'web') {
              await navigator.clipboard.writeText(contractUrl);
            } else {
              // On mobile, use Share with just the URL
              await Share.share({
                message: contractUrl
              });
            }
            Alert.alert('Lien copié', 'Le lien du contrat est prêt à être partagé');
          }
        },
        {
          text: 'Voir le contrat',
          onPress: () => {
            // Open the contract URL
            if (Platform.OS === 'web') {
              window.open(contractUrl, '_blank');
            } else {
              import('expo-linking').then(({ openURL }) => {
                openURL(contractUrl);
              });
            }
          }
        },
        {
          text: 'Fermer',
          style: 'cancel'
        }
      ],
      { cancelable: true }
    );
  }
}
