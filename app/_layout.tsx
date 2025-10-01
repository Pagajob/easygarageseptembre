import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DataProvider } from '@/contexts/DataContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <ThemeProvider>
        <SettingsProvider>
          <DataProvider>
            <NotificationProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="profile" />
                <Stack.Screen name="register" />
                <Stack.Screen name="subscription-success" />
                <Stack.Screen name="subscription-cancel" />
                <Stack.Screen name="cost-records" />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </NotificationProvider>
          </DataProvider>
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}