// Script d'initialisation des plans d'abonnement EasyGarage dans Firestore
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Abonnement } from '../types/abonnement';

// Remplace par le chemin de ta clé de service Firebase
const serviceAccount = require('../config/serviceAccountKey.json');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

const abonnements: Abonnement[] = [
  {
    nom: 'Gratuit',
    prixMensuel: 0,
    description: '1 vehicule, 5 reservations, 1 utilisateur, EDL non stocke (local 24h), pas d\'export, pas de personnalisation, logo EasyGarage affiche',
    vehiculesMax: 1,
    reservationsMax: 5,
    utilisateursMax: 1,
    dureeStockageEDL: '24h',
    exportAutorise: false,
    personnalisationVisuelle: false,
    multiSociete: false,
    support: 'email',
  },
  {
    nom: 'Essentiel',
    prixMensuel: 6.99,
    prixHebdomadaire: 6.99,
    prixMensuelLegacy: 29,
    description: '5 vehicules, 50 reservations/mois, 1 utilisateur, EDL stocke 7 jours, export CSV/PDF, personnalisation logo et couleurs',
    vehiculesMax: 5,
    reservationsMax: 50,
    utilisateursMax: 1,
    dureeStockageEDL: '7 jours',
    exportAutorise: true,
    personnalisationVisuelle: true,
    multiSociete: false,
    support: 'email',
    productIds: {
      weekly: 'easygarage.essentiel.weekly',
      monthly: 'easygarage.essentiel'
    }
  },
  {
    nom: 'Pro',
    prixMensuel: 12.99,
    prixHebdomadaire: 12.99,
    prixMensuelLegacy: 49,
    description: '30 vehicules, reservations illimitees, 5 utilisateurs, EDL stocke 1 mois, statistiques avancees, support prioritaire',
    vehiculesMax: 30,
    reservationsMax: 'illimite',
    utilisateursMax: 5,
    dureeStockageEDL: '1 mois',
    exportAutorise: true,
    personnalisationVisuelle: true,
    multiSociete: false,
    support: 'prioritaire',
    productIds: {
      weekly: 'easygarage.pro.weekly',
      monthly: 'easygarage.pro'
    }
  },
  {
    nom: 'Premium',
    prixMensuel: 24.99,
    prixHebdomadaire: 24.99,
    prixMensuelLegacy: 99,
    description: 'Vehicules et utilisateurs illimites, EDL 1 an, multi-societes, automatisations, API adresse, support telephonique',
    vehiculesMax: 9999,
    reservationsMax: 'illimite',
    utilisateursMax: 'illimite',
    dureeStockageEDL: '1 an',
    exportAutorise: true,
    personnalisationVisuelle: true,
    multiSociete: true,
    support: 'telephone',
    productIds: {
      weekly: 'easygarage.premium.weekly',
      monthly: 'easygarage.premium'
    }
  },
];

async function main() {
  for (const ab of abonnements) {
    const ref = db.collection('Abonnements').doc(ab.nom.toLowerCase());
    await ref.set(ab);
    console.log(`Abonnement ${ab.nom} ajouté.`);
  }
  console.log('Tous les plans ont été initialisés.');
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 