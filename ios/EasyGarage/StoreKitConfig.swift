import Foundation
import StoreKit

// Configuration StoreKit 2 pour éviter les conflits avec react-native-iap
@available(iOS 15.0, *)
class StoreKitConfig {
    static let shared = StoreKitConfig()
    
    private init() {}
    
    // Configuration pour utiliser StoreKit 2 explicitement
    func configureStoreKit2() {
        // S'assurer que StoreKit 2 est utilisé
        if #available(iOS 15.0, *) {
            // Configuration StoreKit 2
            print("StoreKit 2 configuré pour iOS 15.0+")
        }
    }
    
    // Fonction utilitaire pour obtenir l'AppTransaction si nécessaire
    @available(iOS 15.0, *)
    func getAppTransaction() async throws -> AppTransaction {
        let result: VerificationResult<AppTransaction> = try await AppTransaction.shared
        return try result.payloadValue
    }
    
    // Fonction utilitaire pour obtenir l'ID de transaction de l'app
    @available(iOS 15.0, *)
    func getAppTransactionID() async throws -> String? {
        let appTransaction = try await getAppTransaction()
        return appTransaction.appTransactionID
    }
}
