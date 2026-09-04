import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeHeader from '../../components/home/HomeHeader';
import SummaryCards from '../../components/home/SummaryCards';
import ExploreApp from '../../components/home/ExploreApp';
import Shortcuts from '../../components/home/Shortcuts';
import InventorySummary from '../../components/home/InventorySummary';

export default function Home() {
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