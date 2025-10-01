import { useState } from 'react';
import { Reservation, Client, Vehicle } from '@/contexts/DataContext';
import { CompanyInfo } from '@/contexts/SettingsContext';

interface UseContractModalReturn {
  isModalVisible: boolean;
  contractData: {
    reservation: Reservation | null;
    client: Client | null;
    vehicle: Vehicle | null;
    companyInfo: CompanyInfo | null;
    extraFees: any;
  };
  showContractModal: (
    reservation: Reservation,
    client: Client,
    vehicle: Vehicle,
    companyInfo: CompanyInfo,
    extraFees: any
  ) => void;
  hideContractModal: () => void;
}

export function useContractModal(): UseContractModalReturn {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [contractData, setContractData] = useState({
    reservation: null as Reservation | null,
    client: null as Client | null,
    vehicle: null as Vehicle | null,
    companyInfo: null as CompanyInfo | null,
    extraFees: null as any,
  });

  const showContractModal = (
    reservation: Reservation,
    client: Client,
    vehicle: Vehicle,
    companyInfo: CompanyInfo,
    extraFees: any
  ) => {
    setContractData({
      reservation,
      client,
      vehicle,
      companyInfo,
      extraFees,
    });
    setIsModalVisible(true);
  };

  const hideContractModal = () => {
    setIsModalVisible(false);
    setContractData({
      reservation: null,
      client: null,
      vehicle: null,
      companyInfo: null,
      extraFees: null,
    });
  };

  return {
    isModalVisible,
    contractData,
    showContractModal,
    hideContractModal,
  };
}
