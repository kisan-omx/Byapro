import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeHeader from '../../components/home/HomeHeader';
import SummaryCards from '../../components/home/SummaryCards';
import ExploreApp from '../../components/home/ExploreApp';
import Shortcuts from '../../components/home/Shortcuts';
import InventorySummary from '../../components/home/InventorySummary';
import { preloadParties } from '../../hooks/useParties';
import {
  preloadExpenseCategories,
  preloadContacts,
} from '../../components/quick-entry/PartySelectionModal';

export default function Home() {
  // Render Home immediately, then preload useful first chunk in background
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadParties();
      preloadContacts();
      preloadExpenseCategories();
    }, 250);
    return () => clearTimeout(timer);
  }, []);
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <HomeHeader />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mt-4">
        <SummaryCards />
        <ExploreApp />
        <Shortcuts />
        <InventorySummary />
      </ScrollView>
    </SafeAreaView>
  );
}