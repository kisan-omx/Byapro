import React, { useState } from 'react';
import { View } from 'react-native';
import QuickEntryHeader from '../components/quick-entry/QuickEntryHeader';
import QuickEntryTabs, { EntryType } from '../components/quick-entry/QuickEntryTabs';
import PartySelector from '../components/quick-entry/PartySelector';
import AmountDisplay from '../components/quick-entry/AmountDisplay';
import RecordButton from '../components/quick-entry/RecordButton';
import Numpad from '../components/quick-entry/Numpad';

export default function QuickEntryScreen() {
  const [entryType, setEntryType] = useState<EntryType>('Sale');
  const [amount, setAmount] = useState<string>('');
  
  // Numpad logic
  const handlePress = React.useCallback((key: string) => {
    setAmount((prev) => {
      // Prevent multiple decimals in the last number
      if (key === '.') {
        const parts = prev.split(/[\+\-\*\/\%]/);
        const lastPart = parts[parts.length - 1];
        if (lastPart.includes('.')) return prev;
      }
      
      // Prevent starting with operator (except minus)
      if (['+', '*', '/', '%'].includes(key) && prev === '') {
        return prev;
      }

      // Replace last operator if a new one is typed
      if (['+', '-', '*', '/', '%'].includes(key)) {
        const lastChar = prev.slice(-1);
        if (['+', '-', '*', '/', '%'].includes(lastChar)) {
          return prev.slice(0, -1) + key;
        }
      }

      return prev + key;
    });
  }, []);

  const handleBackspace = React.useCallback(() => {
    setAmount((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = React.useCallback(() => {
    setAmount('');
  }, []);

  const handleCalculate = React.useCallback(() => {
    setAmount((currentAmount) => {
      try {
        if (!currentAmount) return currentAmount;
        
        // Remove trailing operators before calculating
        let expr = currentAmount;
        while (['+', '-', '*', '/', '%'].includes(expr.slice(-1))) {
          expr = expr.slice(0, -1);
        }
        
        if (!expr) return currentAmount;

        const result = new Function('return ' + expr)();
        
        // Format to avoid long decimals
        const formattedResult = Number.isInteger(result) 
          ? result.toString() 
          : parseFloat(result.toFixed(4)).toString();
          
        return formattedResult;
      } catch (error) {
        console.warn("Calculation error", error);
        return currentAmount;
      }
    });
  }, []);

  const handleRecord = React.useCallback(() => {
    handleCalculate();
    console.log(`Recording ${entryType} for amount`);
    // Here we would interact with our service/database
  }, [entryType, handleCalculate]);

  const getLiveResult = (expr: string) => {
    if (!expr) return '';
    // only show result if there is an operator
    if (!/[\+\-\*\/\%]/.test(expr)) return '';
    
    try {
      let cleanExpr = expr;
      while (['+', '-', '*', '/', '%'].includes(cleanExpr.slice(-1))) {
        cleanExpr = cleanExpr.slice(0, -1);
      }
      if (!cleanExpr) return '';
      // check again if there is an operator
      if (!/[\+\-\*\/\%]/.test(cleanExpr)) return ''; 
      
      const result = new Function('return ' + cleanExpr)();
      if (isNaN(result) || !isFinite(result)) return '';
      
      return Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(4)).toString();
    } catch (e) {
      return '';
    }
  };

  const liveResult = getLiveResult(amount);

  return (
    <View className="flex-1 bg-surface">
      <QuickEntryHeader />
      
      <QuickEntryTabs 
        selectedTab={entryType} 
        onSelectTab={setEntryType} 
      />
      
      <PartySelector 
        partyName={
          entryType === 'Sale' ? 'Cash Sale' : 
          entryType === 'Purchase' ? 'Cash Purchase' : 
          entryType === 'Expense' ? 'Select Category' : 'Party'
        }
        entryType={entryType}
        onPress={() => console.log('Open party selector')}
      />
      
      <AmountDisplay amount={amount} liveResult={liveResult} />
      
      <View className="bg-surface">
        <RecordButton 
          entryType={entryType} 
          amount={amount}
          onPress={handleRecord} 
        />
        
        <Numpad 
          onPress={handlePress}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onCalculate={handleCalculate}
        />
      </View>
    </View>
  );
}
