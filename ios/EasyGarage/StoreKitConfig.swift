import Foundation
import StoreKit

// Configuration StoreKit 2 pour éviter les conflits avec react-native-iap
@available(iOS 15.0, *)
@MainActor
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
    // Compatible iOS 15+ (utilise AppTransaction au lieu de Transaction.appTransactionID)
    @available(iOS 15.0, *)
    func getAppTransactionID() async throws -> String? {
        let appTransaction = try await getAppTransaction()
        return appTransaction.appTransactionID
    }
    
    // Correctif principal : obtenir appTransactionID de manière compatible
    // iOS 18.4+ : Transaction.appTransactionID existe
    // iOS 15–18.3 : on passe par AppTransaction.shared
    @available(iOS 15.0, *)
    func appTxnID(from transaction: StoreKit.Transaction?) async throws -> String {
        // Essayer d'abord avec Transaction.appTransactionID si disponible (iOS 18.4+)
        if #available(iOS 18.4, *) {
            if let id = transaction?.appTransactionID {
                return id
            }
        }
        
        // Fallback : utiliser AppTransaction.shared (compatible iOS 15+)
        let verification: VerificationResult<AppTransaction> = try await AppTransaction.shared
        let appTxn = try verification.payloadValue
        return appTransaction.appTransactionID
    }
    
    // Fonction utilitaire pour gérer les transactions avec compatibilité
    @available(iOS 15.0, *)
    func processTransaction(_ transaction: StoreKit.Transaction) async throws {
        // Utiliser la fonction compatible pour obtenir l'ID
        let appTxnId = try await appTxnID(from: transaction)
        print("App Transaction ID: \(appTxnId)")
        
        // Traiter la transaction normalement
        // ... autres logiques de traitement
    }
}
